"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Plane, MapPin } from "lucide-react";
import Link from "next/link";

export default function DestinationsPage() {
  const popularCities = [
    { name: "Mumbai", desc: "The City of Dreams", image: "https://upload.wikimedia.org/wikipedia/commons/e/e9/Mumbai_India_Bridge.jpg" },
    { name: "Delhi", desc: "The Heart of India", image: "https://upload.wikimedia.org/wikipedia/commons/4/40/Jama_Masjid_2011.jpg" },
    { name: "Bengaluru", desc: "Silicon Valley", image: "https://upload.wikimedia.org/wikipedia/commons/e/e6/Vidhana_Soudha%2C_Bangalore.jpg" },
    { name: "Goa", desc: "Pristine Beaches", image: "https://upload.wikimedia.org/wikipedia/commons/f/fc/BeachFun.jpg" },
    { name: "Ahmedabad", desc: "Vibrant Heritage", image: "https://upload.wikimedia.org/wikipedia/commons/8/8e/Sabarmati_riverside.jpg" },
    { name: "Amritsar", desc: "Golden City", image: "https://upload.wikimedia.org/wikipedia/commons/e/ea/Golden_Temple_Amritsar_Gurudwara_%28cropped%29.jpg" },
  ];

  return (
    <main className="min-h-screen bg-[#0a0a14] flex flex-col">
      <Navbar />
      <div className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-24 pb-16">
        <h1 className="font-display text-4xl font-bold text-white mb-2">Popular Destinations</h1>
        <p className="text-gray-400 mb-10">Discover our most booked flight routes and explore the world with QuickTicket.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {popularCities.map((city) => (
            <div key={city.name} className="relative group rounded-2xl overflow-hidden glass aspect-[4/3]">
              <img src={city.image} alt={city.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-80" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-6">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin size={16} className="text-orange-500" />
                  <h3 className="font-display text-xl font-bold text-white">{city.name}</h3>
                </div>
                <p className="text-gray-300 text-sm mb-4">{city.desc}</p>
                <Link href={`/search?type=flight&to=${city.name}`} className="btn-primary text-sm py-2 px-4 shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2 self-start">
                  <Plane size={14} /> Search Flights
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
