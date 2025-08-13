'use client';

import { useState, useRef } from 'react';
import { Search, X, Mic, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface MaterialSearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  onFilter?: () => void;
  onVoiceSearch?: () => void;
  className?: string;
}

export function MaterialSearchBar({
  placeholder = 'Search restaurants, dishes...',
  onSearch,
  onFilter,
  onVoiceSearch,
  className,
}: MaterialSearchBarProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = () => {
    if (onSearch && query.trim()) {
      onSearch(query.trim());
    }
  };

  const clearQuery = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className={cn('w-full', className)}>
      {/* Material 3 Search Bar */}
      <div
        className={cn(
          'relative flex items-center transition-all duration-300 ease-out',
          'rounded-full border border-gray-200 bg-white shadow-sm',
          isFocused
            ? 'border-primary-dark-green/30 ring-primary-dark-green/10 shadow-lg ring-4'
            : 'hover:border-gray-300 hover:shadow-md'
        )}
      >
        {/* Leading Search Icon */}
        <div className="flex h-12 w-12 items-center justify-center pl-4">
          <Search
            className={cn(
              'h-5 w-5 transition-colors duration-200',
              isFocused ? 'text-primary-dark-green' : 'text-gray-400'
            )}
          />
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
            'h-12 flex-1 rounded-none border-0 bg-transparent',
            'text-gray-900 placeholder:text-gray-500',
            'text-base focus:ring-0 focus:outline-none',
            'px-2'
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
              className="mr-1 h-8 w-8 rounded-full p-0 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </Button>
          )}

          {/* Voice Search */}
          {onVoiceSearch && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onVoiceSearch}
              className="mr-1 h-8 w-8 rounded-full p-0 text-gray-400 hover:bg-red-50 hover:text-red-500"
            >
              <Mic className="h-4 w-4" />
            </Button>
          )}

          {/* Filter Button */}
          {onFilter && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onFilter}
              className="hover:text-primary-dark-green hover:bg-accent-leaf-green/20 mr-1 h-8 w-8 rounded-full p-0 text-gray-400"
            >
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Search Suggestions (Future Enhancement) */}
      {isFocused && query && (
        <div className="absolute top-full right-0 left-0 z-50 mt-2 max-h-80 overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-xl">
          <div className="p-6 text-center text-gray-500">
            <Search className="mx-auto mb-2 h-8 w-8 text-gray-400" />
            <p className="text-sm">Start typing to see suggestions...</p>
          </div>
        </div>
      )}
    </div>
  );
}
