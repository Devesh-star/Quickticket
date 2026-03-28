import { NextResponse } from "next/server";

export function successResponse(data, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function errorResponse(message, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export function generateBookingRef() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const random = Array.from(
    { length: 6 },
    () => chars[Math.floor(Math.random() * chars.length)]
  ).join("");
  return `QT-${random}`;
}
