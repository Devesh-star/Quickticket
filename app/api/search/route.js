import { connectDB } from "@/lib/mongodb";
import { Route } from "@/models/Route";
import { successResponse, errorResponse } from "@/lib/api";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const from = searchParams.get("from")?.trim();
    const to = searchParams.get("to")?.trim();
    const type = searchParams.get("type");
    const travelers = parseInt(searchParams.get("travelers") ?? "1");

    if (!from || !to) return errorResponse("Please provide both from and to cities", 400);

    await connectDB();

    const query = {
      fromCity: { $regex: from, $options: "i" },
      toCity: { $regex: to, $options: "i" },
      seatsLeft: { $gte: travelers },
    };
    if (type && ["flight", "train", "bus"].includes(type)) query.type = type;

    const routes = await Route.find(query).sort({ price: 1 }).lean();
    const results = routes.map((r) => ({ ...r, id: r._id.toString(), _id: r._id.toString() }));

    return successResponse({ routes: results, count: results.length });
  } catch (error) {
    console.error("[SEARCH]", error);
    return errorResponse("Search failed", 500);
  }
}
