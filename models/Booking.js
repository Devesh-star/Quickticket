import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, enum: ["flight", "train", "bus"], required: true },
    fromCity: { type: String, required: true },
    toCity: { type: String, required: true },
    operator: { type: String, required: true },
    departure: { type: String },
    arrival: { type: String },
    duration: { type: String },
    departDate: { type: String, required: true },
    returnDate: { type: String },
    travelers: { type: Number, required: true, default: 1 },
    seatClass: { type: String, required: true },
    pricePerPerson: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    bookingRef: { type: String, required: true, unique: true },
    status: { type: String, enum: ["Confirmed", "Cancelled"], default: "Confirmed" },
    paymentMethod: { type: String, default: "Card" },
    paymentStatus: { type: String, enum: ["Pending", "Paid", "Failed"], default: "Pending" },
    stripeSessionId: { type: String },
    selectedSeats: { type: [String], default: [] },
  },
  { timestamps: true }
);

export const Booking = mongoose.models?.Booking ?? mongoose.model("Booking", BookingSchema);