// scripts/seed.cjs
// Run with: node scripts/seed.cjs
// Generates lots of flights for ALL city pair combinations

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

// ── City data with coordinates for realistic pricing/duration ──
const CITIES = {
  "Agra":         { lat: 27.18, lon: 78.02 },
  "Ahmedabad":    { lat: 23.02, lon: 72.57 },
  "Amritsar":     { lat: 31.63, lon: 74.87 },
  "Bangalore":    { lat: 12.97, lon: 77.59 },
  "Bhopal":       { lat: 23.26, lon: 77.41 },
  "Bhubaneswar":  { lat: 20.30, lon: 85.82 },
  "Chandigarh":   { lat: 30.73, lon: 76.78 },
  "Chennai":      { lat: 13.08, lon: 80.27 },
  "Coimbatore":   { lat: 11.00, lon: 76.96 },
  "Dehradun":     { lat: 30.32, lon: 78.03 },
  "Delhi":        { lat: 28.61, lon: 77.21 },
  "Goa":          { lat: 15.30, lon: 74.12 },
  "Guwahati":     { lat: 26.14, lon: 91.74 },
  "Hyderabad":    { lat: 17.38, lon: 78.49 },
  "Indore":       { lat: 22.72, lon: 75.86 },
  "Jaipur":       { lat: 26.91, lon: 75.79 },
  "Kochi":        { lat: 9.93,  lon: 76.27 },
  "Kolkata":      { lat: 22.57, lon: 88.36 },
  "Lucknow":      { lat: 26.85, lon: 80.95 },
  "Mumbai":       { lat: 19.08, lon: 72.88 },
  "Mysore":       { lat: 12.30, lon: 76.66 },
  "Nagpur":       { lat: 21.15, lon: 79.09 },
  "Patna":        { lat: 25.59, lon: 85.14 },
  "Pondicherry":  { lat: 11.93, lon: 79.83 },
  "Pune":         { lat: 18.52, lon: 73.86 },
  "Ranchi":       { lat: 23.34, lon: 85.31 },
  "Srinagar":     { lat: 34.08, lon: 74.80 },
  "Thiruvananthapuram": { lat: 8.52, lon: 76.94 },
  "Udaipur":      { lat: 24.58, lon: 73.68 },
  "Varanasi":     { lat: 25.32, lon: 83.01 },
  "Visakhapatnam":{ lat: 17.69, lon: 83.22 },
};

const CITY_NAMES = Object.keys(CITIES);

// ── Operators ──
const FLIGHT_OPERATORS = ["IndiGo", "Air India", "SpiceJet", "Vistara", "Akasa Air", "Go First"];

// ── Helpers ──
function distanceKm(c1, c2) {
  const R = 6371;
  const dLat = ((c2.lat - c1.lat) * Math.PI) / 180;
  const dLon = ((c2.lon - c1.lon) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos((c1.lat * Math.PI) / 180) * Math.cos((c2.lat * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pad(n) { return String(n).padStart(2, "0"); }

function randomTime(minH = 5, maxH = 22) {
  const h = randInt(minH, maxH);
  const m = pick([0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]);
  return `${pad(h)}:${pad(m)}`;
}

function addTime(dep, durationMins) {
  const [hh, mm] = dep.split(":").map(Number);
  const total = hh * 60 + mm + durationMins;
  const days = Math.floor(total / (24 * 60));
  const remaining = total % (24 * 60);
  const arrH = Math.floor(remaining / 60);
  const arrM = remaining % 60;
  return `${pad(arrH)}:${pad(arrM)}${days > 0 ? `+${days}` : ""}`;
}

function formatDuration(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${pad(m)}m`;
}

// ── Route generators ──
function generateFlight(from, to, dist) {
  const durationMins = Math.round(dist / 8 + randInt(30, 60)); // ~8 km/min avg speed
  const basePrice = Math.round(dist * 3 + randInt(500, 1500));
  const dep = randomTime(5, 23); // More spread out times
  return {
    type: "flight",
    fromCity: from,
    toCity: to,
    price: Math.round(basePrice / 100) * 100, // round to nearest 100
    duration: formatDuration(durationMins),
    operator: pick(FLIGHT_OPERATORS),
    departure: dep,
    arrival: addTime(dep, durationMins),
    seatsLeft: randInt(5, 60),
    totalSeats: 60, // Fixed capacity for standard plane size modeling in this app
  };
}


// ── Generate all routes ──
function generateAllRoutes() {
  const routes = [];

  for (let i = 0; i < CITY_NAMES.length; i++) {
    for (let j = 0; j < CITY_NAMES.length; j++) {
      if (i === j) continue;

      const from = CITY_NAMES[i];
      const to = CITY_NAMES[j];
      const dist = distanceKm(CITIES[from], CITIES[to]);

      // 6 to 12 flights per pair
      const numFlights = randInt(6, 12);
      for (let k = 0; k < numFlights; k++) {
        routes.push(generateFlight(from, to, dist));
      }
    }
  }

  return routes;
}

// ── Seed ──
async function seed() {
  console.log("🔌 Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected!");

  console.log("🗑️  Clearing existing routes...");
  await Route.deleteMany({});

  console.log("🌱 Generating flight routes for all city pairs...");
  const routes = generateAllRoutes();

  // Insert in batches of 500
  const batchSize = 500;
  for (let i = 0; i < routes.length; i += batchSize) {
    const batch = routes.slice(i, i + batchSize);
    await Route.insertMany(batch);
    console.log(`   Inserted ${Math.min(i + batchSize, routes.length)} / ${routes.length}`);
  }

  const flights = routes.filter(r => r.type === "flight").length;

  console.log(`\n✅ Seeded ${routes.length} routes across ${CITY_NAMES.length} cities!`);
  console.log(`   ✈ ${flights} flights`);
  console.log(`\nCities: ${CITY_NAMES.join(", ")}`);
  console.log("\nEvery city pair now has many flight routes.\n");

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err.message);
  process.exit(1);
});
