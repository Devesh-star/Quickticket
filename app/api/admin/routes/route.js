import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { Route } from "@/models/Route";
import { User } from "@/models/User";
import { errorResponse, successResponse } from "@/lib/api";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return errorResponse("Unauthorized", 401);

    await connectDB();
    const user = await User.findById(session.user.id).select("role").lean();
    if (user?.role !== "admin") return errorResponse("Forbidden", 403);

    const routes = await Route.find().sort({ createdAt: -1 }).limit(100).lean();
    const serialized = routes.map((r) => ({
      ...r,
      id: r._id.toString(),
      _id: r._id.toString(),
    }));

    return successResponse({ routes: serialized });
  } catch (error) {
    console.error("[ADMIN ROUTES GET]", error);
    return errorResponse("Failed to fetch routes", 500);
  }
}

export async function POST(req) {
  try {
    const session = await auth();
    if (!session?.user?.id) return errorResponse("Unauthorized", 401);

    await connectDB();
    const user = await User.findById(session.user.id).select("role").lean();
    if (user?.role !== "admin") return errorResponse("Forbidden", 403);

    const body = await req.json();
    const { type, fromCity, toCity, price, duration, operator, departure, arrival, totalSeats } = body;

    if (!type || !fromCity || !toCity || !price || !operator) {
      return errorResponse("Missing required fields (type, fromCity, toCity, price, operator)", 400);
    }

    const route = await Route.create({
      type,
      fromCity,
      toCity,
      price: parseInt(price),
      duration: duration || "",
      operator,
      departure: departure || "",
      arrival: arrival || "",
      totalSeats: parseInt(totalSeats) || 30,
      seatsLeft: parseInt(totalSeats) || 30,
      bookedSeats: [],
    });

    return successResponse(
      { route: { ...route.toObject(), id: route._id.toString(), _id: route._id.toString() } },
      201
    );
  } catch (error) {
    console.error("[ADMIN ROUTES POST]", error);
    return errorResponse("Failed to create route", 500);
  }
}
