import mongoose from "mongoose";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { Booking } from "@/models/Booking";
import { Route } from "@/models/Route";
import { successResponse, errorResponse, generateBookingRef } from "@/lib/api";

const CLASS_MULTIPLIER = {
  Economy: 1, Business: 2.5, "First Class": 4,
  Sleeper: 1, "3AC": 1.5, "2AC": 2, "1AC": 3,
  Seater: 1, "AC Sleeper": 1.8,
};

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return errorResponse("Unauthorized", 401);
    await connectDB();
    const bookings = await Booking.find({ userId: session.user.id }).sort({ createdAt: -1 }).lean();
    const serialized = bookings.map((b) => ({
      ...b, id: b._id.toString(), _id: b._id.toString(), userId: b.userId.toString(),
    }));
    return successResponse({ bookings: serialized });
  } catch (error) {
    console.error("[GET BOOKINGS]", error);
    return errorResponse("Failed to fetch bookings", 500);
  }
}

export async function POST(req) {
  try {
    const session = await auth();
    if (!session?.user?.id) return errorResponse("Please sign in to book", 401);

    const body = await req.json();
    const { routeId, travelers, seatClass, departDate, returnDate, paymentMethod } = body;
    if (!routeId || !travelers || !seatClass || !departDate) return errorResponse("Missing required fields", 400);

    await connectDB();
    const route = await Route.findById(routeId);
    if (!route) return errorResponse("Route not found", 404);
    if (route.seatsLeft < travelers) return errorResponse(`Only ${route.seatsLeft} seats available`, 400);

    const multiplier = CLASS_MULTIPLIER[seatClass] ?? 1;
    const pricePerPerson = Math.round(route.price * multiplier);
    const totalPrice = pricePerPerson * travelers;

    const dbSession = await mongoose.startSession();
    let booking;
    await dbSession.withTransaction(async () => {
      const [newBooking] = await Booking.create([{
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
        bookingRef: generateBookingRef(),
        status: "Confirmed",
        paymentMethod: paymentMethod || "Card",
        paymentStatus: "Paid",
      }], { session: dbSession });
      await Route.findByIdAndUpdate(routeId, { $inc: { seatsLeft: -travelers } }, { session: dbSession });
      booking = newBooking;
    });
    await dbSession.endSession();

    return successResponse({
      booking: { ...booking.toObject(), id: booking._id.toString(), _id: booking._id.toString(), userId: booking.userId.toString() },
      message: "Booking confirmed!",
    }, 201);
  } catch (error) {
    console.error("[CREATE BOOKING]", error);
    return errorResponse("Booking failed. Please try again.", 500);
  }
}
