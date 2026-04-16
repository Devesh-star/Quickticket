import { connectDB } from "@/lib/mongodb";
import { Route } from "@/models/Route";
import { NextResponse } from "next/server";

// GET /api/seats/[routeId] — returns booked seats for real-time updates
export async function GET(req, { params }) {
  try {
    await connectDB();
    const route = await Route.findById(params.routeId).select("bookedSeats totalSeats seatsLeft type").lean();
    if (!route) {
      return NextResponse.json({ success: false, error: "Route not found" }, { status: 404 });
    }
    return NextResponse.json({
      success: true,
      data: {
        bookedSeats: route.bookedSeats || [],
        totalSeats: route.totalSeats || 30,
        seatsLeft: route.seatsLeft,
        type: route.type,
      },
    });
  } catch (error) {
    console.error("[GET SEATS]", error);
    return NextResponse.json({ success: false, error: "Failed to fetch seats" }, { status: 500 });
  }
}
