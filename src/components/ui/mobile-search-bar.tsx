'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, X, Mic, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

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
  placeholder = 'Search restaurants, dishes...',
  onSearch,
  onFilter,
  onVoiceSearch,
  className,
  showFilter = false,
  showVoice = false,
}: MobileSearchBarProps) {
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
    <div className={cn('flex w-full items-center gap-3', className)}>
      {/* Search Input Container */}
      <div
        className={cn(
          'relative flex-1 transition-all duration-300 ease-out',
          isFocused ? 'scale-[1.02]' : 'scale-100'
        )}
      >
        <div
          className={cn(
            'relative flex items-center rounded-2xl border-2 bg-white transition-all duration-300',
            isFocused
              ? 'border-primary-dark-green shadow-primary-dark-green/10 shadow-lg'
              : 'border-gray-200 shadow-sm'
          )}
        >
          {/* Search Icon */}
          <Search className="absolute left-4 z-10 h-5 w-5 text-gray-400" />

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
              'w-full rounded-2xl border-0 bg-transparent py-4 pr-12 pl-12',
              'text-gray-900 placeholder:text-gray-500',
              'mobile-text focus:ring-0 focus:outline-none',
              'mobile-touch min-h-[52px]'
            )}
          />

          {/* Clear Button */}
          {query && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearQuery}
              className="absolute right-12 h-6 w-6 rounded-full p-0 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </Button>
          )}

          {/* Search Button */}
          <Button
            onClick={handleSearch}
            disabled={!query.trim()}
            className={cn(
              'absolute right-2 h-8 w-8 rounded-full p-0 transition-all duration-200',
              query.trim()
                ? 'bg-primary-dark-green text-white shadow-md hover:bg-green-800 hover:shadow-lg'
                : 'cursor-not-allowed bg-gray-100 text-gray-400'
            )}
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>

        {/* Search Suggestions Dropdown (Future Enhancement) */}
        {isFocused && query && (
          <div className="absolute top-full right-0 left-0 z-50 mt-2 max-h-60 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-xl">
            <div className="p-4 text-center text-sm text-gray-500">
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
            'hover:border-primary-dark-green h-12 w-12 rounded-xl border-2 border-gray-200 p-0',
            'hover:bg-primary-dark-green transition-all duration-200 hover:text-white',
            'mobile-touch'
          )}
        >
          <Filter className="h-5 w-5" />
        </Button>
      )}

      {/* Voice Search Button */}
      {showVoice && (
        <Button
          onClick={onVoiceSearch}
          variant="outline"
          className={cn(
            'h-12 w-12 rounded-xl border-2 border-gray-200 p-0 hover:border-red-400',
            'transition-all duration-200 hover:bg-red-500 hover:text-white',
            'mobile-touch'
          )}
        >
          <Mic className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
}
