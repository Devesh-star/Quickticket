"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import {
  Shield, ArrowLeft, Plus, Pencil, Trash2, X, Loader2, Save,
  Plane, Train, Bus, MapPin
} from "lucide-react";
import toast from "react-hot-toast";

const TYPES = ["flight", "train", "bus"];
const typeIcon = { flight: <Plane size={14} />, train: <Train size={14} />, bus: <Bus size={14} /> };

const EMPTY_FORM = {
  type: "flight",
  fromCity: "",
  toCity: "",
  price: "",
  duration: "",
  operator: "",
  departure: "",
  arrival: "",
  totalSeats: "30",
};

export default function AdminRoutesPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();

  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const isAdmin = session?.user?.role === "admin";

  useEffect(() => {
    if (authStatus === "loading") return;
    if (!session?.user || !isAdmin) {
      router.replace("/");
      return;
    }
    fetchRoutes();
  }, [authStatus, session]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchRoutes = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/routes");
      const data = await res.json();
      if (data.success) setRoutes(data.data.routes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openNew = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEdit = (route) => {
    setEditingId(route.id);
    setForm({
      type: route.type,
      fromCity: route.fromCity,
      toCity: route.toCity,
      price: String(route.price),
      duration: route.duration || "",
      operator: route.operator || "",
      departure: route.departure || "",
      arrival: route.arrival || "",
      totalSeats: String(route.totalSeats || 30),
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fromCity || !form.toCity || !form.price || !form.operator) {
      toast.error("Fill in all required fields");
      return;
    }
    setSaving(true);
    try {
      const url = editingId ? `/api/admin/routes/${editingId}` : "/api/admin/routes";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(editingId ? "Route updated!" : "Route created!");
      setShowForm(false);
      fetchRoutes();
    } catch (err) {
      toast.error(err.message || "Failed to save route");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this route?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/routes/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Route deleted");
      setRoutes((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      toast.error(err.message || "Failed to delete");
    } finally {
      setDeletingId(null);
    }
  };

  const updateForm = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  if (authStatus === "loading" || (authStatus === "authenticated" && loading)) {
    return (
      <main className="min-h-screen bg-[#0a0a14] flex items-center justify-center">
        <Navbar />
        <Loader2 size={24} className="animate-spin text-orange-500" />
      </main>
    );
  }

  if (!isAdmin) return null;

  return (
    <main className="min-h-screen bg-[#0a0a14]">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-gray-500 hover:text-white transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="font-display text-2xl font-bold text-white flex items-center gap-2">
                <MapPin size={20} className="text-orange-500" /> Route Management
              </h1>
              <p className="text-gray-500 text-sm">{routes.length} routes in database</p>
            </div>
          </div>
          <button onClick={openNew} className="btn-primary flex items-center gap-2 self-start sm:self-auto text-sm">
            <Plus size={15} /> Add Route
          </button>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => !saving && setShowForm(false)} />
            <div className="relative glass-dark rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="flex items-center justify-between p-5 border-b border-white/8">
                <h2 className="font-display font-bold text-white">
                  {editingId ? "Edit Route" : "Add New Route"}
                </h2>
                {!saving && (
                  <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-white">
                    <X size={18} />
                  </button>
                )}
              </div>
              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                {/* Type */}
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wide mb-1.5 block">Type *</label>
                  <div className="flex gap-2">
                    {TYPES.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => updateForm("type", t)}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                          form.type === t
                            ? "bg-orange-500 text-white shadow-lg shadow-orange-500/30"
                            : "text-gray-400 hover:text-white bg-white/5 hover:bg-white/10"
                        }`}
                      >
                        {typeIcon[t]} {t.charAt(0).toUpperCase() + t.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* From / To */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wide mb-1.5 block">From City *</label>
                    <input value={form.fromCity} onChange={(e) => updateForm("fromCity", e.target.value)}
                      className="input-field" placeholder="Delhi" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wide mb-1.5 block">To City *</label>
                    <input value={form.toCity} onChange={(e) => updateForm("toCity", e.target.value)}
                      className="input-field" placeholder="Mumbai" />
                  </div>
                </div>

                {/* Operator / Price */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wide mb-1.5 block">Operator *</label>
                    <input value={form.operator} onChange={(e) => updateForm("operator", e.target.value)}
                      className="input-field" placeholder="IndiGo" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wide mb-1.5 block">Base Price (₹) *</label>
                    <input type="number" value={form.price} onChange={(e) => updateForm("price", e.target.value)}
                      className="input-field" placeholder="2499" />
                  </div>
                </div>

                {/* Departure / Arrival */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wide mb-1.5 block">Departure</label>
                    <input value={form.departure} onChange={(e) => updateForm("departure", e.target.value)}
                      className="input-field" placeholder="06:00" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wide mb-1.5 block">Arrival</label>
                    <input value={form.arrival} onChange={(e) => updateForm("arrival", e.target.value)}
                      className="input-field" placeholder="08:30" />
                  </div>
                </div>

                {/* Duration / Seats */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wide mb-1.5 block">Duration</label>
                    <input value={form.duration} onChange={(e) => updateForm("duration", e.target.value)}
                      className="input-field" placeholder="2h 30m" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wide mb-1.5 block">Total Seats</label>
                    <input type="number" value={form.totalSeats} onChange={(e) => updateForm("totalSeats", e.target.value)}
                      className="input-field" placeholder="30" />
                  </div>
                </div>

                <button type="submit" disabled={saving} className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
                  {saving
                    ? <><Loader2 size={16} className="animate-spin" /> Saving...</>
                    : <><Save size={16} /> {editingId ? "Update Route" : "Create Route"}</>
                  }
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Routes Table */}
        <div className="glass rounded-2xl overflow-hidden">
          {routes.length === 0 ? (
            <div className="text-center py-16">
              <MapPin size={40} className="text-gray-700 mx-auto mb-3" />
              <p className="text-gray-400 font-medium">No routes yet</p>
              <p className="text-gray-600 text-sm mt-1">Add your first route to get started</p>
            </div>
          ) : (
            <>
              {/* Desktop */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/5">
                      {["Type", "Route", "Operator", "Schedule", "Price", "Seats", "Actions"].map((h) => (
                        <th key={h} className="text-left px-5 py-3 text-gray-500 text-xs uppercase tracking-wide font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {routes.map((r) => (
                      <tr key={r.id} className="border-b border-white/3 hover:bg-white/3 transition-colors">
                        <td className="px-5 py-3.5">
                          <span className="flex items-center gap-1.5 text-gray-400 text-xs capitalize">
                            {typeIcon[r.type]} {r.type}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-white font-medium text-xs">{r.fromCity} → {r.toCity}</td>
                        <td className="px-5 py-3.5 text-gray-400 text-xs">{r.operator}</td>
                        <td className="px-5 py-3.5 text-gray-500 text-xs">{r.departure || "—"} – {r.arrival || "—"} · {r.duration || "—"}</td>
                        <td className="px-5 py-3.5 text-orange-500 font-bold text-xs">₹{(r.price ?? 0).toLocaleString()}</td>
                        <td className="px-5 py-3.5 text-gray-400 text-xs">{r.seatsLeft ?? 0}/{r.totalSeats ?? 0}</td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <button onClick={() => openEdit(r)}
                              className="text-gray-500 hover:text-blue-400 transition-colors p-1">
                              <Pencil size={14} />
                            </button>
                            <button onClick={() => handleDelete(r.id)} disabled={deletingId === r.id}
                              className="text-gray-500 hover:text-red-400 transition-colors p-1 disabled:opacity-30">
                              {deletingId === r.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile */}
              <div className="sm:hidden p-4 space-y-3">
                {routes.map((r) => (
                  <div key={r.id} className="bg-white/3 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="flex items-center gap-1.5 text-gray-400 text-xs capitalize">
                        {typeIcon[r.type]} {r.type}
                      </span>
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(r)} className="text-gray-500 hover:text-blue-400 p-1">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => handleDelete(r.id)} disabled={deletingId === r.id}
                          className="text-gray-500 hover:text-red-400 p-1">
                          {deletingId === r.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                        </button>
                      </div>
                    </div>
                    <p className="text-white font-medium text-sm">{r.fromCity} → {r.toCity}</p>
                    <p className="text-gray-500 text-xs mt-0.5">{r.operator} · {r.departure || "—"} – {r.arrival || "—"}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-orange-500 font-bold">₹{(r.price ?? 0).toLocaleString()}</span>
                      <span className="text-gray-600 text-xs">{r.seatsLeft ?? 0}/{r.totalSeats ?? 0} seats</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
