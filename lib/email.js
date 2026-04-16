import nodemailer from "nodemailer";

function createTransporter() {
  const host = process.env.EMAIL_HOST;
  const port = process.env.EMAIL_PORT;
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!host || !user || !pass) {
    return null; // SMTP not configured
  }

  return nodemailer.createTransport({
    host,
    port: parseInt(port) || 587,
    secure: parseInt(port) === 465,
    auth: { user, pass },
  });
}

export async function sendBookingConfirmation(booking, userEmail, userName) {
  const transporter = createTransporter();

  const typeEmoji = booking.type === "flight" ? "✈️" : booking.type === "train" ? "🚂" : "🚌";
  const typeLabel = booking.type.charAt(0).toUpperCase() + booking.type.slice(1);

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#0a0a14;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 20px;">

    <!-- Header -->
    <div style="text-align:center;margin-bottom:32px;">
      <div style="display:inline-block;background:#f97316;border-radius:12px;padding:10px 14px;margin-bottom:12px;">
        <span style="color:#fff;font-weight:900;font-size:18px;letter-spacing:1px;">QT</span>
      </div>
      <h1 style="color:#fff;font-size:24px;margin:8px 0 4px;">Booking Confirmed! 🎉</h1>
      <p style="color:#9ca3af;font-size:14px;margin:0;">Your trip is all set, ${userName || "Traveler"}.</p>
    </div>

    <!-- Main Card -->
    <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:28px;margin-bottom:24px;">

      <!-- Booking Ref -->
      <div style="text-align:center;margin-bottom:24px;padding-bottom:20px;border-bottom:1px solid rgba(255,255,255,0.08);">
        <p style="color:#6b7280;font-size:11px;text-transform:uppercase;letter-spacing:2px;margin:0 0 6px;">Booking Reference</p>
        <p style="color:#f97316;font-size:28px;font-weight:900;letter-spacing:3px;margin:0;font-family:monospace;">${booking.bookingRef}</p>
      </div>

      <!-- Route -->
      <div style="text-align:center;margin-bottom:20px;">
        <p style="color:#9ca3af;font-size:12px;margin:0 0 4px;">${typeEmoji} ${typeLabel} · ${booking.operator}</p>
        <p style="color:#fff;font-size:20px;font-weight:700;margin:0;">
          ${booking.fromCity} <span style="color:#6b7280;">→</span> ${booking.toCity}
        </p>
      </div>

      <!-- Details Grid -->
      <table style="width:100%;border-collapse:collapse;" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding:8px 0;color:#9ca3af;font-size:13px;">Date</td>
          <td style="padding:8px 0;color:#fff;font-size:13px;text-align:right;font-weight:500;">${booking.departDate}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#9ca3af;font-size:13px;">Time</td>
          <td style="padding:8px 0;color:#fff;font-size:13px;text-align:right;font-weight:500;">${booking.departure || "—"} → ${booking.arrival || "—"}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#9ca3af;font-size:13px;">Duration</td>
          <td style="padding:8px 0;color:#fff;font-size:13px;text-align:right;font-weight:500;">${booking.duration || "—"}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#9ca3af;font-size:13px;">Class</td>
          <td style="padding:8px 0;color:#fff;font-size:13px;text-align:right;font-weight:500;">${booking.seatClass}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#9ca3af;font-size:13px;">Travelers</td>
          <td style="padding:8px 0;color:#fff;font-size:13px;text-align:right;font-weight:500;">${booking.travelers}</td>
        </tr>
        ${booking.selectedSeats?.length > 0 ? `
        <tr>
          <td style="padding:8px 0;color:#9ca3af;font-size:13px;">Seats</td>
          <td style="padding:8px 0;color:#f97316;font-size:13px;text-align:right;font-weight:700;font-family:monospace;">${booking.selectedSeats.join(", ")}</td>
        </tr>` : ""}
      </table>

      <!-- Total -->
      <div style="margin-top:20px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.08);text-align:center;">
        <p style="color:#6b7280;font-size:11px;text-transform:uppercase;letter-spacing:1px;margin:0 0 4px;">Total Paid</p>
        <p style="color:#f97316;font-size:32px;font-weight:900;margin:0;">₹${(booking.totalPrice ?? 0).toLocaleString("en-IN")}</p>
      </div>
    </div>

    <!-- CTA -->
    <div style="text-align:center;margin-bottom:24px;">
      <a href="${process.env.AUTH_URL || process.env.NEXTAUTH_URL || "http://localhost:3000"}/dashboard"
         style="display:inline-block;background:#f97316;color:#fff;font-weight:600;padding:14px 32px;border-radius:12px;text-decoration:none;font-size:14px;">
        View My Bookings →
      </a>
    </div>

    <!-- Footer -->
    <div style="text-align:center;padding-top:20px;border-top:1px solid rgba(255,255,255,0.05);">
      <p style="color:#4b5563;font-size:12px;margin:0;">QuickTicket — Travel Smarter, Book Faster.</p>
      <p style="color:#374151;font-size:11px;margin:8px 0 0;">This is an automated confirmation. Please do not reply.</p>
    </div>

  </div>
</body>
</html>`;

  const mailOptions = {
    from: `"QuickTicket" <${process.env.EMAIL_USER || "noreply@quickticket.com"}>`,
    to: userEmail,
    subject: `✅ Booking Confirmed — ${booking.bookingRef} | ${booking.fromCity} → ${booking.toCity}`,
    html,
  };

  if (!transporter) {
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📧 EMAIL (SMTP not configured — logging to console)");
    console.log(`   To: ${userEmail}`);
    console.log(`   Subject: ${mailOptions.subject}`);
    console.log(`   Booking: ${booking.bookingRef}`);
    console.log(`   Route: ${booking.fromCity} → ${booking.toCity}`);
    console.log(`   Total: ₹${(booking.totalPrice ?? 0).toLocaleString("en-IN")}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    return;
  }

  try {
    await transporter.sendMail(mailOptions);
    console.log(`[EMAIL] Confirmation sent to ${userEmail} for ${booking.bookingRef}`);
  } catch (error) {
    console.error("[EMAIL ERROR]", error.message);
  }
}
