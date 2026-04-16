import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { Booking } from "@/models/Booking";
import { User } from "@/models/User";
import { Route } from "@/models/Route";
import { errorResponse, successResponse } from "@/lib/api";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return errorResponse("Unauthorized", 401);

    await connectDB();
    const user = await User.findById(session.user.id).select("role").lean();
    if (user?.role !== "admin") return errorResponse("Forbidden", 403);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [
      totalBookings,
      totalRevenue,
      totalUsers,
      usersThisMonth,
      usersLastMonth,
      bookingsThisMonth,
      revenueByType,
    ] = await Promise.all([
      Booking.countDocuments(),
      Booking.aggregate([
        { $match: { paymentStatus: "Paid" } },
        { $group: { _id: null, total: { $sum: "$totalPrice" } } },
      ]),
      User.countDocuments(),
      User.countDocuments({ createdAt: { $gte: startOfMonth } }),
      User.countDocuments({ createdAt: { $gte: startOfLastMonth, $lt: startOfMonth } }),
      Booking.countDocuments({ createdAt: { $gte: startOfMonth } }),
      Booking.aggregate([
        { $match: { paymentStatus: "Paid" } },
        { $group: { _id: "$type", count: { $sum: 1 }, revenue: { $sum: "$totalPrice" } } },
      ]),
    ]);

    return successResponse({
      totalBookings,
      totalRevenue: totalRevenue[0]?.total ?? 0,
      totalUsers,
      usersThisMonth,
      usersLastMonth,
      bookingsThisMonth,
      revenueByType: revenueByType.reduce((acc, r) => {
        acc[r._id] = { count: r.count, revenue: r.revenue };
        return acc;
      }, {}),
    });
  } catch (error) {
    console.error("[ADMIN STATS]", error);
    return errorResponse("Failed to fetch stats", 500);
  }
}
