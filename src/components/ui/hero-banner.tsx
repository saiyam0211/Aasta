'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Clock, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Banner {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  backgroundColor: string;
  textColor: string;
  ctaText: string;
  ctaAction: () => void;
}

interface HeroBannerProps {
  banners: Banner[];
  autoSlideInterval?: number;
  className?: string;
}

export function HeroBanner({
  banners,
  autoSlideInterval = 5000,
  className,
}: HeroBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Auto-slide functionality
  useEffect(() => {
    if (banners.length <= 1) return;

    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex((prevIndex) =>
          prevIndex === banners.length - 1 ? 0 : prevIndex + 1
        );
        setIsTransitioning(false);
      }, 150);
    }, autoSlideInterval);

    return () => clearInterval(interval);
  }, [banners.length, autoSlideInterval]);

  const currentBanner = banners[currentIndex];

  if (!currentBanner) return null;

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-3xl shadow-lg',
        className
      )}
    >
      {/* Banner Content */}
      <div
        className={cn(
          'relative min-h-[200px] sm:min-h-[240px] md:min-h-[280px]',
          'transition-all duration-500 ease-in-out',
          isTransitioning && 'scale-[0.98] opacity-95'
        )}
        style={{ backgroundColor: currentBanner.backgroundColor }}
      >
        {/* Background Image */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url(${currentBanner.image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(1px)',
          }}
        />

        {/* Content Overlay */}
        <div className="relative z-10 flex h-full items-center">
          <div className="w-full px-6 py-8 sm:px-8">
            {/* Service Hours Badge */}
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-black/20 px-3 py-1 backdrop-blur-sm">
              <Clock className="h-4 w-4 text-white" />
              <span className="text-sm font-medium text-white">
                9 PM - 12 AM
              </span>
            </div>

            {/* Main Content */}
            <div className={cn('mb-6', currentBanner.textColor)}>
              <h1 className="mb-2 text-2xl leading-tight font-bold sm:text-3xl md:text-4xl">
                {currentBanner.title}
              </h1>
              <h2 className="mb-3 text-lg font-semibold opacity-90 sm:text-xl md:text-2xl">
                {currentBanner.subtitle}
              </h2>
              <p className="max-w-lg text-sm leading-relaxed opacity-80 sm:text-base md:text-lg">
                {currentBanner.description}
              </p>
            </div>

            {/* CTA Button */}
            <Button
              onClick={currentBanner.ctaAction}
              className="rounded-full border border-white/30 bg-white/20 px-6 py-3 font-semibold text-white shadow-lg backdrop-blur-sm transition-all duration-200 hover:scale-105 hover:bg-white/30"
            >
              <Zap className="mr-2 h-4 w-4" />
              {currentBanner.ctaText}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Indicator Dots */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 transform space-x-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setIsTransitioning(true);
                setTimeout(() => {
                  setCurrentIndex(index);
                  setIsTransitioning(false);
                }, 150);
              }}
              className={cn(
                'h-2 w-2 rounded-full transition-all duration-300',
                index === currentIndex
                  ? 'w-6 bg-white'
                  : 'bg-white/50 hover:bg-white/70'
              )}
            />
          ))}
        </div>
      )}

      {/* Gradient Overlay for Better Text Readability */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />
    </div>
  );
}
