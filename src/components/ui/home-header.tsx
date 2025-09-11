'use client';

import {
  MapPin,
  ShoppingCart,
  User,
  SlidersHorizontal,
  Search,
  CircleUserRound,
  TrendingUp,
  History,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Fredoka } from 'next/font/google';

// Import Fredoka font
const fredoka = Fredoka({ subsets: ['latin'], weight: ['400', '700'] });

interface HomeHeaderProps {
  locationLabel: string;
  onLocationClick?: () => void;
  onSearch?: (query: string) => void;
  onFilterClick?: () => void;
  onCartClick?: () => void;
  onProfileClick?: () => void;
  onRefresh?: () => void;
  className?: string;
  // Add new prop to control search mode
  isSearchMode?: boolean;
  // Signal from parent to reset local input and suggestions
  resetSignal?: number;
}

export function HomeHeader({
  locationLabel,
  onLocationClick,
  onSearch,
  onFilterClick,
  onCartClick,
  onProfileClick,
  onRefresh,
  className,
  isSearchMode = false,
  resetSignal,
}: HomeHeaderProps) {
  const [query, setQuery] = useState('');
  const [vegOnly, setVegOnly] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [suggestions, setSuggestions] = useState<{
    restaurants: {
      id: string;
      name: string;
      imageUrl?: string | null;
      cuisineTypes?: string[];
      rating?: number | null;
    }[];
    menuItems: {
      id: string;
      name: string;
      imageUrl?: string | null;
      price: number;
      category?: string | null;
      restaurant: { id: string; name: string };
    }[];
  }>({ restaurants: [], menuItems: [] });
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [trending, setTrending] = useState<string[]>([
    'Biryani',
    'Pizza',
    'Burger',
    'Momos',
  ]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const placeholders = useMemo(
    () => ['fries', 'burger', 'maggie', 'pasta', 'biryani'],
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
    if (!locationLabel) return '';
    // For saved addresses, show the full formatted address (houseNumber, locality, street)
    // For live location, show the full address but truncate if too long
    const maxLen = 28;
    return locationLabel.length > maxLen
      ? locationLabel.slice(0, maxLen) + '...'
      : locationLabel;
  }, [locationLabel]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (onSearch && trimmed) onSearch(trimmed);
    if (trimmed) {
      setRecentSearches((prev) => {
        const next = [
          trimmed,
          ...prev.filter((p) => p.toLowerCase() !== trimmed.toLowerCase()),
        ].slice(0, 6);
        try {
          localStorage.setItem('recent_searches', JSON.stringify(next));
        } catch {}
        return next;
      });
    }
    setSuggestionsOpen(false);
  };

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('recent_searches') || '[]');
      if (Array.isArray(saved)) setRecentSearches(saved.slice(0, 6));
    } catch {}
  }, []);

  // Debounced suggestions fetch
  useEffect(() => {
    const trimmed = query.trim();
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }

    if (trimmed.length < 2) {
      setSuggestions({ restaurants: [], menuItems: [] });
      setSuggestionsOpen(trimmed.length > 0); // show chips when 1 char
      setActiveIndex(-1);
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;
    const t = setTimeout(async () => {
      try {
        setSuggestionsLoading(true);
        const params = new URLSearchParams({
          q: trimmed,
          limit: '5',
          veg: vegOnly ? '1' : '0',
        });
        const res = await fetch(`/api/search/suggestions?${params}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error('Failed to fetch suggestions');
        const data = await res.json();
        if (data?.success) {
          setSuggestions(data.data);
          const hasAny =
            (data.data?.restaurants?.length || 0) +
              (data.data?.menuItems?.length || 0) >
            0;
          setSuggestionsOpen(true || hasAny);
          setActiveIndex(-1);
        }
      } catch (err) {
        if ((err as any)?.name === 'AbortError') return;
        setSuggestions({ restaurants: [], menuItems: [] });
        setSuggestionsOpen(false);
      } finally {
        setSuggestionsLoading(false);
      }
    }, 200);

    return () => clearTimeout(t);
  }, [query, vegOnly]);

  // Outside click to close
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) {
        setSuggestionsOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  // Keyboard navigation
  const flatSuggestions = useMemo(() => {
    const r = suggestions.restaurants.map((r) => ({
      type: 'restaurant' as const,
      item: r,
    }));
    const m = suggestions.menuItems.map((m) => ({
      type: 'menu' as const,
      item: m,
    }));
    return [...r, ...m];
  }, [suggestions]);

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (!suggestionsOpen) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const total = Math.max(1, flatSuggestions.length);
      setActiveIndex((i) => (i + 1) % total);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const total = Math.max(1, flatSuggestions.length);
      setActiveIndex((i) => (i - 1 + total) % total);
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0 && flatSuggestions.length > 0) {
        const s = flatSuggestions[activeIndex % flatSuggestions.length];
        if (s?.type === 'restaurant') {
          window.location.href = `/restaurants/${s.item.id}`;
        } else if (s) {
          window.location.href = `/restaurants/${s.item.restaurant.id}?highlight=${encodeURIComponent(s.item.id)}`;
        }
      } else {
        handleSubmit(e as any);
      }
    } else if (e.key === 'Escape') {
      setSuggestionsOpen(false);
      setActiveIndex(-1);
    }
  };

  const highlight = (text: string, q: string) => {
    if (!q) return text;
    const i = text.toLowerCase().indexOf(q.toLowerCase());
    if (i === -1) return text;
    const before = text.slice(0, i);
    const match = text.slice(i, i + q.length);
    const after = text.slice(i + q.length);
    return (
      <>
        {before}
        <span className="rounded bg-yellow-200 px-0.5 text-white">{match}</span>
        {after}
      </>
    );
  };

  // Reset input and suggestions when resetSignal changes
  useEffect(() => {
    if (resetSignal === undefined) return;
    setQuery('');
    setSuggestionsOpen(false);
    setActiveIndex(-1);
    setSuggestions({ restaurants: [], menuItems: [] });
    // blur to hide keyboard on mobile
    inputRef.current?.blur();
  }, [resetSignal]);

  return (
    <div
      ref={containerRef}
      className={cn(
        // 'z-10 mr-5 w-[100%] rounded-tr-[100px] rounded-br-[1000px] bg-[#d3fb6b] p-5 pt-6 text-white',
        'z-10 mr-5 w-[100%] bg-[#d3fb6b] p-3 pt-6 text-white',
        "bg-[url('/spotlight.svg')] bg-cover bg-center bg-no-repeat",
        className
      )}
    >
      {/* <div className="absolute top-[17.600rem] left-0 z-12 h-16 w-24 rounded-tl-[100px] bg-white shadow-none"></div>
      <div className="absolute top-[17.500rem] left-0 z-10 h-14 w-20 bg-[#d3fb6b]"></div>

      <div className="absolute top-[17.600rem] right-0 z-12 h-16 w-24 rounded-tr-[100px] bg-white shadow-none"></div>
      <div className="absolute top-[17.500rem] right-0 z-10 h-14 w-20 bg-[#d3fb6b]"></div> */}

      {/* Top row: location + actions */}
      <div className="mb-5 flex items-center justify-between">
        <button
          type="button"
          onClick={onLocationClick}
          className="flex items-center gap-2 rounded-full border border-[#d3fb6b] bg-[#002a01]/5 bg-white/30 px-3 py-2 backdrop-blur-sm"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d3fb6b]/50 bg-white/20 backdrop-blur-sm">
            <MapPin className="h-5 w-5 text-[#002a01]" />
          </div>
          <div className="max-w-[300px] text-left">
            {/* <div className="text-xs text-gray-100">Location</div> */}
            <div className="text-md truncate font-medium text-[#002a01]">
              {shortLocation}...
            </div>
          </div>
        </button>

        <div className="flex items-center gap-3">
          {/* {onRefresh && (
            <button
              type="button"
              onClick={async () => {
                setIsRefreshing(true);
                try {
                  await onRefresh();
                } finally {
                  setIsRefreshing(false);
                }
              }}
              disabled={isRefreshing}
              className="border border-[#002a01] bg-white/30 backdrop-blur-sm flex h-12 w-12 items-center justify-center rounded-full transition-colors hover:bg-white/40 disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          )} */}
          <button
            type="button"
            onClick={onProfileClick}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-[#d3fb6b] bg-white/50 backdrop-blur-sm transition-colors"
          >
            <CircleUserRound className="h-7 w-7 text-black font-normal" />
          </button>
        </div>
      </div>

      {/* Headline - Only show when NOT in search mode */}
      {/* {!isSearchMode && (
        <div className="mt-10 mb-4">
          <h1 className="text-[28px] leading-8 font-extrabold tracking-tight text-white">
          Foodie, it’s your turn to <br/>hack the menu.
          </h1>
        </div>
      )} */}

      {/* Search row - Add top margin when in search mode to replace headline space */}
      <form
        onSubmit={handleSubmit}
        className={cn('flex items-center gap-2', isSearchMode && 'mt-10')}
      >
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-6 z-50 h-6 w-6 -translate-y-1/2 text-[#002a01]" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={' '}
            className="h-16 w-full rounded-3xl border border-[#fff] bg-[#fff]/20 px-20 text-white backdrop-blur-sm outline-none placeholder:text-transparent"
            onFocus={() => {
              setSuggestionsOpen(true);
            }}
          />
          {/* Animated placeholder overlay */}
          {!query && (
            <span
              key={placeholderText}
              className="placeholder-animate pointer-events-none absolute top-1/2 left-16 -translate-y-1/2 text-lg text-[#002a01]"
            >
              {`Search "${placeholderText}".`}
            </span>
          )}

          {/* Suggestions dropdown */}
          {suggestionsOpen && (
            <div
              ref={listRef}
              className="absolute right-0 left-0 z-[60] mt-2 overflow-hidden rounded-2xl border border-black/5 bg-white text-gray-900 shadow-xl"
            >
              {/* Chips row: recent + trending */}
              <div className="flex flex-wrap gap-2 px-3 pt-3 pb-2">
                {recentSearches.length > 0 && (
                  <span className="mr-1 inline-flex items-center gap-1 text-xs text-gray-500">
                    <History className="h-3 w-3" /> Recent
                  </span>
                )}
                {recentSearches.map((r, i) => (
                  <button
                    key={`recent-${i}`}
                    type="button"
                    onClick={() => setQuery(r)}
                    className="rounded-full bg-gray-100 px-3 py-1 text-sm hover:bg-gray-200"
                  >
                    {r}
                  </button>
                ))}
              </div>

              <div className="max-h-80 divide-y divide-gray-100 overflow-auto">
                {suggestionsLoading && (
                  <div className="space-y-2 p-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-center gap-3 p-2">
                        <div className="h-10 w-10 animate-pulse rounded-lg bg-gray-200" />
                        <div className="flex-1 space-y-2">
                          <div className="h-3 w-2/3 animate-pulse rounded bg-gray-200" />
                          <div className="h-3 w-1/3 animate-pulse rounded bg-gray-200" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {suggestions.restaurants.length > 0 && (
                  <div className="p-2">
                    <div className="px-2 py-1 text-xs font-semibold text-gray-500">
                      Restaurants
                    </div>
                    {suggestions.restaurants.map((r, i) => {
                      const index = i; // before menu items
                      const isActive = activeIndex === index;
                      return (
                        <Link
                          key={r.id}
                          href={`/restaurants/${r.id}`}
                          className={cn(
                            'flex items-center gap-3 rounded-lg p-2 hover:bg-gray-50',
                            isActive && 'bg-gray-100'
                          )}
                          onMouseEnter={() => setActiveIndex(index)}
                        >
                          {r.imageUrl ? (
                            <img
                              src={r.imageUrl}
                              alt={r.name}
                              className="h-10 w-10 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-lg bg-gray-100" />
                          )}
                          <div className="min-w-0">
                            <div className="truncate text-sm font-medium">
                              {highlight(r.name, query)}
                            </div>
                            {r.cuisineTypes && r.cuisineTypes.length > 0 && (
                              <div className="truncate text-xs text-gray-500">
                                {r.cuisineTypes.join(', ')}
                              </div>
                            )}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}

                {suggestions.menuItems.length > 0 && (
                  <div className="p-2">
                    <div className="px-2 py-1 text-xs font-semibold text-gray-500">
                      Dishes
                    </div>
                    {suggestions.menuItems.map((m, i) => {
                      const index = suggestions.restaurants.length + i;
                      const isActive = activeIndex === index;
                      return (
                        <Link
                          key={m.id}
                          href={`/restaurants/${m.restaurant.id}?highlight=${encodeURIComponent(m.id)}`}
                          className={cn(
                            'flex items-center gap-3 rounded-lg p-2 hover:bg-gray-50',
                            isActive && 'bg-gray-100'
                          )}
                          onMouseEnter={() => setActiveIndex(index)}
                        >
                          {m.imageUrl ? (
                            <img
                              src={m.imageUrl}
                              alt={m.name}
                              className="h-10 w-10 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-lg bg-gray-100" />
                          )}
                          <div className="min-w-0">
                            <div className="truncate text-sm font-medium">
                              {highlight(m.name, query)}
                            </div>
                            <div className="truncate text-xs text-gray-500">
                              {m.restaurant.name}
                              {m.category ? ` • ${m.category}` : ''} • ₹
                              {m.price}
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}

                {!suggestionsLoading &&
                  suggestions.restaurants.length === 0 &&
                  suggestions.menuItems.length === 0 && (
                    <div className="p-3 text-sm text-gray-500">No results</div>
                  )}
              </div>

              {/* Footer CTA */}
              <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50 p-2">
                <div className="ml-2 text-xs text-gray-500">
                  Press Enter to search all
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    handleSubmit(e as any);
                  }}
                  className="rounded-full bg-[#002a01] px-3 py-1.5 text-sm font-medium text-white"
                >
                  Search "{query.trim()}"
                </button>
              </div>
            </div>
          )}
        </div>
        {/* Veg mode toggle */}
        <div className="flex flex-col items-center gap-2 rounded-3xl">
          <div className=" flex flex-col space-y-0">
            <span className="text-center text-md font-black text-[#002a01]">
              VEG
            </span>
            <span className="text-xs -mt-1 font-black text-[#002a01]"> MODE</span>
          </div>
          <label className="switch">
            <input
              className="toggle"
              type="checkbox"
              checked={vegOnly}
              onChange={(e) => setVegOnly(e.target.checked)}
              aria-label="Veg mode"
            />
            <span className="slider"></span>
            <span className="card-side"></span>
          </label>
        </div>
        {/* <button
          type="button"
          onClick={onFilterClick}
          className="bg-white/10 backdrop-blur-sm border border-[#002a01]/20 flex h-12 w-12 items-center justify-center rounded-full"
          aria-label="Filter"
        >
          <SlidersHorizontal className="h-5 w-5 text-[#002a01]" />
        </button> */}
      </form>

      <style jsx>{`
        /* From Uiverse.io by andrew-demchenk0 */
        .switch {
          --input-focus: #d3fb6b;
          --font-color: #323232;
          --font-color-sub: #666;
          --bg-color: #fff;
          --bg-color-alt: #666;
          --main-color: #002a01;
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 30px;
          width: 40px;
          height: 20px;
        }
        .toggle {
          opacity: 0;
          width: 0;
          height: 0;
        }
        .slider {
          box-sizing: border-box;
          border-radius: 5px;
          border: 2px solid var(--main-color);
          box-shadow: 3px 3px var(--main-color);
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: var(--bg-color);
          transition: 0.3s;
        }
        .slider:before {
          box-sizing: border-box;
          position: absolute;
          content: '';
          height: 20px;
          width: 15px;
          border: 2px solid var(--main-color);
          border-radius: 5px;
          left: -2px;
          bottom: 2px;
          background-color: var(--bg-color);
          box-shadow: 0 3px 0 var(--main-color);
          transition: 0.3s;
        }
        .toggle:checked + .slider {
          background-color: var(--input-focus);
        }
        .toggle:checked + .slider:before {
          transform: translateX(30px);
        }
      `}</style>

      {/* Headline - Only show when NOT in search mode */}
      {!isSearchMode && (
        <div className="mt-10 mb-4">
          <h1
            className={`${fredoka.className} text-center text-[34px] leading-8 font-extrabold tracking-tight text-[#002a01]`}
            style={{ letterSpacing: '0.02em' }}
          >
            Foodie, it’s your turn to <br />
            hack the menu.
          </h1>
        </div>
      )}
    </div>
  );
}
