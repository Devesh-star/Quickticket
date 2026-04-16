"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Navbar from "@/components/Navbar";
import SeatMap from "@/components/SeatMap";
import {
  Plane, Train, Bus, ArrowLeft, Loader2, ChevronLeft,
  Shield, Lock, CreditCard, ExternalLink
} from "lucide-react";
import toast from "react-hot-toast";

const CLASS_MULTIPLIER = {
  Economy: 1, Business: 2.5, "First Class": 4,
  Sleeper: 1, "3AC": 1.5, "2AC": 2, "1AC": 3,
  Seater: 1, "AC Sleeper": 1.8,
};

export default function SeatsPage() {
  const { routeId } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();

  const travelers = parseInt(searchParams.get("travelers") || "1");
  const departDate = searchParams.get("departDate") || new Date().toISOString().split("T")[0];
  const returnDate = searchParams.get("returnDate") || "";
  const seatClass = searchParams.get("seatClass") || "Economy";

  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    fetchRoute();
  }, [routeId]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchRoute = async () => {
    try {
      const res = await fetch(`/api/routes/${routeId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setRoute(data.data.route);
    } catch {
      toast.error("Route not found");
      router.push("/search");
    } finally {
      setLoading(false);
    }
  };

  const handlePayWithStripe = async () => {
    if (!session) {
      toast.error("Please sign in to book");
      router.push("/auth/login");
      return;
    }
    if (selectedSeats.length !== travelers) {
      toast.error(`Please select ${travelers} seat${travelers > 1 ? "s" : ""}`);
      return;
    }

    setPaying(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          routeId,
          travelers,
          seatClass,
          selectedSeats,
          departDate,
          returnDate: returnDate || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      window.location.href = data.data.url;
    } catch (err) {
      toast.error(err.message || "Failed to initiate payment");
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0a0a14]">
        <Navbar />
        <div className="flex items-center justify-center pt-40">
          <Loader2 size={24} className="animate-spin text-orange-500" />
          <span className="ml-3 text-gray-400">Loading...</span>
        </div>
      </main>
    );
  }

  if (!route) return null;

  const multiplier = CLASS_MULTIPLIER[seatClass] ?? 1;
  const pricePerPerson = Math.round(route.price * multiplier);
  const totalPrice = pricePerPerson * travelers;

  const typeIcon = route.type === "flight" ? <Plane size={15} /> : route.type === "train" ? <Train size={15} /> : <Bus size={15} />;
  const typeEmoji = route.type === "flight" ? "✈" : route.type === "train" ? "🚂" : "🚌";

  const seatsReady = selectedSeats.length === travelers;

  return (
    <main className="min-h-screen bg-[#0a0a14]">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        {/* Back */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-500 hover:text-white text-sm mb-6 transition-colors"
        >
          <ArrowLeft size={16} /> Back to class selection
        </button>

        {/* Route summary bar */}
        <div className="glass rounded-2xl p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center flex-shrink-0">
              {typeIcon}
            </div>
            <div>
              <p className="text-white font-semibold">{route.fromCity} → {route.toCity}</p>
              <p className="text-gray-500 text-xs">{route.operator} · {seatClass} · {departDate} · {travelers} pax</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-orange-500 font-display font-bold text-xl">₹{totalPrice.toLocaleString()}</p>
            <p className="text-gray-600 text-xs">total</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr,340px] gap-6">
          {/* Seat Map */}
          <div className="glass rounded-2xl p-6">
            <h2 className="font-display font-bold text-white text-lg mb-1">Choose Your Seats</h2>
            <p className="text-gray-500 text-sm mb-5">
              Select {travelers} seat{travelers > 1 ? "s" : ""} from the map below
            </p>
            <SeatMap
              routeId={routeId}
              type={route.type}
              travelers={travelers}
              selectedSeats={selectedSeats}
              onSeatsChange={setSelectedSeats}
            />
          </div>

          {/* Review & Pay Sidebar */}
          <div className="space-y-5">
            {/* Booking Summary */}
            <div className="glass rounded-2xl p-5">
              <h3 className="font-display font-bold text-white text-sm mb-4">Booking Summary</h3>
              <div className="space-y-2.5 text-sm">
                {[
                  ["Route", `${route.fromCity} → ${route.toCity}`],
                  ["Operator", route.operator],
                  ["Date", departDate],
                  ["Time", `${route.departure} → ${route.arrival}`],
                  ["Class", seatClass],
                  ["Travelers", String(travelers)],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-gray-500">{label}</span>
                    <span className="text-white font-medium">{value}</span>
                  </div>
                ))}
                {selectedSeats.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Seats</span>
                    <span className="text-orange-400 font-bold font-mono">{selectedSeats.sort().join(", ")}</span>
                  </div>
                )}
                <div className="h-px bg-white/10" />
                <div className="flex justify-between items-end">
                  <span className="text-white font-semibold">Total</span>
                  <span className="text-orange-500 font-display font-black text-xl">
                    ₹{totalPrice.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Stripe Info */}
            <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard size={16} className="text-indigo-400" />
                <span className="text-indigo-300 font-semibold text-sm">Secure Stripe Checkout</span>
              </div>
              <p className="text-gray-400 text-xs leading-relaxed">
                You&apos;ll be redirected to Stripe&apos;s secure payment page. We support all major cards.
              </p>
            </div>

            {/* Pay Button */}
            <button
              onClick={handlePayWithStripe}
              disabled={paying || !seatsReady}
              className="btn-primary w-full flex items-center justify-center gap-2 text-base py-4 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {paying ? (
                <><Loader2 size={18} className="animate-spin" /> Redirecting to Stripe...</>
              ) : !seatsReady ? (
                <>{typeEmoji} Select {travelers - selectedSeats.length} more seat{(travelers - selectedSeats.length) !== 1 ? "s" : ""}</>
              ) : (
                <><ExternalLink size={17} /> Pay ₹{totalPrice.toLocaleString()}</>
              )}
            </button>

            <div className="flex items-center justify-center gap-5 text-xs text-gray-600">
              <span className="flex items-center gap-1"><Shield size={11} className="text-green-500" /> 100% Secure</span>
              <span className="flex items-center gap-1"><Lock size={11} className="text-blue-400" /> 256-bit SSL</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
