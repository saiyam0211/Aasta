"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

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
  className 
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
    <div className={cn("relative overflow-hidden rounded-3xl shadow-lg", className)}>
      {/* Banner Content */}
      <div 
        className={cn(
          "relative min-h-[200px] sm:min-h-[240px] md:min-h-[280px]",
          "transition-all duration-500 ease-in-out",
          isTransitioning && "opacity-95 scale-[0.98]"
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
            filter: 'blur(1px)'
          }}
        />
        
        {/* Content Overlay */}
        <div className="relative z-10 h-full flex items-center">
          <div className="w-full px-6 sm:px-8 py-8">
            {/* Service Hours Badge */}
            <div className="inline-flex items-center gap-2 bg-black/20 backdrop-blur-sm rounded-full px-3 py-1 mb-4">
              <Clock className="w-4 h-4 text-white" />
              <span className="text-sm font-medium text-white">9 PM - 12 AM</span>
            </div>
            
            {/* Main Content */}
            <div className={cn("mb-6", currentBanner.textColor)}>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 leading-tight">
                {currentBanner.title}
              </h1>
              <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-3 opacity-90">
                {currentBanner.subtitle}
              </h2>
              <p className="text-sm sm:text-base md:text-lg opacity-80 max-w-lg leading-relaxed">
                {currentBanner.description}
              </p>
            </div>
            
            {/* CTA Button */}
            <Button
              onClick={currentBanner.ctaAction}
              className="bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm px-6 py-3 rounded-full font-semibold transition-all duration-200 hover:scale-105 shadow-lg"
            >
              <Zap className="w-4 h-4 mr-2" />
              {currentBanner.ctaText}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>

      {/* Indicator Dots */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
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
                "w-2 h-2 rounded-full transition-all duration-300",
                index === currentIndex
                  ? "bg-white w-6"
                  : "bg-white/50 hover:bg-white/70"
              )}
            />
          ))}
        </div>
      )}

      {/* Gradient Overlay for Better Text Readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent pointer-events-none" />
    </div>
  );
}
