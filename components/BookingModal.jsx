"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  X, Plane, Train, Bus, Loader2, CheckCircle2,
  ChevronRight, Shield, Lock, CreditCard, ExternalLink
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

export default function BookingModal({ route, travelers, returnDate, departDate, onClose, onSuccess }) {
  const { data: session } = useSession();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [seatClass, setSeatClass] = useState(SEAT_CLASSES[route.type][0]);
  const [loading, setLoading] = useState(false);

  const multiplier = CLASS_MULTIPLIER[seatClass] ?? 1;
  const pricePerPerson = Math.round(route.price * multiplier);
  const totalPrice = pricePerPerson * travelers;

  const handlePayWithStripe = async () => {
    if (!session) {
      toast.error("Please sign in to book");
      router.push("/auth/login");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          routeId: route.id,
          travelers,
          seatClass,
          departDate: departDate || new Date().toISOString().split("T")[0],
          returnDate: returnDate || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Redirect to Stripe Checkout
      window.location.href = data.data.url;
    } catch (err) {
      toast.error(err.message || "Failed to initiate payment. Please try again.");
      setLoading(false);
    }
  };

  const typeIcon = route.type === "flight" ? <Plane size={15} /> : route.type === "train" ? <Train size={15} /> : <Bus size={15} />;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-0 sm:px-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={!loading ? onClose : undefined} />

      <div className="relative glass-dark rounded-t-2xl sm:rounded-2xl w-full max-w-md shadow-2xl max-h-[92vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/8">
          <div>
            <h2 className="font-display text-lg font-bold text-white">
              {step === 1 && "Select Class"}
              {step === 2 && "Review & Pay"}
            </h2>
            <div className="flex items-center gap-1.5 mt-1.5">
              {[1, 2].map((s) => (
                <div key={s} className={`h-1 w-8 rounded-full transition-all ${step >= s ? "bg-orange-500" : "bg-white/10"}`} />
              ))}
              <span className="text-gray-600 text-xs ml-1">Step {step} of 2</span>
            </div>
          </div>
          {!loading && (
            <button onClick={onClose} className="text-gray-500 hover:text-white p-1">
              <X size={20} />
            </button>
          )}
        </div>

        {/* Route summary */}
        <div className="mx-5 mt-4 bg-white/5 rounded-xl p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-500 flex items-center justify-center flex-shrink-0">
            {typeIcon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-medium text-sm">{route.fromCity} → {route.toCity}</p>
            <p className="text-gray-500 text-xs truncate">{route.operator} · {route.departure}–{route.arrival} · {departDate}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-orange-500 font-display font-bold">₹{totalPrice.toLocaleString()}</p>
            <p className="text-gray-600 text-xs">{travelers} pax</p>
          </div>
        </div>

        <div className="p-5">

          {/* STEP 1 — Seat Class */}
          {step === 1 && (
            <>
              <p className="text-gray-500 text-xs uppercase tracking-wide mb-3">Choose Seat Class</p>
              <div className="space-y-2 mb-5">
                {SEAT_CLASSES[route.type].map((cls) => {
                  const clsPrice = Math.round(route.price * (CLASS_MULTIPLIER[cls] ?? 1)) * travelers;
                  return (
                    <button key={cls} onClick={() => setSeatClass(cls)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
                        seatClass === cls ? "bg-orange-500/10 border-orange-500/50" : "bg-white/5 border-white/10 hover:border-white/20"
                      }`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${seatClass === cls ? "border-orange-500" : "border-gray-600"}`}>
                          {seatClass === cls && <div className="w-2 h-2 rounded-full bg-orange-500" />}
                        </div>
                        <span className={`font-medium text-sm ${seatClass === cls ? "text-white" : "text-gray-400"}`}>{cls}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-white text-sm font-semibold">₹{clsPrice.toLocaleString()}</p>
                        {CLASS_MULTIPLIER[cls] > 1 && <p className="text-gray-600 text-xs">×{CLASS_MULTIPLIER[cls]} base</p>}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="bg-white/5 rounded-xl p-4 mb-5 space-y-2 text-sm">
                <div className="flex justify-between text-gray-400">
                  <span>₹{pricePerPerson.toLocaleString()} × {travelers} traveler{travelers > 1 ? "s" : ""}</span>
                  <span>₹{totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Taxes & fees</span>
                  <span className="text-green-500">Included</span>
                </div>
                <div className="h-px bg-white/10" />
                <div className="flex justify-between font-bold">
                  <span className="text-white">Total</span>
                  <span className="text-orange-500 font-display text-xl">₹{totalPrice.toLocaleString()}</span>
                </div>
              </div>

              <button onClick={() => setStep(2)} className="btn-primary w-full flex items-center justify-center gap-2">
                Continue to Payment <ChevronRight size={16} />
              </button>
            </>
          )}

          {/* STEP 2 — Review & Pay with Stripe */}
          {step === 2 && (
            <>
              <p className="text-gray-500 text-xs uppercase tracking-wide mb-3">Booking Summary</p>

              <div className="bg-white/5 rounded-xl p-4 mb-4 space-y-2.5 text-sm">
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
                <div className="h-px bg-white/10" />
                <div className="flex justify-between font-bold">
                  <span className="text-white">Total Amount</span>
                  <span className="text-orange-500 font-display text-xl">₹{totalPrice.toLocaleString()}</span>
                </div>
              </div>

              {/* Stripe branding */}
              <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-xl p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard size={16} className="text-indigo-400" />
                  <span className="text-indigo-300 font-semibold text-sm">Secure Stripe Checkout</span>
                </div>
                <p className="text-gray-400 text-xs leading-relaxed">
                  You&apos;ll be redirected to Stripe&apos;s secure payment page to complete your purchase. We support all major credit/debit cards.
                </p>
              </div>

              <div className="flex items-center justify-center gap-5 text-xs text-gray-600 mb-4">
                <span className="flex items-center gap-1"><Shield size={11} className="text-green-500" />100% Secure</span>
                <span className="flex items-center gap-1"><Lock size={11} className="text-blue-400" />256-bit SSL</span>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} disabled={loading} className="btn-secondary px-5 py-3 text-sm">Back</button>
                <button onClick={handlePayWithStripe} disabled={loading}
                  className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {loading
                    ? <><Loader2 size={16} className="animate-spin" />Redirecting...</>
                    : <><ExternalLink size={15} />Pay ₹{totalPrice.toLocaleString()}</>}
                </button>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
