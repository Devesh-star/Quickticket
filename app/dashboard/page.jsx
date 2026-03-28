import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import BookingsList from "@/components/BookingsList";
import { connectDB } from "@/lib/mongodb";
import { LayoutDashboard, Ticket, CheckCircle2, XCircle, IndianRupee, Plus } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  await connectDB();

  const mongoose = (await import("mongoose")).default;
  const { Booking } = await import("@/models/Booking");

  // Safety check — make sure id is valid before converting
  let userId;
  try {
    userId = new mongoose.Types.ObjectId(session.user.id);
  } catch {
    redirect("/auth/login");
  }

  const [bookings, statsRaw] = await Promise.all([
    Booking.find({ userId }).sort({ createdAt: -1 }).lean(),
    Booking.aggregate([
      { $match: { userId } },
      { $group: { _id: "$status", count: { $sum: 1 }, total: { $sum: "$totalPrice" } } },
    ]),
  ]);

  const statMap = Object.fromEntries(statsRaw.map((s) => [s._id, s]));
  const confirmed  = statMap["Confirmed"]?.count ?? 0;
  const cancelled  = statMap["Cancelled"]?.count  ?? 0;
  const totalSpent = statMap["Confirmed"]?.total   ?? 0;

  const stats = [
    { label: "Total Trips",  value: String(bookings.length), icon: <Ticket size={18} />,       color: "text-orange-500" },
    { label: "Confirmed",    value: String(confirmed),        icon: <CheckCircle2 size={18} />, color: "text-green-500"  },
    { label: "Cancelled",    value: String(cancelled),        icon: <XCircle size={18} />,      color: "text-red-400"    },
    { label: "Total Spent",  value: `₹${Math.round(totalSpent).toLocaleString()}`, icon: <IndianRupee size={18} />, color: "text-blue-400" },
  ];

  const serialized = bookings.map((b) => ({
    ...b,
    id: b._id.toString(),
    _id: b._id.toString(),
    userId: b.userId.toString(),
    createdAt: b.createdAt ? new Date(b.createdAt).toISOString() : null,
    updatedAt: b.updatedAt ? new Date(b.updatedAt).toISOString() : null,
  }));

  const user = session.user;

  return (
    <main className="min-h-screen bg-[#0a0a14]">
      <Navbar initialSession={session} />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-28 pb-16">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div className="flex items-center gap-4">
            {user.image ? (
              <Image src={user.image} alt={user.name ?? "User"} width={56} height={56}
                className="rounded-2xl ring-2 ring-orange-500/40" />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500 font-display font-bold text-xl ring-2 ring-orange-500/40">
                {user.name?.[0] ?? "U"}
              </div>
            )}
            <div>
              <p className="text-gray-500 text-sm mb-0.5 flex items-center gap-1.5">
                <LayoutDashboard size={13} /> Dashboard
              </p>
              <h1 className="font-display text-2xl font-bold text-white">
                Welcome back, <span className="text-orange-500">{user.name?.split(" ")[0]}!</span>
              </h1>
              <p className="text-gray-500 text-sm mt-0.5">{user.email}</p>
            </div>
          </div>
          <Link href="/" className="btn-primary flex items-center gap-2 self-start sm:self-auto">
            <Plus size={16} /> Book New Trip
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {stats.map((stat) => (
            <div key={stat.label} className="glass rounded-2xl p-4 card-hover">
              <div className={`mb-2 ${stat.color}`}>{stat.icon}</div>
              <p className={`font-display text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        <BookingsList initialBookings={serialized} />
      </div>
    </main>
  );
}
