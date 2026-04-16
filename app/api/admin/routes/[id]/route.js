import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { Route } from "@/models/Route";
import { User } from "@/models/User";
import { errorResponse, successResponse } from "@/lib/api";

export async function PUT(req, { params }) {
  try {
    const session = await auth();
    if (!session?.user?.id) return errorResponse("Unauthorized", 401);

    await connectDB();
    const user = await User.findById(session.user.id).select("role").lean();
    if (user?.role !== "admin") return errorResponse("Forbidden", 403);

    const { id } = await params;
    const body = await req.json();

    const route = await Route.findByIdAndUpdate(
      id,
      {
        type: body.type,
        fromCity: body.fromCity,
        toCity: body.toCity,
        price: parseInt(body.price),
        duration: body.duration || "",
        operator: body.operator,
        departure: body.departure || "",
        arrival: body.arrival || "",
        totalSeats: parseInt(body.totalSeats) || 30,
      },
      { new: true }
    );

    if (!route) return errorResponse("Route not found", 404);

    return successResponse({
      route: { ...route.toObject(), id: route._id.toString(), _id: route._id.toString() },
    });
  } catch (error) {
    console.error("[ADMIN ROUTE PUT]", error);
    return errorResponse("Failed to update route", 500);
  }
}

export async function DELETE(req, { params }) {
  try {
    const session = await auth();
    if (!session?.user?.id) return errorResponse("Unauthorized", 401);

    await connectDB();
    const user = await User.findById(session.user.id).select("role").lean();
    if (user?.role !== "admin") return errorResponse("Forbidden", 403);

    const { id } = await params;
    const route = await Route.findByIdAndDelete(id);
    if (!route) return errorResponse("Route not found", 404);

    return successResponse({ message: "Route deleted" });
  } catch (error) {
    console.error("[ADMIN ROUTE DELETE]", error);
    return errorResponse("Failed to delete route", 500);
  }
}
