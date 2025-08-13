'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface SafeImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  onError?: () => void;
}

export function SafeImage({
  src,
  alt,
  className,
  fallbackSrc,
  onError,
}: SafeImageProps) {
  const [imageSrc, setImageSrc] = useState(src);
  const [isError, setIsError] = useState(false);

  const handleError = () => {
    if (!isError) {
      setIsError(true);
      onError?.();

      // Determine appropriate fallback based on the original image path
      let defaultFallback = '/images/restaurant-placeholder.svg';

      if (
        src.includes('menu') ||
        src.includes('dish') ||
        src.includes('food')
      ) {
        defaultFallback = '/images/dish-placeholder.svg';
      } else if (src.includes('banner')) {
        defaultFallback = '/images/banners/night-delivery-banner.jpg';
      }

      setImageSrc(fallbackSrc || defaultFallback);
    }
  };

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={cn(className)}
      onError={handleError}
      loading="lazy"
    />
  );
}
