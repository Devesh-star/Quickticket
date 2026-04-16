import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { Booking } from "@/models/Booking";
import { User } from "@/models/User";
import { errorResponse, successResponse } from "@/lib/api";

export async function GET(req) {
  try {
    const session = await auth();
    if (!session?.user?.id) return errorResponse("Unauthorized", 401);

    await connectDB();
    const user = await User.findById(session.user.id).select("role").lean();
    if (user?.role !== "admin") return errorResponse("Forbidden", 403);

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const query = {};
    if (status && ["Confirmed", "Cancelled"].includes(status)) {
      query.status = status;
    }

    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Booking.countDocuments(query),
    ]);

    // Get user emails for each booking
    const userIds = [...new Set(bookings.map((b) => b.userId.toString()))];
    const users = await User.find({ _id: { $in: userIds } }).select("name email").lean();
    const userMap = Object.fromEntries(users.map((u) => [u._id.toString(), u]));

    const serialized = bookings.map((b) => ({
      ...b,
      id: b._id.toString(),
      _id: b._id.toString(),
      userId: b.userId.toString(),
      userName: userMap[b.userId.toString()]?.name || "Unknown",
      userEmail: userMap[b.userId.toString()]?.email || "Unknown",
      createdAt: b.createdAt ? new Date(b.createdAt).toISOString() : null,
      updatedAt: b.updatedAt ? new Date(b.updatedAt).toISOString() : null,
    }));

    return successResponse({
      bookings: serialized,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("[ADMIN BOOKINGS]", error);
    return errorResponse("Failed to fetch bookings", 500);
  }
}
