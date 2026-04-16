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
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const operators = searchParams.get("operators"); // comma-separated

    if (!from || !to) return errorResponse("Please provide both from and to cities", 400);

    await connectDB();

    const query = {
      fromCity: { $regex: from, $options: "i" },
      toCity: { $regex: to, $options: "i" },
      seatsLeft: { $gte: travelers },
    };

    // Type filter — support "all" or specific type
    if (type && type !== "all" && ["flight", "train", "bus"].includes(type)) {
      query.type = type;
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseInt(minPrice);
      if (maxPrice) query.price.$lte = parseInt(maxPrice);
    }

    // Operators filter
    if (operators) {
      const opList = operators.split(",").map((o) => o.trim()).filter(Boolean);
      if (opList.length > 0) {
        query.operator = { $in: opList };
      }
    }

    const routes = await Route.find(query).sort({ price: 1 }).lean();
    const results = routes.map((r) => ({ ...r, id: r._id.toString(), _id: r._id.toString() }));

    // Get all distinct operators and price range for the filter sidebar
    const filterQuery = {
      fromCity: { $regex: from, $options: "i" },
      toCity: { $regex: to, $options: "i" },
      seatsLeft: { $gte: travelers },
    };
    if (type && type !== "all" && ["flight", "train", "bus"].includes(type)) {
      filterQuery.type = type;
    }

    const [allOperators, priceRange] = await Promise.all([
      Route.distinct("operator", filterQuery),
      Route.aggregate([
        { $match: filterQuery },
        { $group: { _id: null, min: { $min: "$price" }, max: { $max: "$price" } } },
      ]),
    ]);

    return successResponse({
      routes: results,
      count: results.length,
      filters: {
        operators: allOperators.sort(),
        priceRange: {
          min: priceRange[0]?.min ?? 0,
          max: priceRange[0]?.max ?? 10000,
        },
      },
    });
  } catch (error) {
    console.error("[SEARCH]", error);
    return errorResponse("Search failed", 500);
  }
}
