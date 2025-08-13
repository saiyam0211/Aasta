"use client";

import { MapPin, ShoppingCart, User, SlidersHorizontal, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useMemo, useState } from "react";

interface HomeHeaderProps {
  locationLabel: string;
  onLocationClick?: () => void;
  onSearch?: (query: string) => void;
  onFilterClick?: () => void;
  onCartClick?: () => void;
  onProfileClick?: () => void;
  className?: string;
}

export function HomeHeader({
  locationLabel,
  onLocationClick,
  onSearch,
  onFilterClick,
  onCartClick,
  onProfileClick,
  className
}: HomeHeaderProps) {
  const [query, setQuery] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const placeholders = useMemo(
    () => ["fries", "burger", "maggie", "pasta", "biryani"],
    []
  );

  useEffect(() => {
    const id = setInterval(() => {
      setPlaceholderIndex((i) => (i + 1) % placeholders.length);
    }, 5000);
    return () => clearInterval(id);
  }, [placeholders.length]);

  const placeholderText = placeholders[placeholderIndex];

  const shortLocation = useMemo(() => {
    if (!locationLabel) return "";
    const firstPart = locationLabel.split(",")[0]?.trim() || locationLabel;
    const maxLen = 24;
    return firstPart.length > maxLen ? firstPart.slice(0, maxLen) + "..." : firstPart;
  }, [locationLabel]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && query.trim()) onSearch(query.trim());
  };

  return (
    <div className={cn("rounded-b-[50px] bg-[#D2F86A] text-black p-5 pt-6 z-10", className)}>
      {/* Top row: location + actions */}
      <div className="flex items-center justify-between mb-5">
        <button
          type="button"
          onClick={onLocationClick}
          className="flex items-center glass-liquid gap-2 rounded-full bg-[#002A01]/5 px-3 py-2"
        >
          <div className="w-8 h-8 glass-liquid rounded-full bg-black/10 flex items-center justify-center">
            <MapPin className="w-4 h-4" />
          </div>
          <div className="text-left max-w-[180px]">
            <div className="text-xs text-gray-900">Location</div>
            <div className="text-sm font-medium text-black truncate">{shortLocation}...</div>
          </div>
        </button>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onProfileClick}
            className="w-10 h-10 glass-liquid rounded-full bg-[#002A01]/5 flex items-center justify-center"
          >
            <User className="w-5 h-5" />
          </button>
          {/* <button
            type="button"
            onClick={onCartClick}
            className="w-10 h-10 rounded-full bg-[#002A01]/5 flex items-center justify-center"
          >
            <ShoppingCart className="w-5 h-5" />
          </button> */}
        </div>
      </div>

      {/* Headline */}
      <div className="mb-4 mt-10">
        <h1 className="text-[28px] leading-8 font-extrabold tracking-tight">
          Your Next Meal is Just a
          <br />
          Tap Away!
        </h1>
      </div>

      {/* Search row */}
      <form onSubmit={handleSubmit} className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="absolute z-50 left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#002A01]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={" "}
            className="w-full h-12 rounded-full glass-liquid px-12 text-black placeholder:text-transparent outline-none"
          />
          {/* Animated placeholder overlay */}
          {!query && (
            <span
              key={placeholderText}
              className="pointer-events-none absolute left-12 top-1/2 -translate-y-1/2 text-gray-900 placeholder-animate"
            >
              {`Search "${placeholderText}".`}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onFilterClick}
          className="w-12 h-12 rounded-full glass-liquid flex items-center justify-center"
          aria-label="Filter"
        >
          <SlidersHorizontal className="w-5 h-5 text-[#002A01]" />
        </button>
      </form>
    </div>
  );
} 