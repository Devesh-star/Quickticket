"use client";

import { useState, useEffect, useRef, Suspense, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Plane, Train, Bus, SlidersHorizontal, X, Loader2, ArrowUpDown, Search } from "lucide-react";

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const from = searchParams.get("from") || "";
  const to = searchParams.get("to") || "";
  const type = searchParams.get("type") || "all";
  const travelers = parseInt(searchParams.get("travelers") || "1");
  const departDate = searchParams.get("departDate") || "";
  const returnDate = searchParams.get("returnDate") || "";

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Filter state — slider value is instant, debouncedPrice drives API calls
  const [sliderPrice, setSliderPrice] = useState("");
  const [debouncedPrice, setDebouncedPrice] = useState("");
  const [priceRange, setPriceRange] = useState({ min: 0, max: 20000 });
  const [selectedTypes, setSelectedTypes] = useState(
    type !== "all" ? [type] : ["flight", "train", "bus"]
  );
  const [selectedOperators, setSelectedOperators] = useState([]);
  const [availableOperators, setAvailableOperators] = useState([]);
  const [sortBy, setSortBy] = useState("price-asc");
  const debounceRef = useRef(null);

  // Debounce slider → API price (400ms after user stops dragging)
  const handleSliderChange = (val) => {
    setSliderPrice(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedPrice(val), 400);
  };

  const fetchResults = useCallback(async () => {
    if (!from || !to) { setLoading(false); return; }
    setLoading(true);
    try {
      const query = new URLSearchParams({ from, to, travelers: String(travelers) });
      if (selectedTypes.length === 1) query.set("type", selectedTypes[0]);
      else if (selectedTypes.length < 3) {
        // API supports single type, so we fetch all and filter client-side
      }
      if (debouncedPrice) query.set("maxPrice", debouncedPrice);
      if (selectedOperators.length > 0) query.set("operators", selectedOperators.join(","));

      const res = await fetch(`/api/search?${query}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      let routes = data.data.routes || [];

      // Client-side type filter when multiple types selected but not all
      if (selectedTypes.length > 0 && selectedTypes.length < 3) {
        routes = routes.filter((r) => selectedTypes.includes(r.type));
      }

      setResults(routes);

      // Update filter metadata
      if (data.data.filters) {
        setAvailableOperators(data.data.filters.operators || []);
        setPriceRange(data.data.filters.priceRange || { min: 0, max: 20000 });
      }
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [from, to, travelers, selectedTypes, debouncedPrice, selectedOperators]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  // Update URL when filters change
  const updateUrl = useCallback((updates) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, val]) => {
      if (val) params.set(key, val);
      else params.delete(key);
    });
    router.replace(`/search?${params.toString()}`, { scroll: false });
  }, [searchParams, router]);

  const toggleType = (t) => {
    setSelectedTypes((prev) => {
      const next = prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t];
      return next.length === 0 ? [t] : next; // ensure at least one
    });
  };

  const toggleOperator = (op) => {
    setSelectedOperators((prev) =>
      prev.includes(op) ? prev.filter((x) => x !== op) : [...prev, op]
    );
  };

  // Sort results
  const sortedResults = [...results].sort((a, b) => {
    switch (sortBy) {
      case "price-asc": return a.price - b.price;
      case "price-desc": return b.price - a.price;
      case "duration": return (a.duration || "").localeCompare(b.duration || "");
      default: return 0;
    }
  });

  const typeColors = { flight: "text-blue-400", train: "text-green-400", bus: "text-yellow-400" };
  const typeLabels = { flight: "✈ Flight", train: "🚂 Train", bus: "🚌 Bus" };
  const typeIcons = {
    flight: <Plane size={14} />,
    train: <Train size={14} />,
    bus: <Bus size={14} />,
  };

  const sliderValue = Number(sliderPrice || priceRange.max);
  const sliderPercent = priceRange.max > priceRange.min
    ? ((sliderValue - priceRange.min) / (priceRange.max - priceRange.min)) * 100
    : 100;

  // Filter content as JSX variable (NOT a component) so React preserves DOM identity during drag
  const filterContent = (
    <div className="space-y-6">
      {/* Price Range */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold text-sm">Max Price</h3>
          <span className="text-orange-500 font-display font-bold text-lg">
            ₹{sliderValue.toLocaleString()}
          </span>
        </div>
        <div className="space-y-3">
          <div className="relative h-10 flex items-center">
            {/* Track background */}
            <div className="absolute inset-x-0 h-2 rounded-full bg-white/8" />
            {/* Filled track */}
            <div
              className="absolute left-0 h-2 rounded-full pointer-events-none"
              style={{
                width: `${sliderPercent}%`,
                background: 'linear-gradient(90deg, #f97316, #fb923c)',
                boxShadow: '0 0 12px rgba(249,115,22,0.3)',
              }}
            />
            {/* Native range input on top */}
            <input
              type="range"
              min={priceRange.min}
              max={priceRange.max}
              step={Math.max(1, Math.round((priceRange.max - priceRange.min) / 200))}
              value={sliderValue}
              onChange={(e) => handleSliderChange(e.target.value)}
              className="price-slider absolute inset-x-0 w-full h-10 cursor-pointer"
            />
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>₹{priceRange.min.toLocaleString()}</span>
            <span>₹{priceRange.max.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Operators */}
      {availableOperators.length > 0 && (
        <div>
          <h3 className="text-white font-semibold text-sm mb-3">Operators</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar">
            {availableOperators.map((op) => (
              <label key={op} className="flex items-center gap-3 cursor-pointer group">
                <div
                  onClick={() => toggleOperator(op)}
                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                    selectedOperators.includes(op)
                      ? "bg-orange-500 border-orange-500"
                      : "border-gray-600 group-hover:border-gray-400"
                  }`}
                >
                  {selectedOperators.includes(op) && (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <span className={`text-sm ${selectedOperators.includes(op) ? "text-white" : "text-gray-400"}`}>
                  {op}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Clear Filters */}
      <button
        onClick={() => {
          setSliderPrice("");
          setDebouncedPrice("");
          setSelectedTypes(["flight", "train", "bus"]);
          setSelectedOperators([]);
        }}
        className="btn-secondary w-full text-sm py-2.5"
      >
        Clear All Filters
      </button>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#0a0a14]">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-white">
              {from} <span className="text-gray-500">→</span> {to}
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {loading ? "Searching..." : `${sortedResults.length} route${sortedResults.length !== 1 ? "s" : ""} found`}
              {travelers > 1 && ` · ${travelers} travelers`}
              {departDate && ` · ${departDate}`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Sort */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="input-field !py-2.5 !pl-9 !pr-4 text-sm appearance-none cursor-pointer"
              >
                <option value="price-asc">Price: Low → High</option>
                <option value="price-desc">Price: High → Low</option>
                <option value="duration">Duration</option>
              </select>
              <ArrowUpDown size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
            </div>
            {/* Mobile filter toggle */}
            <button
              onClick={() => setFiltersOpen(true)}
              className="lg:hidden btn-secondary !py-2.5 !px-3 flex items-center gap-2 text-sm"
            >
              <SlidersHorizontal size={14} /> Filters
            </button>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="glass rounded-2xl p-5 sticky top-24">
              <h2 className="font-display font-bold text-white text-sm mb-5 flex items-center gap-2">
                <SlidersHorizontal size={14} className="text-orange-500" /> Filters
              </h2>
              {filterContent}
            </div>
          </aside>

          {/* Results */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 size={24} className="animate-spin text-orange-500" />
                <span className="ml-3 text-gray-400">Searching routes...</span>
              </div>
            ) : sortedResults.length === 0 ? (
              <div className="glass rounded-2xl p-12 text-center">
                <Search size={40} className="text-gray-700 mx-auto mb-3" />
                <p className="text-gray-300 font-medium">No routes found</p>
                <p className="text-gray-600 text-sm mt-1">Try adjusting your filters or search for different cities</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sortedResults.map((route) => (
                  <div key={route.id} className="glass rounded-2xl p-5 card-hover">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-xl">
                          {route.type === "flight" ? "✈" : route.type === "train" ? "🚂" : "🚌"}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs font-semibold uppercase tracking-wide ${typeColors[route.type]}`}>
                              {typeLabels[route.type]}
                            </span>
                            <span className="text-gray-700">·</span>
                            <span className="text-gray-400 text-sm">{route.operator}</span>
                          </div>
                          <p className="text-white font-bold text-lg">
                            {route.fromCity} <span className="text-gray-500 font-normal text-base">→</span> {route.toCity}
                          </p>
                          <p className="text-gray-500 text-sm mt-0.5">
                            {route.departure} – {route.arrival} · {route.duration}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 sm:flex-col sm:items-end">
                        <div className="sm:text-right">
                          <p className="text-orange-500 font-display font-black text-2xl">
                            ₹{route.price.toLocaleString()}
                          </p>
                          <p className="text-gray-600 text-xs">per person · {route.seatsLeft} seats left</p>
                        </div>
                        <button
                          onClick={() => {
                            const params = new URLSearchParams({ travelers: String(travelers) });
                            if (departDate) params.set("departDate", departDate);
                            if (returnDate) params.set("returnDate", returnDate);
                            router.push(`/book/${route.id}?${params.toString()}`);
                          }}
                          className="btn-primary text-sm py-2.5 px-5 whitespace-nowrap"
                        >
                          Book Now
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {filtersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setFiltersOpen(false)} />
          <div className="absolute top-0 right-0 w-80 max-w-[85vw] h-full bg-[#12121f] border-l border-white/8 flex flex-col animate-slide-in-right overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
              <span className="font-display font-bold text-white">Filters</span>
              <button onClick={() => setFiltersOpen(false)} className="text-gray-400 hover:text-white p-1">
                <X size={20} />
              </button>
            </div>
            <div className="p-5">
              {filterContent}
            </div>
          </div>
        </div>
      )}


    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-[#0a0a14] flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-orange-500" />
      </main>
    }>
      <SearchContent />
    </Suspense>
  );
}
