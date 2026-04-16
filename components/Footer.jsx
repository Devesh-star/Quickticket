"use client";

import Link from "next/link";
import { Plane, Train, Bus, Mail, MapPin, Phone, Github, Twitter, Linkedin, Instagram, Send } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

export default function Footer() {
  const [email, setEmail] = useState("");

  const handleNewsletter = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    toast.success("Thanks for subscribing! 🎉");
    setEmail("");
  };

  return (
    <footer className="relative border-t border-white/5 bg-[#08080f]">
      {/* Glow accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-orange-500/40 to-transparent" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 mb-12">

          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center font-display font-black text-white text-xs">QT</div>
              <span className="font-display font-bold text-white text-lg">
                Quick<span className="text-orange-500">Ticket</span>
              </span>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed mb-5 max-w-xs">
              Book flights, trains, and buses at the best prices. Real-time availability, instant confirmations.
            </p>
            <div className="flex items-center gap-3">
              {[
                { icon: <Twitter size={15} />, href: "#" },
                { icon: <Instagram size={15} />, href: "#" },
                { icon: <Linkedin size={15} />, href: "#" },
                { icon: <Github size={15} />, href: "#" },
              ].map((s, i) => (
                <a key={i} href={s.href}
                  className="w-9 h-9 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center text-gray-500 hover:text-orange-500 hover:bg-orange-500/10 hover:border-orange-500/30 transition-all">
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-bold text-white text-sm mb-4">Travel</h4>
            <ul className="space-y-2.5">
              {[
                { href: "/search?type=flight", label: "Search Flights", icon: <Plane size={13} /> },
                { href: "/dashboard", label: "My Bookings", icon: <MapPin size={13} /> },
                { href: "/destinations", label: "Destinations", icon: <Plane size={13} /> },
              ].map((link) => (
                <li key={link.label}>
                  <Link href={link.href}
                    className="flex items-center gap-2 text-gray-500 hover:text-orange-400 text-sm transition-colors">
                    {link.icon} {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-display font-bold text-white text-sm mb-4">Company</h4>
            <ul className="space-y-2.5">
              {[
                { label: "About Us", href: "#" },
                { label: "Contact", href: "/support" },
                { label: "Privacy Policy", href: "#" },
                { label: "Terms of Service", href: "#" },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className="text-gray-500 hover:text-orange-400 text-sm transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-5 space-y-2">
              <p className="flex items-center gap-2 text-gray-600 text-xs">
                <Mail size={11} /> support@quickticket.com
              </p>
              <p className="flex items-center gap-2 text-gray-600 text-xs">
                <Phone size={11} /> +91 98765 43210
              </p>
              <p className="flex items-center gap-2 text-gray-600 text-xs">
                <MapPin size={11} /> Mumbai, India
              </p>
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-display font-bold text-white text-sm mb-4">Stay Updated</h4>
            <p className="text-gray-500 text-sm leading-relaxed mb-4">
              Get the latest deals and travel tips delivered to your inbox.
            </p>
            <form onSubmit={handleNewsletter} className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-4 pr-11 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/60 transition-all"
              />
              <button type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-orange-500 hover:bg-orange-400 flex items-center justify-center text-white transition-all">
                <Send size={13} />
              </button>
            </form>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-gray-700 text-xs">
            © {new Date().getFullYear()} QuickTicket. All rights reserved.
          </p>
          <div className="flex items-center gap-1 text-gray-700 text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            All systems operational
          </div>
        </div>
      </div>
    </footer>
  );
}
