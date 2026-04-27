import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function GET() {
  const checks = {
    env: {
      AUTH_SECRET: !!process.env.AUTH_SECRET,
      AUTH_URL: process.env.AUTH_URL || "NOT SET",
      AUTH_TRUST_HOST: process.env.AUTH_TRUST_HOST || "NOT SET",
      AUTH_GOOGLE_ID: !!process.env.AUTH_GOOGLE_ID,
      AUTH_GOOGLE_SECRET: !!process.env.AUTH_GOOGLE_SECRET,
      MONGODB_URI: !!process.env.MONGODB_URI,
    },
    mongodb: "pending",
  };

  try {
    await connectDB();
    checks.mongodb = "connected";
  } catch (err) {
    checks.mongodb = `FAILED: ${err.message}`;
  }

  return NextResponse.json(checks);
}
