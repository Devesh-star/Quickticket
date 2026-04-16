import mongoose from "mongoose";

const RouteSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["flight", "train", "bus"], required: true },
    fromCity: { type: String, required: true },
    toCity: { type: String, required: true },
    price: { type: Number, required: true },
    duration: { type: String },
    operator: { type: String },
    departure: { type: String },
    arrival: { type: String },
    seatsLeft: { type: Number, default: 50 },
    bookedSeats: { type: [String], default: [] },
    totalSeats: { type: Number, default: 30 },
  },
  { timestamps: true }
);

export const Route = mongoose.models?.Route ?? mongoose.model("Route", RouteSchema);