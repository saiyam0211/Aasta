"use client";

import { useState, useRef } from "react";
import { Search, X, Mic, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface MaterialSearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  onFilter?: () => void;
  onVoiceSearch?: () => void;
  className?: string;
}

export function MaterialSearchBar({
  placeholder = "Search restaurants, dishes...",
  onSearch,
  onFilter,
  onVoiceSearch,
  className,
}: MaterialSearchBarProps) {
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
    <div className={cn("w-full", className)}>
      {/* Material 3 Search Bar */}
      <div className={cn(
        "relative flex items-center transition-all duration-300 ease-out",
        "bg-white rounded-full shadow-sm border border-gray-200",
        isFocused 
          ? "shadow-lg border-primary-dark-green/30 ring-4 ring-primary-dark-green/10" 
          : "hover:shadow-md hover:border-gray-300"
      )}>
        {/* Leading Search Icon */}
        <div className="flex items-center justify-center w-12 h-12 pl-4">
          <Search className={cn(
            "w-5 h-5 transition-colors duration-200",
            isFocused ? "text-primary-dark-green" : "text-gray-400"
          )} />
        </div>
        
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
            "flex-1 h-12 bg-transparent border-0 rounded-none",
            "text-gray-900 placeholder:text-gray-500",
            "focus:ring-0 focus:outline-none text-base",
            "px-2"
          )}
        />
        
        {/* Trailing Actions */}
        <div className="flex items-center pr-2">
          {/* Clear Button */}
          {query && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearQuery}
              className="w-8 h-8 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full mr-1"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
          
          {/* Voice Search */}
          {onVoiceSearch && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onVoiceSearch}
              className="w-8 h-8 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full mr-1"
            >
              <Mic className="w-4 h-4" />
            </Button>
          )}
          
          {/* Filter Button */}
          {onFilter && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onFilter}
              className="w-8 h-8 p-0 text-gray-400 hover:text-primary-dark-green hover:bg-accent-leaf-green/20 rounded-full mr-1"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
      
      {/* Search Suggestions (Future Enhancement) */}
      {isFocused && query && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-gray-200 shadow-xl z-50 max-h-80 overflow-y-auto">
          <div className="p-6 text-center text-gray-500">
            <Search className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">Start typing to see suggestions...</p>
          </div>
        </div>
      )}
    </div>
  );
}
