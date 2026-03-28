// scripts/seed.cjs
// Run with: node scripts/seed.cjs

require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI is missing in .env.local");
  process.exit(1);
}

const RouteSchema = new mongoose.Schema({
  type: String,
  fromCity: String,
  toCity: String,
  price: Number,
  duration: String,
  operator: String,
  departure: String,
  arrival: String,
  seatsLeft: Number,
});

const Route = mongoose.models.Route || mongoose.model("Route", RouteSchema);

const routes = [
  // Flights
  { type: "flight", fromCity: "Delhi", toCity: "Mumbai", price: 4299, duration: "2h 15m", operator: "IndiGo", departure: "06:00", arrival: "08:15", seatsLeft: 42 },
  { type: "flight", fromCity: "Delhi", toCity: "Mumbai", price: 5100, duration: "2h 20m", operator: "Air India", departure: "09:30", arrival: "11:50", seatsLeft: 18 },
  { type: "flight", fromCity: "Mumbai", toCity: "Bangalore", price: 3800, duration: "1h 45m", operator: "SpiceJet", departure: "07:15", arrival: "09:00", seatsLeft: 55 },
  { type: "flight", fromCity: "Bangalore", toCity: "Chennai", price: 2900, duration: "1h 10m", operator: "IndiGo", departure: "11:00", arrival: "12:10", seatsLeft: 30 },
  { type: "flight", fromCity: "Delhi", toCity: "Kolkata", price: 5500, duration: "2h 30m", operator: "Vistara", departure: "14:00", arrival: "16:30", seatsLeft: 22 },
  { type: "flight", fromCity: "Hyderabad", toCity: "Mumbai", price: 4100, duration: "1h 55m", operator: "Air India", departure: "08:45", arrival: "10:40", seatsLeft: 38 },
  { type: "flight", fromCity: "Chennai", toCity: "Delhi", price: 6200, duration: "2h 45m", operator: "IndiGo", departure: "16:20", arrival: "19:05", seatsLeft: 14 },
  { type: "flight", fromCity: "Kolkata", toCity: "Bangalore", price: 5900, duration: "2h 50m", operator: "SpiceJet", departure: "07:00", arrival: "09:50", seatsLeft: 47 },
  // Trains
  { type: "train", fromCity: "Delhi", toCity: "Mumbai", price: 1450, duration: "16h 35m", operator: "Rajdhani Express", departure: "16:25", arrival: "08:35+1", seatsLeft: 120 },
  { type: "train", fromCity: "Mumbai", toCity: "Goa", price: 850, duration: "8h 30m", operator: "Konkan Kanya Express", departure: "22:00", arrival: "06:30+1", seatsLeft: 85 },
  { type: "train", fromCity: "Bangalore", toCity: "Chennai", price: 420, duration: "5h 15m", operator: "Shatabdi Express", departure: "06:00", arrival: "11:15", seatsLeft: 200 },
  { type: "train", fromCity: "Delhi", toCity: "Kolkata", price: 1200, duration: "17h 00m", operator: "Duronto Express", departure: "08:05", arrival: "01:05+1", seatsLeft: 95 },
  { type: "train", fromCity: "Hyderabad", toCity: "Bangalore", price: 560, duration: "11h 00m", operator: "Kacheguda Express", departure: "18:30", arrival: "05:30+1", seatsLeft: 140 },
  // Buses
  { type: "bus", fromCity: "Pune", toCity: "Goa", price: 950, duration: "9h 00m", operator: "VRL Travels", departure: "21:00", arrival: "06:00+1", seatsLeft: 32 },
  { type: "bus", fromCity: "Mumbai", toCity: "Pune", price: 350, duration: "3h 30m", operator: "Neeta Travels", departure: "07:00", arrival: "10:30", seatsLeft: 28 },
  { type: "bus", fromCity: "Bangalore", toCity: "Mysore", price: 200, duration: "3h 00m", operator: "KSRTC", departure: "06:30", arrival: "09:30", seatsLeft: 40 },
  { type: "bus", fromCity: "Chennai", toCity: "Pondicherry", price: 180, duration: "3h 15m", operator: "PTC Travels", departure: "08:00", arrival: "11:15", seatsLeft: 35 },
  { type: "bus", fromCity: "Delhi", toCity: "Agra", price: 400, duration: "4h 00m", operator: "Raj National Express", departure: "06:00", arrival: "10:00", seatsLeft: 22 },
];

async function seed() {
  console.log("🔌 Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected!");

  console.log("🗑️  Clearing existing routes...");
  await Route.deleteMany({});

  console.log("🌱 Inserting routes...");
  await Route.insertMany(routes);

  console.log(`✅ Seeded ${routes.length} routes successfully!`);
  console.log("\nYou can now search:");
  console.log("  Delhi → Mumbai (flights + train)");
  console.log("  Mumbai → Goa (train + bus)");
  console.log("  Bangalore → Chennai (flight + train)");
  console.log("  Pune → Goa (bus)\n");

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err.message);
  process.exit(1);
});
