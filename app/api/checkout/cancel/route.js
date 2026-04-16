import { redirect } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import { Booking } from "@/models/Booking";
import { Route } from "@/models/Route";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const bookingId = searchParams.get("booking_id");
  const routeId = searchParams.get("route_id");
  const seatsParam = searchParams.get("seats");

  if (bookingId) {
    try {
      await connectDB();

      // Delete the pending booking
      const booking = await Booking.findOneAndDelete({
        _id: bookingId,
        paymentStatus: "Pending",
      });

      // Release the reserved seats back
      if (booking && routeId && seatsParam) {
        const seats = seatsParam.split(",").filter(Boolean);
        if (seats.length > 0) {
          await Route.findByIdAndUpdate(routeId, {
            $pullAll: { bookedSeats: seats },
            $inc: { seatsLeft: seats.length },
          });
        }
      }
    } catch (error) {
      console.error("[CHECKOUT CANCEL]", error);
    }
  }

  redirect("/?cancelled=true");
}
