"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import {
  Shield, BarChart3, IndianRupee, Users, Ticket, TrendingUp, TrendingDown,
  Plane, Train, Bus, CheckCircle2, XCircle, Loader2, MapPin, ChevronLeft, ChevronRight
} from "lucide-react";

const STATUS_TABS = [
  { key: "all", label: "All" },
  { key: "Confirmed", label: "Confirmed" },
  { key: "Cancelled", label: "Cancelled" },
];

const typeIcon = { flight: <Plane size={13} />, train: <Train size={13} />, bus: <Bus size={13} /> };

export default function AdminPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();

  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [bookingMeta, setBookingMeta] = useState({ total: 0, page: 1, totalPages: 1 });
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const isAdmin = session?.user?.role === "admin";

  useEffect(() => {
    if (authStatus === "loading") return;
    if (!session?.user || !isAdmin) {
      router.replace("/");
      return;
    }
    fetchStats();
    fetchBookings(1, "all");
  }, [authStatus, session]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/stats");
      const data = await res.json();
      if (data.success) setStats(data.data);
    } catch (err) {
      console.error("Stats error", err);
    }
  };

  const fetchBookings = async (page = 1, status = statusFilter) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "15" });
      if (status !== "all") params.set("status", status);
      const res = await fetch(`/api/admin/bookings?${params}`);
      const data = await res.json();
      if (data.success) {
        setBookings(data.data.bookings);
        setBookingMeta({ total: data.data.total, page: data.data.page, totalPages: data.data.totalPages });
      }
    } catch (err) {
      console.error("Bookings error", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    fetchBookings(1, status);
  };

  if (authStatus === "loading" || (authStatus === "authenticated" && !stats)) {
    return (
      <main className="min-h-screen bg-[#0a0a14] flex items-center justify-center">
        <Navbar />
        <Loader2 size={24} className="animate-spin text-orange-500" />
      </main>
    );
  }

  if (!isAdmin) return null;

  const userGrowth = stats?.usersLastMonth > 0
    ? Math.round(((stats.usersThisMonth - stats.usersLastMonth) / stats.usersLastMonth) * 100)
    : stats?.usersThisMonth > 0 ? 100 : 0;

  const statCards = [
    {
      label: "Total Revenue",
      value: `₹${Math.round(stats?.totalRevenue ?? 0).toLocaleString()}`,
      icon: <IndianRupee size={18} />,
      color: "text-green-400",
      bg: "bg-green-400/10",
    },
    {
      label: "Total Bookings",
      value: String(stats?.totalBookings ?? 0),
      icon: <Ticket size={18} />,
      color: "text-orange-400",
      bg: "bg-orange-400/10",
    },
    {
      label: "Total Users",
      value: String(stats?.totalUsers ?? 0),
      icon: <Users size={18} />,
      color: "text-blue-400",
      bg: "bg-blue-400/10",
    },
    {
      label: "User Growth",
      value: `${userGrowth >= 0 ? "+" : ""}${userGrowth}%`,
      sub: `${stats?.usersThisMonth ?? 0} this month`,
      icon: userGrowth >= 0 ? <TrendingUp size={18} /> : <TrendingDown size={18} />,
      color: userGrowth >= 0 ? "text-emerald-400" : "text-red-400",
      bg: userGrowth >= 0 ? "bg-emerald-400/10" : "bg-red-400/10",
    },
  ];

  return (
    <main className="min-h-screen bg-[#0a0a14]">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Shield size={22} />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-gray-500 text-sm">Platform overview & management</p>
            </div>
          </div>
          <Link href="/admin/routes" className="btn-primary flex items-center gap-2 self-start sm:self-auto text-sm">
            <MapPin size={15} /> Manage Routes
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((stat) => (
            <div key={stat.label} className="glass rounded-2xl p-5 card-hover">
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center ${stat.color} mb-3`}>
                {stat.icon}
              </div>
              <p className={`font-display text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-gray-500 text-xs mt-1">{stat.label}</p>
              {stat.sub && <p className="text-gray-600 text-xs mt-0.5">{stat.sub}</p>}
            </div>
          ))}
        </div>

        {/* Revenue by Type */}
        {stats?.revenueByType && Object.keys(stats.revenueByType).length > 0 && (
          <div className="glass rounded-2xl p-5 mb-8">
            <h3 className="font-display font-bold text-white text-sm mb-4 flex items-center gap-2">
              <BarChart3 size={15} className="text-orange-500" /> Revenue by Type
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {["flight", "train", "bus"].map((t) => {
                const data = stats.revenueByType[t];
                if (!data) return null;
                return (
                  <div key={t} className="bg-white/5 rounded-xl p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                      {typeIcon[t]}
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm capitalize">{t}s</p>
                      <p className="text-gray-500 text-xs">{data.count} bookings · ₹{Math.round(data.revenue).toLocaleString()}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Bookings Table */}
        <div className="glass rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="font-display font-bold text-white text-sm flex items-center gap-2">
              <Ticket size={15} className="text-orange-500" /> All Bookings
              <span className="text-gray-600 font-normal ml-1">({bookingMeta.total})</span>
            </h3>
            <div className="flex gap-1">
              {STATUS_TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => handleStatusFilter(tab.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    statusFilter === tab.key
                      ? "bg-orange-500 text-white"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={20} className="animate-spin text-orange-500" />
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-16 text-gray-500 text-sm">No bookings found</div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/5">
                      {["Ref", "User", "Route", "Type", "Date", "Amount", "Status"].map((h) => (
                        <th key={h} className="text-left px-5 py-3 text-gray-500 text-xs uppercase tracking-wide font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((b) => (
                      <tr key={b.id} className="border-b border-white/3 hover:bg-white/3 transition-colors">
                        <td className="px-5 py-3.5 text-orange-500 font-mono font-bold text-xs">{b.bookingRef}</td>
                        <td className="px-5 py-3.5">
                          <p className="text-white text-xs font-medium truncate max-w-[120px]">{b.userName}</p>
                          <p className="text-gray-600 text-xs truncate max-w-[120px]">{b.userEmail}</p>
                        </td>
                        <td className="px-5 py-3.5 text-white text-xs">{b.fromCity} → {b.toCity}</td>
                        <td className="px-5 py-3.5">
                          <span className="flex items-center gap-1 text-gray-400 text-xs capitalize">{typeIcon[b.type]} {b.type}</span>
                        </td>
                        <td className="px-5 py-3.5 text-gray-400 text-xs">{b.departDate}</td>
                        <td className="px-5 py-3.5 text-white font-semibold text-xs">₹{(b.totalPrice ?? 0).toLocaleString()}</td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${
                            b.status === "Confirmed"
                              ? "bg-green-400/10 text-green-400 border-green-400/20"
                              : "bg-red-400/10 text-red-400 border-red-400/20"
                          }`}>
                            {b.status === "Confirmed" ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                            {b.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="sm:hidden p-4 space-y-3">
                {bookings.map((b) => (
                  <div key={b.id} className="bg-white/3 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-orange-500 font-mono font-bold text-xs">{b.bookingRef}</span>
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${
                        b.status === "Confirmed"
                          ? "bg-green-400/10 text-green-400 border-green-400/20"
                          : "bg-red-400/10 text-red-400 border-red-400/20"
                      }`}>
                        {b.status === "Confirmed" ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                        {b.status}
                      </span>
                    </div>
                    <p className="text-white text-sm font-medium">{b.fromCity} → {b.toCity}</p>
                    <p className="text-gray-500 text-xs mt-0.5">{b.userName} · {b.departDate}</p>
                    <p className="text-orange-500 font-bold text-sm mt-1">₹{(b.totalPrice ?? 0).toLocaleString()}</p>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {bookingMeta.totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 p-4 border-t border-white/5">
                  <button
                    onClick={() => fetchBookings(bookingMeta.page - 1)}
                    disabled={bookingMeta.page <= 1}
                    className="btn-secondary !py-2 !px-3 text-xs disabled:opacity-30"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <span className="text-gray-400 text-xs">
                    Page {bookingMeta.page} of {bookingMeta.totalPages}
                  </span>
                  <button
                    onClick={() => fetchBookings(bookingMeta.page + 1)}
                    disabled={bookingMeta.page >= bookingMeta.totalPages}
                    className="btn-secondary !py-2 !px-3 text-xs disabled:opacity-30"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}
