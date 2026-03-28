import { redirect } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import { Booking } from "@/models/Booking";
import { Route } from "@/models/Route";
import { stripe } from "@/lib/stripe";
import mongoose from "mongoose";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("session_id");

  if (!sessionId) {
    redirect("/dashboard?payment=failed");
  }

  try {
    // Retrieve the checkout session from Stripe to verify payment
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);

    if (checkoutSession.payment_status !== "paid") {
      redirect("/dashboard?payment=failed");
    }

    await connectDB();

    // Find and update the booking
    const booking = await Booking.findOne({ stripeSessionId: sessionId });

    if (booking && booking.paymentStatus !== "Paid") {
      const dbSession = await mongoose.startSession();
      await dbSession.withTransaction(async () => {
        booking.paymentStatus = "Paid";
        booking.status = "Confirmed";
        await booking.save({ session: dbSession });

        // Decrement seats
        await Route.findOneAndUpdate(
          {
            type: booking.type,
            fromCity: booking.fromCity,
            toCity: booking.toCity,
            operator: booking.operator,
          },
          { $inc: { seatsLeft: -booking.travelers } },
          { session: dbSession }
        );
      });
      await dbSession.endSession();
    }
  } catch (error) {
    console.error("[CHECKOUT SUCCESS]", error);
  }

  redirect("/dashboard?payment=success");
}
