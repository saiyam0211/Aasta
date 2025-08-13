'use client';

import { cn } from '@/lib/utils';
import { SafeImage } from '@/components/ui/safe-image';

export interface CategoryItem {
  id: string;
  name: string;
  imageSrc: string;
}

interface CategoryScrollerProps {
  title?: string;
  categories: CategoryItem[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  onViewAll?: () => void;
  className?: string;
}

export function CategoryScroller({
  title = 'Order by Category',
  categories,
  selectedId,
  onSelect,
  onViewAll,
  className,
}: CategoryScrollerProps) {
  return (
    <div className={cn('w-full', className)}>
      <div className="mb-3 flex items-center justify-between px-1">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <button className="text-sm text-gray-500" onClick={onViewAll}>
          View all
        </button>
      </div>
      <div className="scrollbar-hide flex gap-3 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelect && onSelect(cat.id)}
            className="flex flex-shrink-0 flex-col items-center gap-2"
          >
            <div
              className={cn(
                'flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-gray-100 bg-white shadow-sm',
                selectedId === cat.id && 'ring-2 ring-[#fe6a22]'
              )}
            >
              <SafeImage
                src={cat.imageSrc}
                alt={cat.name}
                className="h-full w-full object-cover"
                fallbackSrc="/images/dish-placeholder.svg"
              />
            </div>
            <span
              className={cn(
                'rounded-full border px-3 py-1 text-xs',
                selectedId === cat.id
                  ? 'border-black bg-black text-white'
                  : 'border-gray-200 text-gray-700'
              )}
            >
              {cat.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
