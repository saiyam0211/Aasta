"use client";

import { useState, useRef, useEffect } from "react";
import { Search, X, Mic, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface MobileSearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  onFilter?: () => void;
  onVoiceSearch?: () => void;
  className?: string;
  showFilter?: boolean;
  showVoice?: boolean;
}

export function MobileSearchBar({
  placeholder = "Search restaurants, dishes...",
  onSearch,
  onFilter,
  onVoiceSearch,
  className,
  showFilter = false,
  showVoice = false,
}: MobileSearchBarProps) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = () => {
    if (onSearch && query.trim()) {
      onSearch(query.trim());
    }
  };

  const clearQuery = () => {
    setQuery("");
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className={cn(
      "flex items-center gap-3 w-full",
      className
    )}>
      {/* Search Input Container */}
      <div className={cn(
        "flex-1 relative transition-all duration-300 ease-out",
        isFocused ? "scale-[1.02]" : "scale-100"
      )}>
        <div className={cn(
          "relative flex items-center bg-white rounded-2xl border-2 transition-all duration-300",
          isFocused 
            ? "border-primary-dark-green shadow-lg shadow-primary-dark-green/10" 
            : "border-gray-200 shadow-sm"
        )}>
          {/* Search Icon */}
          <Search className="absolute left-4 w-5 h-5 text-gray-400 z-10" />
          
          {/* Input Field */}
          <Input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyPress={handleKeyPress}
            className={cn(
              "w-full pl-12 pr-12 py-4 bg-transparent border-0 rounded-2xl",
              "text-gray-900 placeholder:text-gray-500",
              "focus:ring-0 focus:outline-none mobile-text",
              "min-h-[52px] mobile-touch"
            )}
          />
          
          {/* Clear Button */}
          {query && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearQuery}
              className="absolute right-12 w-6 h-6 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
          
          {/* Search Button */}
          <Button
            onClick={handleSearch}
            disabled={!query.trim()}
            className={cn(
              "absolute right-2 w-8 h-8 p-0 rounded-full transition-all duration-200",
              query.trim() 
                ? "bg-primary-dark-green hover:bg-green-800 text-white shadow-md hover:shadow-lg" 
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            )}
          >
            <Search className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Search Suggestions Dropdown (Future Enhancement) */}
        {isFocused && query && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-gray-200 shadow-xl z-50 max-h-60 overflow-y-auto">
            <div className="p-4 text-center text-gray-500 text-sm">
              Start typing to see suggestions...
            </div>
          </div>
        )}
      </div>
      
      {/* Filter Button */}
      {showFilter && (
        <Button
          onClick={onFilter}
          variant="outline"
          className={cn(
            "w-12 h-12 p-0 rounded-xl border-2 border-gray-200 hover:border-primary-dark-green",
            "hover:bg-primary-dark-green hover:text-white transition-all duration-200",
            "mobile-touch"
          )}
        >
          <Filter className="w-5 h-5" />
        </Button>
      )}
      
      {/* Voice Search Button */}
      {showVoice && (
        <Button
          onClick={onVoiceSearch}
          variant="outline"
          className={cn(
            "w-12 h-12 p-0 rounded-xl border-2 border-gray-200 hover:border-red-400",
            "hover:bg-red-500 hover:text-white transition-all duration-200",
            "mobile-touch"
          )}
        >
          <Mic className="w-5 h-5" />
        </Button>
      )}
    </div>
  );
}
