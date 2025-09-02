'use client';

import React, { useRef, useEffect, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Percent,
  Gift,
  Star,
  Clock,
} from 'lucide-react';

interface Offer {
  id: string;
  title: string;
  description: string;
  discount: string;
  type: 'percentage' | 'flat' | 'gift' | 'cashback';
  bgColor: string;
  textColor: string;
  icon?: React.ReactNode;
  expiresIn?: string;
}

interface OffersCarouselProps {
  offers?: Offer[];
  className?: string;
}

const defaultOffers: Offer[] = [
  {
    id: '1',
    title: '50% OFF',
    description: 'On your first order',
    discount: 'Up to ₹200',
    type: 'percentage',
    bgColor: 'bg-gradient-to-r from-orange-400 to-red-500',
    textColor: 'text-white',
    icon: <Percent className="h-4 w-4" />,
    expiresIn: '2 days',
  },
  {
    id: '2',
    title: 'FREE DELIVERY',
    description: 'On orders above ₹299',
    discount: 'Save ₹40',
    type: 'gift',
    bgColor: 'bg-gradient-to-r from-green-400 to-emerald-500',
    textColor: 'text-white',
    icon: <Gift className="h-4 w-4" />,
  },
  {
    id: '3',
    title: 'FLAT ₹100',
    description: 'Off on premium restaurants',
    discount: 'Min order ₹500',
    type: 'flat',
    bgColor: 'bg-gradient-to-r from-purple-400 to-pink-500',
    textColor: 'text-white',
    icon: <Star className="h-4 w-4" />,
    expiresIn: '1 day',
  },
  {
    id: '4',
    title: 'CASHBACK',
    description: 'Get 20% cashback',
    discount: 'Up to ₹150',
    type: 'cashback',
    bgColor: 'bg-gradient-to-r from-blue-400 to-indigo-500',
    textColor: 'text-white',
    icon: <Star className="h-4 w-4" />,
  },
  {
    id: '5',
    title: 'WEEKEND DEAL',
    description: 'Special weekend offer',
    discount: '30% OFF',
    type: 'percentage',
    bgColor: 'bg-gradient-to-r from-yellow-400 to-orange-500',
    textColor: 'text-white',
    icon: <Clock className="h-4 w-4" />,
    expiresIn: '3 days',
  },
];

export function OffersCarousel({
  offers = defaultOffers,
  className = '',
}: OffersCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftButton, setShowLeftButton] = useState(false);
  const [showRightButton, setShowRightButton] = useState(true);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 280; // Width of card + gap
      const newScrollLeft =
        scrollRef.current.scrollLeft +
        (direction === 'left' ? -scrollAmount : scrollAmount);
      scrollRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth',
      });
    }
  };

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftButton(scrollLeft > 0);
      setShowRightButton(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener('scroll', handleScroll);
      handleScroll(); // Check initial state
      return () => scrollElement.removeEventListener('scroll', handleScroll);
    }
  }, []);

  return (
    <div className={`relative ${className}`}>
      {/* Scroll buttons */}
      {showLeftButton && (
        <button
          onClick={() => scroll('left')}
          className="absolute top-1/2 left-2 z-10 -translate-y-1/2 rounded-full bg-white p-2 shadow-lg transition-all hover:bg-gray-50"
          style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
        >
          <ChevronLeft className="h-4 w-4 text-gray-600" />
        </button>
      )}

      {showRightButton && (
        <button
          onClick={() => scroll('right')}
          className="absolute top-1/2 right-2 z-10 -translate-y-1/2 rounded-full bg-white p-2 shadow-lg transition-all hover:bg-gray-50"
          style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
        >
          <ChevronRight className="h-4 w-4 text-gray-600" />
        </button>
      )}

      {/* Carousel container */}
      <div
        ref={scrollRef}
        className="scrollbar-hide flex gap-3 overflow-x-auto pb-2"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {offers.map((offer) => (
          <div
            key={offer.id}
            className={`flex-shrink-0 cursor-pointer rounded-2xl p-4 shadow-md transition-all hover:scale-[1.02] hover:shadow-lg ${offer.bgColor}`}
            style={{
              width: '270px',
              height: '120px',
            }}
          >
            <div
              className={`flex h-full flex-col justify-between ${offer.textColor}`}
            >
              {/* Top section */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-1 flex items-center gap-1">
                    {offer.icon}
                    <h3 className="text-lg leading-tight font-bold">
                      {offer.title}
                    </h3>
                  </div>
                  <p className="text-sm leading-tight opacity-90">
                    {offer.description}
                  </p>
                </div>
                {offer.expiresIn && (
                  <div className="rounded-full bg-black/20 px-2 py-1">
                    <span className="text-xs font-medium">
                      {offer.expiresIn}
                    </span>
                  </div>
                )}
              </div>

              {/* Bottom section */}
              <div className="flex items-end justify-between">
                <span className="text-sm font-medium opacity-90">
                  {offer.discount}
                </span>
                <button className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium transition-colors hover:bg-white/30">
                  Claim
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Custom scrollbar hide styles */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
