"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Navbar from "@/components/Navbar";
import {
  Plane, Train, Bus, Armchair, ChevronRight, Loader2, ArrowLeft,
  Shield, Clock, MapPin, Users, Calendar
} from "lucide-react";
import toast from "react-hot-toast";

const SEAT_CLASSES = {
  flight: ["Economy", "Business", "First Class"],
  train: ["Sleeper", "3AC", "2AC", "1AC"],
  bus: ["Seater", "Sleeper", "AC Sleeper"],
};

const CLASS_MULTIPLIER = {
  Economy: 1, Business: 2.5, "First Class": 4,
  Sleeper: 1, "3AC": 1.5, "2AC": 2, "1AC": 3,
  Seater: 1, "AC Sleeper": 1.8,
};

export default function BookingPage() {
  const { routeId } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();

  const travelers = parseInt(searchParams.get("travelers") || "1");
  const departDate = searchParams.get("departDate") || new Date().toISOString().split("T")[0];
  const returnDate = searchParams.get("returnDate") || "";

  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [seatClass, setSeatClass] = useState("");

  useEffect(() => {
    fetchRoute();
  }, [routeId]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchRoute = async () => {
    try {
      const res = await fetch(`/api/routes/${routeId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setRoute(data.data.route);
      setSeatClass(SEAT_CLASSES[data.data.route.type]?.[0] || "Economy");
    } catch (err) {
      toast.error("Route not found");
      router.push("/search");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0a0a14]">
        <Navbar />
        <div className="flex items-center justify-center pt-40">
          <Loader2 size={24} className="animate-spin text-orange-500" />
          <span className="ml-3 text-gray-400">Loading route...</span>
        </div>
      </main>
    );
  }

  if (!route) return null;

  const multiplier = CLASS_MULTIPLIER[seatClass] ?? 1;
  const pricePerPerson = Math.round(route.price * multiplier);
  const totalPrice = pricePerPerson * travelers;

  const typeEmoji = route.type === "flight" ? "✈" : route.type === "train" ? "🚂" : "🚌";
  const typeIcon = route.type === "flight" ? <Plane size={18} /> : route.type === "train" ? <Train size={18} /> : <Bus size={18} />;
  const typeLabel = route.type.charAt(0).toUpperCase() + route.type.slice(1);

  const handleContinue = () => {
    if (!session) {
      toast.error("Please sign in to book");
      router.push("/auth/login");
      return;
    }
    const params = new URLSearchParams({
      travelers: String(travelers),
      departDate,
      seatClass,
    });
    if (returnDate) params.set("returnDate", returnDate);
    router.push(`/book/${routeId}/seats?${params.toString()}`);
  };

  return (
    <main className="min-h-screen bg-[#0a0a14]">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-500 hover:text-white text-sm mb-6 transition-colors"
        >
          <ArrowLeft size={16} /> Back to results
        </button>

        {/* Route Header Card */}
        <div className="glass rounded-2xl p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 flex-shrink-0">
              {typeIcon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-orange-400">
                  {typeEmoji} {typeLabel}
                </span>
                <span className="text-gray-700">·</span>
                <span className="text-gray-400 text-sm">{route.operator}</span>
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-white mb-2">
                {route.fromCity} <span className="text-gray-500 font-normal">→</span> {route.toCity}
              </h1>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-500">
                <span className="flex items-center gap-1.5">
                  <Clock size={13} className="text-gray-600" />
                  {route.departure} – {route.arrival} · {route.duration}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar size={13} className="text-gray-600" />
                  {departDate}
                </span>
                <span className="flex items-center gap-1.5">
                  <Users size={13} className="text-gray-600" />
                  {travelers} traveler{travelers > 1 ? "s" : ""}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin size={13} className="text-gray-600" />
                  {route.seatsLeft} seats available
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr,320px] gap-6">
          {/* Class Selection */}
          <div className="glass rounded-2xl p-6">
            <h2 className="font-display font-bold text-white text-lg mb-1">Choose Seat Class</h2>
            <p className="text-gray-500 text-sm mb-5">Select your preferred class for this journey</p>

            <div className="space-y-3">
              {(SEAT_CLASSES[route.type] || []).map((cls) => {
                const clsMult = CLASS_MULTIPLIER[cls] ?? 1;
                const clsPrice = Math.round(route.price * clsMult);
                const clsTotal = clsPrice * travelers;
                const isSelected = seatClass === cls;

                return (
                  <button
                    key={cls}
                    onClick={() => setSeatClass(cls)}
                    className={`w-full flex items-center justify-between px-5 py-4 rounded-xl border transition-all ${
                      isSelected
                        ? "bg-orange-500/10 border-orange-500/50 shadow-lg shadow-orange-500/5"
                        : "bg-white/3 border-white/8 hover:border-white/20 hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        isSelected ? "border-orange-500" : "border-gray-600"
                      }`}>
                        {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />}
                      </div>
                      <div className="text-left">
                        <p className={`font-semibold ${isSelected ? "text-white" : "text-gray-300"}`}>
                          {cls}
                        </p>
                        {clsMult > 1 && (
                          <p className="text-gray-600 text-xs mt-0.5">×{clsMult} base price</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-display font-bold text-lg ${isSelected ? "text-orange-500" : "text-white"}`}>
                        ₹{clsPrice.toLocaleString()}
                      </p>
                      <p className="text-gray-600 text-xs">per person</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price Summary Sidebar */}
          <div className="space-y-5">
            <div className="glass rounded-2xl p-5">
              <h3 className="font-display font-bold text-white text-sm mb-4">Price Breakdown</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-400">
                  <span>Base fare ({seatClass})</span>
                  <span>₹{pricePerPerson.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>× {travelers} traveler{travelers > 1 ? "s" : ""}</span>
                  <span>₹{totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Taxes & fees</span>
                  <span className="text-green-500">Included</span>
                </div>
                <div className="h-px bg-white/10" />
                <div className="flex justify-between items-end">
                  <span className="text-white font-semibold">Total</span>
                  <span className="text-orange-500 font-display font-black text-2xl">
                    ₹{totalPrice.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleContinue}
              className="btn-primary w-full flex items-center justify-center gap-2 text-base py-4"
            >
              <Armchair size={18} /> Choose Your Seats <ChevronRight size={18} />
            </button>

            <div className="flex items-center justify-center gap-5 text-xs text-gray-600">
              <span className="flex items-center gap-1"><Shield size={11} className="text-green-500" /> Free cancellation</span>
              <span className="flex items-center gap-1"><Shield size={11} className="text-blue-400" /> Instant confirm</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
