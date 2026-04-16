import { redirect } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import { Booking } from "@/models/Booking";
import { User } from "@/models/User";
import { stripe } from "@/lib/stripe";
import { sendBookingConfirmation } from "@/lib/email";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("session_id");

  if (!sessionId) {
    redirect("/dashboard?payment=failed");
  }

  try {
    // Retrieve the checkout session from Stripe to verify payment
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);

    if (checkoutSession.payment_status !== "paid") {
      redirect("/dashboard?payment=failed");
    }

    await connectDB();

    // Find and update the booking (seats are already reserved at checkout time)
    const booking = await Booking.findOne({ stripeSessionId: sessionId });

    if (booking && booking.paymentStatus !== "Paid") {
      booking.paymentStatus = "Paid";
      booking.status = "Confirmed";
      await booking.save();
      // Note: seatsLeft was already decremented and bookedSeats were already
      // updated when the checkout session was created, so no need to do it again.

      // Send confirmation email (fire-and-forget so redirect isn't blocked)
      try {
        const user = await User.findById(booking.userId).lean();
        if (user?.email) {
          sendBookingConfirmation(booking.toObject(), user.email, user.name).catch((err) =>
            console.error("[EMAIL ASYNC ERROR]", err.message)
          );
        }
      } catch (emailErr) {
        console.error("[EMAIL LOOKUP ERROR]", emailErr.message);
      }
    }
  } catch (error) {
    console.error("[CHECKOUT SUCCESS]", error);
  }

  redirect("/dashboard?payment=success");
}
