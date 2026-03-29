"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plane, Train, Bus, LayoutDashboard, LogOut, User, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";

export default function Navbar({ initialSession }) {
  const { data: session } = useSession();
  const activeSession = session ?? initialSession;
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile menu on route change / resize
  useEffect(() => {
    const close = () => setMobileOpen(false);
    window.addEventListener("resize", close);
    return () => window.removeEventListener("resize", close);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push("/");
    router.refresh();
  };

  const navLinks = [
    { href: "/?type=flight", label: "Flights", icon: <Plane size={14} /> },
    { href: "/?type=train",  label: "Trains",  icon: <Train size={14} /> },
    { href: "/?type=bus",    label: "Buses",   icon: <Bus size={14} /> },
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-40 glass-dark border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center font-display font-black text-white text-xs">QT</div>
            <span className="font-display font-bold text-white text-lg">
              Quick<span className="text-orange-500">Ticket</span>
            </span>
          </Link>

          {/* Center links — desktop */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((item) => (
              <Link key={item.label} href={item.href}
                className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm px-3 py-2 rounded-lg hover:bg-white/5 transition-all">
                {item.icon}{item.label}
              </Link>
            ))}
          </div>

          {/* Right — desktop */}
          <div className="hidden md:flex items-center gap-3">
            {activeSession?.user ? (
              <div className="relative">
                <button onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 text-sm text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-2 rounded-xl transition-all border border-white/10">
                  <User size={15} className="text-orange-500" />
                  <span className="max-w-[100px] truncate">{activeSession.user.name?.split(" ")[0]}</span>
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

          {/* Mobile hamburger */}
          <button onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-gray-300 hover:text-white p-2 -mr-2 transition-colors">
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* Mobile slide-in overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />

          {/* Panel */}
          <div className="absolute top-0 right-0 w-72 max-w-[85vw] h-full bg-[#12121f] border-l border-white/8 flex flex-col animate-slide-in-right overflow-y-auto">
            {/* Close header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
              <span className="font-display font-bold text-white">Menu</span>
              <button onClick={() => setMobileOpen(false)} className="text-gray-400 hover:text-white p-1">
                <X size={20} />
              </button>
            </div>

            {/* Nav links */}
            <div className="p-4 space-y-1">
              <p className="text-gray-600 text-xs uppercase tracking-wider mb-2 px-3">Travel</p>
              {navLinks.map((item) => (
                <Link key={item.label} href={item.href} onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 text-gray-300 hover:text-white text-sm px-3 py-3 rounded-xl hover:bg-white/5 transition-all">
                  {item.icon}{item.label}
                </Link>
              ))}
            </div>

            <div className="h-px bg-white/8 mx-4" />

            {/* User section */}
            <div className="p-4 space-y-1">
              {activeSession?.user ? (
                <>
                  <div className="flex items-center gap-3 px-3 py-3 mb-2">
                    <div className="w-9 h-9 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                      <User size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-white text-sm font-medium truncate">{activeSession.user.name}</p>
                      <p className="text-gray-500 text-xs truncate">{activeSession.user.email}</p>
                    </div>
                  </div>
                  <Link href="/dashboard" onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 text-gray-300 hover:text-white text-sm px-3 py-3 rounded-xl hover:bg-white/5 transition-all">
                    <LayoutDashboard size={14} className="text-orange-500" /> Dashboard
                  </Link>
                  <button onClick={() => { handleSignOut(); setMobileOpen(false); }}
                    className="w-full flex items-center gap-3 text-gray-300 hover:text-red-400 text-sm px-3 py-3 rounded-xl hover:bg-white/5 transition-all">
                    <LogOut size={14} /> Sign Out
                  </button>
                </>
              ) : (
                <>
                  <p className="text-gray-600 text-xs uppercase tracking-wider mb-2 px-3">Account</p>
                  <Link href="/auth/login" onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 text-gray-300 hover:text-white text-sm px-3 py-3 rounded-xl hover:bg-white/5 transition-all">
                    <User size={14} /> Sign In
                  </Link>
                  <Link href="/auth/signup" onClick={() => setMobileOpen(false)}
                    className="block text-center btn-primary text-sm py-3 px-4 mx-3 mt-2">
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
