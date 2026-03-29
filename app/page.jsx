"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import BookingCard from "@/components/BookingCard";
import BookingModal from "@/components/BookingModal";
import { useRouter } from "next/navigation";

function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [results, setResults] = useState(null);
  const [searching, setSearching] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [bookingParams, setBookingParams] = useState(null);

  const handleSearch = async (params) => {
    setSearching(true);
    setResults(null);
    try {
      const query = new URLSearchParams({
        from: params.from,
        to: params.to,
        type: params.type,
        travelers: params.travelers,
      });
      const res = await fetch(`/api/search?${query}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResults(data.data.routes);
      setBookingParams(params);
    } catch {
      import("react-hot-toast").then(({ default: toast }) => toast.error("Search failed. Please try again."));
    } finally {
      setSearching(false);
    }
  };

  const typeColors = { flight: "text-blue-400", train: "text-green-400", bus: "text-yellow-400" };
  const typeLabels = { flight: "✈ Flight", train: "🚂 Train", bus: "🚌 Bus" };

  return (
    <main className="min-h-screen bg-[#0a0a14]">
      <Navbar />

      {/* Hero */}
      <section className="gradient-hero pt-24 sm:pt-32 pb-12 sm:pb-16 px-4">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-full px-4 py-1.5 text-orange-400 text-xs font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
            Live seat availability · Real-time pricing
          </div>
          <h1 className="font-display text-3xl sm:text-5xl md:text-6xl font-black text-white leading-tight mb-4">
            Travel Smarter,<br />
            <span className="text-gradient">Book Faster.</span>
          </h1>
          <p className="text-gray-400 text-base sm:text-lg max-w-xl mx-auto">
            Flights, trains, buses — find the best deals across all modes of travel,
            backed by a real MongoDB database with live search.
          </p>
        </div>

        {/* Search Card */}
        <BookingCard onSearch={handleSearch} searching={searching} />
      </section>

      {/* Results */}
      {results !== null && (
        <section className="max-w-4xl mx-auto px-4 pb-20">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-bold text-white text-xl">
              {results.length === 0 ? "No results found" : `${results.length} result${results.length !== 1 ? "s" : ""} found`}
            </h2>
            {results.length > 0 && (
              <p className="text-gray-500 text-sm">{bookingParams?.from} → {bookingParams?.to}</p>
            )}
          </div>

          {results.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center">
              <p className="text-4xl mb-3">🔍</p>
              <p className="text-gray-300 font-medium">No routes found</p>
              <p className="text-gray-600 text-sm mt-1">Try different cities or transport type</p>
              <p className="text-gray-700 text-xs mt-3">Available: Delhi→Mumbai, Mumbai→Goa, Bangalore→Chennai</p>
            </div>
          ) : (
            <div className="space-y-4">
              {results.map((route) => (
                <div key={route.id} className="glass rounded-2xl p-5 card-hover">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-xl">
                        {route.type === "flight" ? "✈" : route.type === "train" ? "🚂" : "🚌"}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-semibold uppercase tracking-wide ${typeColors[route.type]}`}>
                            {typeLabels[route.type]}
                          </span>
                          <span className="text-gray-700">·</span>
                          <span className="text-gray-400 text-sm">{route.operator}</span>
                        </div>
                        <p className="text-white font-bold text-lg">
                          {route.fromCity} <span className="text-gray-500 font-normal text-base">→</span> {route.toCity}
                        </p>
                        <p className="text-gray-500 text-sm mt-0.5">
                          {route.departure} – {route.arrival} · {route.duration}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 sm:flex-col sm:items-end">
                      <div className="sm:text-right">
                        <p className="text-orange-500 font-display font-black text-2xl">
                          ₹{route.price.toLocaleString()}
                        </p>
                        <p className="text-gray-600 text-xs">per person · {route.seatsLeft} seats left</p>
                      </div>
                      <button
                        onClick={() => setSelectedRoute(route)}
                        className="btn-primary text-sm py-2.5 px-5 whitespace-nowrap">
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Stats */}
      {!results && (
        <section className="max-w-3xl mx-auto px-4 pb-20 text-center">
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 mt-4">
            {[["50K+", "Happy Travelers"], ["200+", "Live Routes"], ["99.9%", "Uptime"]].map(([val, label]) => (
              <div key={label}>
                <p className="font-display font-black text-white text-2xl sm:text-3xl">{val}</p>
                <p className="text-gray-500 text-sm mt-1">{label}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Booking Modal */}
      {selectedRoute && bookingParams && (
        <BookingModal
          route={selectedRoute}
          travelers={parseInt(bookingParams.travelers) || 1}
          departDate={bookingParams.departDate}
          returnDate={bookingParams.returnDate}
          onClose={() => setSelectedRoute(null)}
          onSuccess={() => {
            setSelectedRoute(null);
            router.push("/dashboard");
          }}
        />
      )}
    </main>
  );
}

export default function HomePage() {
  return (
    <Suspense>
      <HomeContent />
    </Suspense>
  );
}
