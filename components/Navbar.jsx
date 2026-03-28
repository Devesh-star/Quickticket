"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plane, Train, Bus, LayoutDashboard, LogOut, User } from "lucide-react";
import { useState } from "react";

export default function Navbar({ initialSession }) {
  const { data: session } = useSession();
  const activeSession = session ?? initialSession;
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push("/");
    router.refresh();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 glass-dark border-b border-white/5">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center font-display font-black text-white text-xs">QT</div>
          <span className="font-display font-bold text-white text-lg">
            Quick<span className="text-orange-500">Ticket</span>
          </span>
        </Link>

        {/* Center links */}
        <div className="hidden md:flex items-center gap-1">
          {[
            { href: "/?type=flight", label: "Flights", icon: <Plane size={14} /> },
            { href: "/?type=train",  label: "Trains",  icon: <Train size={14} /> },
            { href: "/?type=bus",    label: "Buses",   icon: <Bus size={14} /> },
          ].map((item) => (
            <Link key={item.label} href={item.href}
              className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm px-3 py-2 rounded-lg hover:bg-white/5 transition-all">
              {item.icon}{item.label}
            </Link>
          ))}
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          {activeSession?.user ? (
            <div className="relative">
              <button onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 text-sm text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-2 rounded-xl transition-all border border-white/10">
                <User size={15} className="text-orange-500" />
                <span className="hidden sm:block max-w-[100px] truncate">{activeSession.user.name?.split(" ")[0]}</span>
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 glass-dark rounded-xl border border-white/10 overflow-hidden shadow-xl">
                  <Link href="/dashboard" onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-all">
                    <LayoutDashboard size={14} className="text-orange-500" /> Dashboard
                  </Link>
                  <button onClick={handleSignOut}
                    className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-gray-300 hover:text-red-400 hover:bg-white/5 transition-all">
                    <LogOut size={14} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/auth/login" className="text-sm text-gray-300 hover:text-white px-4 py-2 rounded-xl hover:bg-white/5 transition-all border border-white/10">
                Sign In
              </Link>
              <Link href="/auth/signup" className="btn-primary text-sm py-2 px-4">
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
