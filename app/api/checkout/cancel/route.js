import { redirect } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import { Booking } from "@/models/Booking";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const bookingId = searchParams.get("booking_id");

  if (bookingId) {
    try {
      await connectDB();
      // Delete the pending booking if user cancelled
      await Booking.findOneAndDelete({
        _id: bookingId,
        paymentStatus: "Pending",
      });
    } catch (error) {
      console.error("[CHECKOUT CANCEL]", error);
    }
  }

  redirect("/?cancelled=true");
}
