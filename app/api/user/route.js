import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { successResponse, errorResponse } from "@/lib/api";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return errorResponse("Unauthorized", 401);
    await connectDB();
    const user = await User.findById(session.user.id).lean();
    if (!user) return errorResponse("User not found", 404);
    return successResponse({ user: { ...user, id: user._id.toString(), _id: user._id.toString() } });
  } catch (error) {
    console.error("[GET USER]", error);
    return errorResponse("Failed to fetch user", 500);
  }
}
