'use client';

import Image from 'next/image';
import Lottie from 'lottie-react';
import footerAnimation from '../../../public/lotties/footer.json';

interface FoodHacksPromoProps {
  className?: string;
}

export function FoodHacksPromo({ className = '' }: FoodHacksPromoProps) {
  return (
    <div className={`bg-gradient-to-br from-green-50 to-emerald-50 rounded-t-3xl p-6  ${className}`}>
      <div className="flex flex-col items-center justify-between">
        {/* Left side with Lottie animation */}
        <div className="flex-shrink-0">
          <div className="w-16 h-16">
            <Lottie
              animationData={footerAnimation}
              loop={true}
              autoplay={true}
            />
          </div>
        </div>

        {/* Center content */}
        <div className="flex-1 ml-4">
          <h3 className="fredoka text-3xl mt-5 font-bold text-gray-800 mb-1">
            #FoodHack 
          </h3>
        </div>
      </div>

      {/* Aasta logo at the bottom */}
      <div className="flex justify-center border-t border-green-200">
        <div className="relative w-56 h-20">
          <Image
            src="/aasta_full.png"
            alt="Aasta"
            fill
            className="object-contain opacity-60"
            priority
          />
        </div>
      </div>
    </div>
  );
}
