'use client';

import * as React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Share2, Bookmark, Clock } from 'lucide-react';
import type { Dish } from '@/types/dish';
import { cn } from '@/lib/utils';
import { SafeImage } from '@/components/ui/safe-image';
import { useCartStore } from '@/lib/store';
import { shareContent, generateProductShareData } from '@/lib/share-utils';
import { toast } from 'sonner';
import { hapticAddToCart, hapticIncreaseQuantity, hapticDecreaseQuantity, hapticModalOpen, hapticModalClose } from '@/haptics';

interface ProductBottomSheetProps {
  open: boolean;
  dish: Dish | null;
  onOpenChange: (open: boolean) => void;
  onAdd: (dish: Dish, quantity: number) => void;
}

function VegMark({ isVegetarian }: { isVegetarian: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex h-4 w-4 items-center justify-center rounded-sm border-2',
        isVegetarian ? 'border-green-600 bg-white' : 'border-red-600 bg-white'
      )}
    >
      <span
        className={cn(
          'h-2 w-2 rounded-full',
          isVegetarian ? 'bg-green-600' : 'bg-red-600'
        )}
      />
    </span>
  );
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function ProductBottomSheet({
  open,
  dish,
  onOpenChange,
  onAdd,
}: ProductBottomSheetProps) {
  const [quantity, setQuantity] = React.useState(1);

  const getItemQuantityInCart = useCartStore((s) => s.getItemQuantityInCart);
  const updateQuantity = useCartStore((s) => s.updateQuantity);

  const existingQuantity = dish ? getItemQuantityInCart(dish.id) : 0;

  React.useEffect(() => {
    if (open) {
      setQuantity(1);
      hapticModalOpen();
    } else {
      hapticModalClose();
    }
  }, [open]);

  const isVeg = React.useMemo(() => {
    if (!dish) return true;
    return Array.isArray(dish.dietaryTags)
      ? dish.dietaryTags.includes('Veg')
      : !!dish.isVegetarian;
  }, [dish]);


  const totalPrice = dish
    ? dish.price * (existingQuantity > 0 ? existingQuantity : quantity)
    : 0;
  const totalOriginal = dish?.originalPrice
    ? dish.originalPrice * (existingQuantity > 0 ? existingQuantity : quantity)
    : undefined;

  const handleIncrease = () => {
    if (!dish) return;
    hapticIncreaseQuantity();
    updateQuantity(dish.id, existingQuantity + 1);
  };
  const handleDecrease = () => {
    if (!dish) return;
    hapticDecreaseQuantity();
    updateQuantity(dish.id, existingQuantity - 1);
  };

  const handleShare = async () => {
    if (!dish) return;

    const shareData = generateProductShareData(
      dish.name,
      dish.description || '',
      dish.price,
      dish.restaurant,
      dish.id
    );

    const success = await shareContent(shareData);
    if (success) {
      toast.success('Shared successfully!');
    } else {
      toast.error('Failed to share');
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 fixed inset-0 z-[100] bg-black/50" />
        <Dialog.Content className="sheet-content data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom fixed bottom-0 left-1/2 z-[101] w-full max-w-md -translate-x-1/2 rounded-t-3xl bg-white shadow-2xl">
          {/* Grabber */}
          <div className="absolute top-2 left-1/2 h-1.5 w-12 -translate-x-1/2 rounded-full bg-gray-300" />

          <div className="max-h-[80vh] overflow-auto">
            {/* Image */}
            {dish && (
              <div className="p-4 pt-6">
                <div className="relative h-72 w-full overflow-hidden rounded-2xl bg-gray-100">
                  <SafeImage
                    src={dish.image}
                    alt={dish.name}
                    className={cn(
                      "h-full w-full object-cover",
                      dish.soldOut && "grayscale"
                    )}
                    fallbackSrc="/images/dish-placeholder.svg"
                  />
                  {dish.soldOut && (
                    <img
                      src="/images/sold-out.png"
                      alt="Sold Out"
                      className="absolute inset-0 object-cover"
                    />
                  )}
                </div>

                {/* Title row */}
                <div className="mt-4 flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <VegMark isVegetarian={isVeg} />
                      <span className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-100 px-2 py-1 text-[11px] text-gray-700">
                        <Clock className="h-3 w-3" /> {dish.preparationTime || 15}{' '}
                        mins
                      </span>
                    </div>
                    <Dialog.Title className="text-2xl py-1 mt-2 leading-6 font-semibold text-gray-900">
                      {dish.name}
                    </Dialog.Title>
                    <Dialog.Description className="text-md text-gray-600">
                      {dish.description || `Delicious ${dish.name}, perfect for snacking or as a side dish.`}
                    </Dialog.Description>
                  </div>
                  <div className="ml-3 flex items-center">
                    <button
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 transition-colors hover:bg-gray-200"
                      aria-label="Share"
                      onClick={handleShare}
                    >
                      <Share2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Price */}
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-xl font-bold text-gray-900">
                    ₹{dish.price}
                  </span>
                  {dish.originalPrice && (
                    <span className="text-sm text-gray-400 line-through">
                      ₹{dish.originalPrice}
                    </span>
                  )}
                </div>

                {/* Removed in-body quantity controls to use footer controls only */}
              </div>
            )}
          </div>

          {/* Sticky footer */}
          {dish && (
            <div className="sticky right-0 bottom-0 left-0 border-t border-gray-200 bg-white/80 p-4 backdrop-blur">
              {dish.soldOut ? (
                <button
                  disabled
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gray-300 text-base font-semibold text-gray-500 cursor-not-allowed shadow-sm"
                  aria-label={`Sold out ${dish.name}`}
                >
                  Sold Out
                </button>
              ) : existingQuantity > 0 ? (
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-2">
                    <div className="-gap-2 glass-liquid inline-flex items-center rounded-md border border-green-600/30 bg-white shadow">
                      <button
                        className="h-6 w-6 rounded-md text-lg text-[#002a01]"
                        onClick={handleDecrease}
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span className="min-w-[1.5rem] text-center text-lg font-medium">
                        {existingQuantity}
                      </span>
                      <button
                        className="h-6 w-6 rounded-md text-lg text-[#002a01]"
                        onClick={handleIncrease}
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    {typeof totalOriginal === 'number' && (
                      <span className="mr-2 text-gray-500 line-through">
                        ₹{totalOriginal}
                      </span>
                    )}
                    <span className="font-bold">₹{totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              ) : (
                <button
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-accent-leaf-green text-base font-semibold text-black shadow-sm"
                  onClick={() => {
                    if (dish) {
                      hapticAddToCart();
                      onAdd(dish, quantity);
                    }
                  }}
                >
                  Add item
                  {typeof totalOriginal === 'number' && (
                    <span className="ml-1 text-black/75 line-through">
                      ₹{totalOriginal}
                    </span>
                  )}
                  <span className="font-bold">₹{totalPrice.toFixed(2)}</span>
                </button>
              )}
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>

      {/* Fallback animation if Tailwind animate classes are not configured */}
      <style jsx global>{`
        @keyframes nd-sheet-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        @keyframes nd-sheet-down {
          from {
            transform: translateY(0);
          }
          to {
            transform: translateY(100%);
          }
        }
        .sheet-content[data-state='open'] {
          animation: nd-sheet-up 220ms ease-out;
        }
        .sheet-content[data-state='closed'] {
          animation: nd-sheet-down 200ms ease-in;
        }
      `}</style>
    </Dialog.Root>
  );
}
