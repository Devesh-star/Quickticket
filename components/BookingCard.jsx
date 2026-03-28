"use client";

import { useState } from "react";
import { Plane, Train, Bus, MapPin, ArrowLeftRight, Calendar, Users, Search, Loader2 } from "lucide-react";

const TYPES = [
  { id: "flight", label: "Flights", icon: <Plane size={15} /> },
  { id: "train",  label: "Trains",  icon: <Train size={15} /> },
  { id: "bus",    label: "Buses",   icon: <Bus size={15} /> },
];

export default function BookingCard({ onSearch, searching }) {
  const today = new Date().toISOString().split("T")[0];

  const [type, setType] = useState("flight");
  const [tripType, setTripType] = useState("one-way");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [departDate, setDepartDate] = useState(today);
  const [returnDate, setReturnDate] = useState("");
  const [travelers, setTravelers] = useState(1);

  const swap = () => { setFrom(to); setTo(from); };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!from.trim() || !to.trim()) return;
    onSearch({ type, from: from.trim(), to: to.trim(), departDate, returnDate, travelers });
  };

  return (
    <div className="max-w-2xl mx-auto glass-dark rounded-2xl p-6 shadow-2xl">
      {/* Type tabs */}
      <div className="flex gap-1 mb-5">
        {TYPES.map((t) => (
          <button key={t.id} onClick={() => setType(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              type === t.id ? "bg-orange-500 text-white shadow-lg shadow-orange-500/30" : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {/* Trip type */}
      <div className="flex gap-4 mb-5">
        {["one-way", "round-trip"].map((tt) => (
          <label key={tt} className="flex items-center gap-2 cursor-pointer">
            <div onClick={() => setTripType(tt)}
              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                tripType === tt ? "border-orange-500" : "border-gray-600"
              }`}>
              {tripType === tt && <div className="w-2 h-2 rounded-full bg-orange-500" />}
            </div>
            <span className="text-gray-300 text-sm capitalize">{tt.replace("-", " ")}</span>
          </label>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* From / To */}
        <div className="grid grid-cols-[1fr,auto,1fr] items-center gap-2">
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wide mb-1.5 block">From</label>
            <div className="relative">
              <MapPin size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-orange-500" />
              <input type="text" value={from} onChange={(e) => setFrom(e.target.value)}
                placeholder="Delhi" required className="input-field !pl-9" />
            </div>
          </div>
          <button type="button" onClick={swap}
            className="mt-5 w-9 h-9 rounded-xl bg-white/5 hover:bg-orange-500/10 border border-white/10 flex items-center justify-center text-gray-400 hover:text-orange-500 transition-all">
            <ArrowLeftRight size={14} />
          </button>
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wide mb-1.5 block">To</label>
            <div className="relative">
              <MapPin size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-orange-500" />
              <input type="text" value={to} onChange={(e) => setTo(e.target.value)}
                placeholder="Mumbai" required className="input-field !pl-9" />
            </div>
          </div>
        </div>

        {/* Date / Travelers */}
        <div className={`grid gap-3 ${tripType === "round-trip" ? "grid-cols-3" : "grid-cols-2"}`}>
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wide mb-1.5 block">Departure</label>
            <div className="relative">
              <Calendar size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
              <input type="date" value={departDate} min={today}
                onChange={(e) => setDepartDate(e.target.value)}
                className="input-field !pl-9 [color-scheme:dark]" />
            </div>
          </div>
          {tripType === "round-trip" && (
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wide mb-1.5 block">Return</label>
              <div className="relative">
                <Calendar size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                <input type="date" value={returnDate} min={departDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="input-field !pl-9 [color-scheme:dark]" />
              </div>
            </div>
          )}
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wide mb-1.5 block">Travelers</label>
            <div className="relative">
              <Users size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
              <select value={travelers} onChange={(e) => setTravelers(Number(e.target.value))}
                className="input-field !pl-9 appearance-none">
                {[1,2,3,4,5,6].map((n) => (
                  <option key={n} value={n}>{n} Traveler{n > 1 ? "s" : ""}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <button type="submit" disabled={searching || !from || !to}
          className="btn-primary w-full flex items-center justify-center gap-2 mt-1">
          {searching
            ? <><Loader2 size={16} className="animate-spin" />Searching...</>
            : <><Search size={16} />Search {TYPES.find((t) => t.id === type)?.label}</>}
        </button>
      </form>
    </div>
  );
}
