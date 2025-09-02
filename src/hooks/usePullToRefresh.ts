import { useEffect, useRef } from 'react';

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void> | void;
  threshold?: number;
  resistance?: number;
}

export function usePullToRefresh({
  onRefresh,
  threshold = 80,
  resistance = 2.5,
}: UsePullToRefreshOptions) {
  const startY = useRef<number>(0);
  const currentY = useRef<number>(0);
  const isRefreshing = useRef<boolean>(false);
  const elementRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (element.scrollTop === 0) {
        startY.current = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (element.scrollTop === 0 && !isRefreshing.current) {
        currentY.current = e.touches[0].clientY;
        const pullDistance = currentY.current - startY.current;

        if (pullDistance > 0) {
          e.preventDefault();
          const pullRatio = Math.min(pullDistance / resistance, threshold);
          element.style.transform = `translateY(${pullRatio}px)`;
        }
      }
    };

    const handleTouchEnd = async (e: TouchEvent) => {
      if (element.scrollTop === 0 && !isRefreshing.current) {
        const pullDistance = currentY.current - startY.current;

        if (pullDistance > threshold) {
          isRefreshing.current = true;
          element.style.transform = 'translateY(0px)';

          try {
            await onRefresh();
          } finally {
            isRefreshing.current = false;
          }
        } else {
          element.style.transform = 'translateY(0px)';
        }
      }
    };

    element.addEventListener('touchstart', handleTouchStart, {
      passive: false,
    });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onRefresh, threshold, resistance]);

  return elementRef;
}
