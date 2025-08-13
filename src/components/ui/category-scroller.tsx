"use client";

import { cn } from "@/lib/utils";
import { SafeImage } from "@/components/ui/safe-image";

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
  title = "Order by Category",
  categories,
  selectedId,
  onSelect,
  onViewAll,
  className
}: CategoryScrollerProps) {
  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between mb-3 px-1">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <button className="text-sm text-gray-500" onClick={onViewAll}>
          View all
        </button>
      </div>
      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelect && onSelect(cat.id)}
            className="flex-shrink-0 flex flex-col items-center gap-2"
          >
            <div
              className={cn(
                "w-16 h-16 rounded-full bg-white shadow-sm border border-gray-100 overflow-hidden flex items-center justify-center",
                selectedId === cat.id && "ring-2 ring-[#fe6a22]"
              )}
            >
              <SafeImage
                src={cat.imageSrc}
                alt={cat.name}
                className="w-full h-full object-cover"
                fallbackSrc="/images/dish-placeholder.svg"
              />
            </div>
            <span
              className={cn(
                "text-xs px-3 py-1 rounded-full border",
                selectedId === cat.id ? "bg-black text-white border-black" : "text-gray-700 border-gray-200"
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