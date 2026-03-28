import mongoose from "mongoose";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { Booking } from "@/models/Booking";
import { Route } from "@/models/Route";
import { stripe } from "@/lib/stripe";
import { errorResponse, generateBookingRef } from "@/lib/api";
import { NextResponse } from "next/server";

const CLASS_MULTIPLIER = {
  Economy: 1, Business: 2.5, "First Class": 4,
  Sleeper: 1, "3AC": 1.5, "2AC": 2, "1AC": 3,
  Seater: 1, "AC Sleeper": 1.8,
};

export async function POST(req) {
  try {
    const session = await auth();
    if (!session?.user?.id) return errorResponse("Please sign in to book", 401);

    const body = await req.json();
    const { routeId, travelers, seatClass, departDate, returnDate } = body;
    if (!routeId || !travelers || !seatClass || !departDate)
      return errorResponse("Missing required fields", 400);

    await connectDB();
    const route = await Route.findById(routeId);
    if (!route) return errorResponse("Route not found", 404);
    if (route.seatsLeft < travelers)
      return errorResponse(`Only ${route.seatsLeft} seats available`, 400);

    const multiplier = CLASS_MULTIPLIER[seatClass] ?? 1;
    const pricePerPerson = Math.round(route.price * multiplier);
    const totalPrice = pricePerPerson * travelers;
    const bookingRef = generateBookingRef();

    // Create a pending booking
    const booking = await Booking.create({
      userId: new mongoose.Types.ObjectId(session.user.id),
      type: route.type,
      fromCity: route.fromCity,
      toCity: route.toCity,
      operator: route.operator,
      departure: route.departure,
      arrival: route.arrival,
      duration: route.duration,
      departDate,
      returnDate: returnDate || undefined,
      travelers,
      seatClass,
      pricePerPerson,
      totalPrice,
      bookingRef,
      status: "Confirmed",
      paymentMethod: "Card",
      paymentStatus: "Pending",
    });

    // Create Stripe Checkout Session
    const baseUrl = process.env.AUTH_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";

    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: `${route.type.charAt(0).toUpperCase() + route.type.slice(1)} — ${route.fromCity} → ${route.toCity}`,
              description: `${route.operator} · ${seatClass} · ${departDate} · ${travelers} traveler(s)`,
            },
            unit_amount: pricePerPerson * 100, // Stripe uses smallest currency unit (paise)
          },
          quantity: travelers,
        },
      ],
      metadata: {
        bookingId: booking._id.toString(),
        routeId,
      },
      success_url: `${baseUrl}/api/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/api/checkout/cancel?booking_id=${booking._id.toString()}`,
    });

    // Save the stripe session ID to the booking
    booking.stripeSessionId = checkoutSession.id;
    await booking.save();

    return NextResponse.json({
      success: true,
      data: { url: checkoutSession.url },
    });
  } catch (error) {
    console.error("[CHECKOUT]", error);
    return errorResponse("Failed to create checkout session. Please try again.", 500);
  }
}
