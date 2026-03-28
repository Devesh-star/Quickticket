import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { Booking } from "@/models/Booking";
import { successResponse, errorResponse } from "@/lib/api";

export async function DELETE(_req, { params }) {
  try {
    const session = await auth();
    if (!session?.user?.id) return errorResponse("Unauthorized", 401);
    await connectDB();
    const booking = await Booking.findById(params.id);
    if (!booking) return errorResponse("Booking not found", 404);
    if (booking.userId.toString() !== session.user.id) return errorResponse("Forbidden", 403);
    if (booking.status === "Cancelled") return errorResponse("Already cancelled", 400);
    booking.status = "Cancelled";
    await booking.save();
    return successResponse({ message: "Booking cancelled" });
  } catch (error) {
    console.error("[CANCEL BOOKING]", error);
    return errorResponse("Failed to cancel", 500);
  }
}
