import { stripe } from "@/lib/stripe";
import { connectDB } from "@/lib/mongodb";
import { Booking } from "@/models/Booking";
import { Route } from "@/models/Route";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function POST(req) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("[WEBHOOK SIGNATURE ERROR]", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    try {
      await connectDB();
      const booking = await Booking.findOne({
        stripeSessionId: session.id,
      });

      if (booking && booking.paymentStatus !== "Paid") {
        const dbSession = await mongoose.startSession();
        await dbSession.withTransaction(async () => {
          booking.paymentStatus = "Paid";
          booking.status = "Confirmed";
          await booking.save({ session: dbSession });

          await Route.findOneAndUpdate(
            {
              type: booking.type,
              fromCity: booking.fromCity,
              toCity: booking.toCity,
              operator: booking.operator,
            },
            { $inc: { seatsLeft: -booking.travelers } },
            { session: dbSession }
          );
        });
        await dbSession.endSession();
      }
    } catch (error) {
      console.error("[WEBHOOK PROCESSING ERROR]", error);
      return NextResponse.json(
        { error: "Webhook processing failed" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ received: true });
}
