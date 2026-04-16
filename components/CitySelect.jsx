"use client";

import { useState, useRef, useEffect } from "react";
import { MapPin, ChevronDown } from "lucide-react";

const CITIES = [
  "Agra", "Ahmedabad", "Amritsar", "Bangalore", "Bhopal", "Bhubaneswar",
  "Chandigarh", "Chennai", "Coimbatore", "Dehradun", "Delhi", "Goa",
  "Guwahati", "Hyderabad", "Indore", "Jaipur", "Kochi", "Kolkata",
  "Lucknow", "Mumbai", "Mysore", "Nagpur", "Patna", "Pondicherry",
  "Pune", "Ranchi", "Srinagar", "Thiruvananthapuram", "Udaipur",
  "Varanasi", "Visakhapatnam",
];

export default function CitySelect({ value, onChange, placeholder = "Select city", id }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  const filtered = CITIES.filter((c) =>
    c.toLowerCase().includes(query.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSelect = (city) => {
    onChange(city);
    setOpen(false);
    setQuery("");
  };

  const handleInputFocus = () => {
    setOpen(true);
    setQuery("");
  };

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    if (!open) setOpen(true);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      setOpen(false);
      setQuery("");
      inputRef.current?.blur();
    }
    if (e.key === "Enter" && filtered.length > 0) {
      e.preventDefault();
      handleSelect(filtered[0]);
    }
  };

  return (
    <div ref={wrapperRef} className="relative" id={id}>
      <MapPin size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-orange-500 z-10 pointer-events-none" />
      <input
        ref={inputRef}
        type="text"
        value={open ? query : value}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onKeyDown={handleKeyDown}
        placeholder={value || placeholder}
        className="input-field !pl-9 !pr-8 cursor-pointer"
        autoComplete="off"
      />
      <ChevronDown
        size={14}
        className={`absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none transition-transform ${open ? "rotate-180" : ""}`}
      />

      {open && (
        <div className="absolute z-50 top-full mt-1.5 left-0 right-0 bg-[#1a1a2e] border border-white/10 rounded-xl shadow-2xl max-h-52 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="px-4 py-3 text-gray-500 text-sm">No cities found</div>
          ) : (
            filtered.map((city) => (
              <button
                key={city}
                type="button"
                onClick={() => handleSelect(city)}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-2.5 ${
                  city === value
                    ? "bg-orange-500/10 text-orange-400 font-medium"
                    : "text-gray-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <MapPin size={12} className={city === value ? "text-orange-500" : "text-gray-600"} />
                {city}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
