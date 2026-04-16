"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, RefreshCw } from "lucide-react";

// Seat layout configs per transport type
const LAYOUTS = {
  flight: { cols: ["A", "B", "C", "", "D", "E", "F"], rows: 5, label: "Row" },
  train:  { cols: ["A", "B", "", "C", "D"],           rows: 8, label: "Berth" },
  bus:    { cols: ["A", "B", "", "C", "D"],           rows: 7, label: "Row" },
};

export default function SeatMap({ routeId, type, travelers, selectedSeats, onSeatsChange }) {
  const [bookedSeats, setBookedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const layout = LAYOUTS[type] || LAYOUTS.flight;

  // Fetch booked seats
  const fetchSeats = useCallback(async () => {
    try {
      const res = await fetch(`/api/seats/${routeId}`);
      const data = await res.json();
      if (data.success) {
        setBookedSeats(data.data.bookedSeats || []);
        setLastUpdated(new Date());
      }
    } catch {
      // silent fail for polling
    } finally {
      setLoading(false);
    }
  }, [routeId]);

  // Initial fetch + polling every 3 seconds for real-time updates
  useEffect(() => {
    fetchSeats();
    const interval = setInterval(fetchSeats, 3000);
    return () => clearInterval(interval);
  }, [fetchSeats]);

  // Check if another user booked a seat we had selected
  useEffect(() => {
    if (bookedSeats.length > 0 && selectedSeats.length > 0) {
      const conflicting = selectedSeats.filter(s => bookedSeats.includes(s));
      if (conflicting.length > 0) {
        // Remove conflicting seats from selection
        const remaining = selectedSeats.filter(s => !bookedSeats.includes(s));
        onSeatsChange(remaining);
      }
    }
  }, [bookedSeats]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleSeat = (seatId) => {
    if (bookedSeats.includes(seatId)) return; // booked by someone else

    if (selectedSeats.includes(seatId)) {
      onSeatsChange(selectedSeats.filter((s) => s !== seatId));
    } else if (selectedSeats.length < travelers) {
      onSeatsChange([...selectedSeats, seatId]);
    }
  };

  const getSeatStatus = (seatId) => {
    if (bookedSeats.includes(seatId)) return "booked";
    if (selectedSeats.includes(seatId)) return "selected";
    return "available";
  };

  const getSeatStyle = (status) => {
    switch (status) {
      case "booked":
        return "bg-red-500/20 border-red-500/30 text-red-400/60 cursor-not-allowed";
      case "selected":
        return "bg-orange-500 border-orange-400 text-white shadow-lg shadow-orange-500/30 scale-110";
      default:
        return "bg-white/5 border-white/15 text-gray-400 hover:bg-orange-500/10 hover:border-orange-500/30 hover:text-orange-400 cursor-pointer";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 size={20} className="animate-spin text-orange-500" />
        <span className="ml-2 text-gray-400 text-sm">Loading seat map...</span>
      </div>
    );
  }

  return (
    <div>
      {/* Legend + Live indicator */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-white/5 border border-white/15" />
            <span className="text-gray-500 text-xs">Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-orange-500 border border-orange-400" />
            <span className="text-gray-500 text-xs">Selected</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-red-500/20 border border-red-500/30" />
            <span className="text-gray-500 text-xs">Booked</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-green-500 text-xs font-medium">Live</span>
        </div>
      </div>

      {/* Seat selection count */}
      <div className="text-center mb-3">
        <p className="text-gray-400 text-xs">
          Select <span className="text-orange-500 font-semibold">{travelers}</span> seat{travelers > 1 ? "s" : ""} 
          {selectedSeats.length > 0 && (
            <> — <span className="text-orange-500 font-semibold">{selectedSeats.length}</span> selected</>
          )}
        </p>
      </div>

      {/* Front indicator */}
      <div className="text-center mb-2">
        <span className="text-gray-600 text-[10px] uppercase tracking-widest">
          {type === "flight" ? "✈ Cockpit" : type === "train" ? "🚂 Engine" : "🚌 Driver"}
        </span>
        <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-gray-700 to-transparent mx-auto mt-1" />
      </div>

      {/* Seat Grid */}
      <div className="flex flex-col items-center gap-1.5 mb-4">
        {Array.from({ length: layout.rows }, (_, rowIdx) => {
          const rowNum = rowIdx + 1;
          return (
            <div key={rowNum} className="flex items-center gap-1">
              <span className="text-gray-700 text-[10px] w-4 text-right mr-1">{rowNum}</span>
              {layout.cols.map((col, colIdx) => {
                if (col === "") {
                  // Aisle
                  return <div key={`aisle-${colIdx}`} className="w-4" />;
                }
                const seatId = `${rowNum}${col}`;
                const status = getSeatStatus(seatId);
                return (
                  <button
                    key={seatId}
                    type="button"
                    onClick={() => toggleSeat(seatId)}
                    disabled={status === "booked"}
                    title={`Seat ${seatId}${status === "booked" ? " (Booked)" : status === "selected" ? " (Selected)" : ""}`}
                    className={`w-8 h-8 rounded-md border text-[10px] font-bold transition-all duration-200 flex items-center justify-center ${getSeatStyle(status)}`}
                  >
                    {status === "booked" ? "✕" : seatId}
                  </button>
                );
              })}
              <span className="text-gray-700 text-[10px] w-4 ml-1">{rowNum}</span>
            </div>
          );
        })}
      </div>

      {/* Column headers */}
      <div className="flex justify-center gap-1 mb-3">
        <span className="w-4 mr-1" />
        {layout.cols.map((col, i) =>
          col === "" ? (
            <div key={`h-${i}`} className="w-4" />
          ) : (
            <span key={col} className="w-8 text-center text-gray-600 text-[10px] font-medium">{col}</span>
          )
        )}
      </div>

      {/* Selected seats display */}
      {selectedSeats.length > 0 && (
        <div className="bg-orange-500/5 border border-orange-500/20 rounded-lg p-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-gray-400 text-xs">Your seats:</span>
            {selectedSeats.sort().map((s) => (
              <span key={s} className="bg-orange-500/20 text-orange-400 text-xs font-bold px-2 py-0.5 rounded">
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Last updated */}
      {lastUpdated && (
        <div className="flex items-center justify-center gap-1 mt-2">
          <RefreshCw size={9} className="text-gray-700" />
          <span className="text-gray-700 text-[10px]">
            Updated {lastUpdated.toLocaleTimeString()}
          </span>
        </div>
      )}
    </div>
  );
}
