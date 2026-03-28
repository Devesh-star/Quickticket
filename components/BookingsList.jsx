"use client";

import { useState } from "react";
import { Plane, Train, Bus, CheckCircle2, XCircle, Trash2, Loader2, ChevronDown, ChevronUp, CreditCard, Calendar, Users, Clock } from "lucide-react";
import toast from "react-hot-toast";

const typeIcon = {
  flight: <Plane size={15} />,
  train:  <Train size={15} />,
  bus:    <Bus size={15} />,
};

const statusConfig = {
  Confirmed: { color: "bg-green-400/10 text-green-400 border-green-400/20", icon: <CheckCircle2 size={11} /> },
  Cancelled: { color: "bg-red-400/10 text-red-400 border-red-400/20",       icon: <XCircle size={11} />     },
};

const paymentStatusConfig = {
  Paid:    { color: "text-green-400", label: "Paid" },
  Pending: { color: "text-amber-400", label: "Pending" },
  Failed:  { color: "text-red-400",   label: "Failed" },
};

export default function BookingsList({ initialBookings }) {
  const [bookings, setBookings]   = useState(initialBookings);
  const [cancelling, setCancelling] = useState(null);
  const [expanded, setExpanded]   = useState(null);

  const handleCancel = async (id) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    setCancelling(id);
    try {
      const res = await fetch(`/api/bookings/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status: "Cancelled" } : b));
      toast.success("Booking cancelled");
    } catch (err) {
      toast.error(err.message || "Failed to cancel");
    } finally {
      setCancelling(null);
    }
  };

  if (bookings.length === 0) {
    return (
      <div>
        <h2 className="font-display font-semibold text-lg text-white mb-4">My Bookings</h2>
        <div className="glass rounded-2xl p-16 text-center">
          <Plane size={44} className="text-gray-700 mx-auto mb-3" />
          <p className="text-gray-400 font-medium">No bookings yet</p>
          <p className="text-gray-600 text-sm mt-1">Go back home to search and book your first trip!</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-display font-semibold text-lg text-white mb-4">
        My Bookings <span className="text-gray-600 font-normal text-sm">({bookings.length})</span>
      </h2>
      <div className="space-y-3">
        {bookings.map((booking) => {
          const status = statusConfig[booking.status] ?? statusConfig.Confirmed;
          const isOpen = expanded === booking.id;
          return (
            <div key={booking.id} className={`glass rounded-2xl overflow-hidden transition-all ${booking.status === "Cancelled" ? "opacity-55" : ""}`}>
              <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-white/3 transition-all"
                onClick={() => setExpanded(isOpen ? null : booking.id)}>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center flex-shrink-0">
                    {typeIcon[booking.type] ?? <Plane size={15} />}
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">
                      {booking.fromCity} <span className="text-gray-500 font-normal">→</span> {booking.toCity}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
                      <span className="text-gray-500 text-xs">{booking.operator}</span>
                      <span className="text-gray-500 text-xs flex items-center gap-1"><Calendar size={10} />{booking.departDate}</span>
                      <span className="text-gray-500 text-xs flex items-center gap-1"><Users size={10} />{booking.travelers}</span>
                    </div>
                    <p className="text-gray-600 text-xs font-mono mt-0.5">{booking.bookingRef}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border ${status.color}`}>
                    {status.icon} {booking.status}
                  </span>
                  <p className="font-display font-bold text-white text-base">₹{(booking.totalPrice ?? 0).toLocaleString()}</p>
                  {booking.status === "Confirmed" && (
                    <button onClick={(e) => { e.stopPropagation(); handleCancel(booking.id); }}
                      disabled={cancelling === booking.id}
                      className="text-gray-600 hover:text-red-400 transition-colors disabled:opacity-40">
                      {cancelling === booking.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                    </button>
                  )}
                  {isOpen ? <ChevronUp size={15} className="text-gray-500" /> : <ChevronDown size={15} className="text-gray-500" />}
                </div>
              </div>
              {isOpen && (
                <div className="border-t border-white/5 px-5 py-4 bg-black/10">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4 text-sm">
                    {[
                      ["Seat Class", booking.seatClass],
                      ["Departure", booking.departure ?? "—"],
                      ["Arrival", booking.arrival ?? "—"],
                      ["Duration", booking.duration ?? "—"],
                      ["Price/Person", `₹${(booking.pricePerPerson ?? 0).toLocaleString()}`],
                    ].map(([label, value]) => (
                      <div key={label}>
                        <p className="text-gray-600 text-xs mb-1 uppercase tracking-wide">{label}</p>
                        <p className="text-white">{value}</p>
                      </div>
                    ))}
                    <div>
                      <p className="text-gray-600 text-xs mb-1 uppercase tracking-wide">Payment</p>
                      <p className={`flex items-center gap-1 ${(paymentStatusConfig[booking.paymentStatus] ?? paymentStatusConfig.Paid).color}`}>
                        <CreditCard size={11} />{booking.paymentMethod ?? "Card"} · {(paymentStatusConfig[booking.paymentStatus] ?? paymentStatusConfig.Paid).label}
                      </p>
                    </div>
                    <div className="col-span-2 sm:col-span-3">
                      <p className="text-gray-600 text-xs mb-1 uppercase tracking-wide">Booking Reference</p>
                      <p className="text-orange-500 font-mono font-bold tracking-widest">{booking.bookingRef}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
