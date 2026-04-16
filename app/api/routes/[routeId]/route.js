import { connectDB } from "@/lib/mongodb";
import { Route } from "@/models/Route";
import { successResponse, errorResponse } from "@/lib/api";

export async function GET(req, { params }) {
  try {
    const { routeId } = await params;

    await connectDB();
    const route = await Route.findById(routeId).lean();
    if (!route) return errorResponse("Route not found", 404);

    return successResponse({
      route: { ...route, id: route._id.toString(), _id: route._id.toString() },
    });
  } catch (error) {
    console.error("[GET ROUTE]", error);
    return errorResponse("Failed to fetch route", 500);
  }
}
