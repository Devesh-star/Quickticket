"use client";

import { Suspense } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import BookingCard from "@/components/BookingCard";
import { Shield, Zap, BadgePercent, MapPin, ArrowRight, Search, MousePointerClick, CreditCard } from "lucide-react";

const DESTINATIONS = [
  { from: "Delhi", to: "Mumbai", price: "2,499", emoji: "🏙", type: "flight" },
  { from: "Mumbai", to: "Goa", price: "1,299", emoji: "🏖", type: "bus" },
  { from: "Bangalore", to: "Chennai", price: "899", emoji: "🌆", type: "train" },
  { from: "Delhi", to: "Jaipur", price: "699", emoji: "🏰", type: "bus" },
  { from: "Kolkata", to: "Hyderabad", price: "3,199", emoji: "✈", type: "flight" },
  { from: "Pune", to: "Mumbai", price: "499", emoji: "🚂", type: "train" },
];

const WHY_US = [
  {
    icon: <Shield size={24} />,
    title: "Secure Payments",
    desc: "Industry-standard SSL encryption with trusted Stripe payment processing. Your data is always safe.",
    color: "text-green-400",
    bg: "bg-green-400/10",
    border: "border-green-400/20",
  },
  {
    icon: <Zap size={24} />,
    title: "Lightning Fast",
    desc: "Real-time seat availability and instant booking confirmations. No waiting, no delays.",
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    border: "border-blue-400/20",
  },
  {
    icon: <BadgePercent size={24} />,
    title: "Best Prices",
    desc: "Compare across flights, trains, and buses to find the best deal for every route.",
    color: "text-orange-400",
    bg: "bg-orange-400/10",
    border: "border-orange-400/20",
  },
];

const STEPS = [
  {
    num: "01",
    icon: <Search size={22} />,
    title: "Search Routes",
    desc: "Enter your origin, destination, and travel date. Filter by transport type and class.",
  },
  {
    num: "02",
    icon: <MousePointerClick size={22} />,
    title: "Select & Customize",
    desc: "Pick your preferred route, choose your seat class, and select exact seats from the live seat map.",
  },
  {
    num: "03",
    icon: <CreditCard size={22} />,
    title: "Pay & Go",
    desc: "Complete secure checkout via Stripe. Get instant confirmation with your booking reference.",
  },
];

function HomeContent() {
  const router = useRouter();

  const handleSearch = (params) => {
    const query = new URLSearchParams({
      from: params.from,
      to: params.to,
      type: params.type,
      travelers: String(params.travelers),
    });
    if (params.departDate) query.set("departDate", params.departDate);
    if (params.returnDate) query.set("returnDate", params.returnDate);
    router.push(`/search?${query.toString()}`);
  };

  return (
    <main className="min-h-screen bg-[#0a0a14]">
      <Navbar />

      {/* ──── Hero ──── */}
      <section className="gradient-hero pt-24 sm:pt-32 pb-16 sm:pb-20 px-4">
        <div className="max-w-3xl mx-auto text-center mb-12 animate-fade-in-up">
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

        <div className="animate-fade-in-up animate-fade-in-up-delay-1">
          <BookingCard onSearch={handleSearch} searching={false} />
        </div>
      </section>

      {/* ──── Stats ──── */}
      <section className="max-w-3xl mx-auto px-4 pb-16 text-center">
        <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 mt-4">
          {[["50K+", "Happy Travelers"], ["200+", "Live Routes"], ["99.9%", "Uptime"]].map(([val, label]) => (
            <div key={label}>
              <p className="font-display font-black text-white text-2xl sm:text-3xl">{val}</p>
              <p className="text-gray-500 text-sm mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ──── Why Choose Us ──── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-20">
        <div className="text-center mb-12">
          <p className="text-orange-500 text-xs font-semibold uppercase tracking-widest mb-2">Why QuickTicket</p>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
            Built for the Modern Traveler
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {WHY_US.map((item, i) => (
            <div
              key={item.title}
              className={`glass rounded-2xl p-6 card-hover animate-fade-in-up animate-fade-in-up-delay-${i + 1}`}
            >
              <div className={`w-12 h-12 rounded-xl ${item.bg} border ${item.border} flex items-center justify-center ${item.color} mb-4`}>
                {item.icon}
              </div>
              <h3 className="font-display font-bold text-white text-lg mb-2">{item.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ──── Popular Destinations ──── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-20">
        <div className="text-center mb-12">
          <p className="text-orange-500 text-xs font-semibold uppercase tracking-widest mb-2">Explore</p>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
            Popular Destinations
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {DESTINATIONS.map((dest) => (
            <button
              key={`${dest.from}-${dest.to}`}
              onClick={() => {
                router.push(`/search?from=${dest.from}&to=${dest.to}&type=${dest.type}&travelers=1`);
              }}
              className="glass rounded-2xl p-5 text-left card-hover group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">{dest.emoji}</span>
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide bg-white/5 px-2.5 py-1 rounded-full">
                  {dest.type}
                </span>
              </div>
              <p className="font-display font-bold text-white text-lg">
                {dest.from}
                <span className="text-gray-500 font-normal mx-2">→</span>
                {dest.to}
              </p>
              <div className="flex items-center justify-between mt-3">
                <p className="text-orange-500 font-display font-bold">
                  from ₹{dest.price}
                </p>
                <ArrowRight size={16} className="text-gray-600 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ──── How It Works ──── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-20">
        <div className="text-center mb-12">
          <p className="text-orange-500 text-xs font-semibold uppercase tracking-widest mb-2">Simple Process</p>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
            How It Works
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {STEPS.map((step, i) => (
            <div key={step.num} className="relative glass rounded-2xl p-6 card-hover text-center">
              {/* Step number badge */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                Step {step.num}
              </div>
              <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 mx-auto mt-3 mb-4">
                {step.icon}
              </div>
              <h3 className="font-display font-bold text-white text-lg mb-2">{step.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
              {/* Connector line (hidden on last) */}
              {i < STEPS.length - 1 && (
                <div className="hidden sm:block absolute top-1/2 -right-3 w-6 border-t border-dashed border-gray-700" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ──── CTA ──── */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 pb-20 text-center">
        <div className="glass rounded-2xl p-8 sm:p-12 gradient-border">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mb-3">
            Ready to Travel?
          </h2>
          <p className="text-gray-400 text-sm sm:text-base max-w-md mx-auto mb-6">
            Join 50,000+ travelers who book smarter with QuickTicket. Start your journey today.
          </p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="btn-primary text-sm sm:text-base"
          >
            Search Routes Now
          </button>
        </div>
      </section>
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
