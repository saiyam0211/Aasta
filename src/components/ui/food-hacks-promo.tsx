'use client';

import Image from 'next/image';
import Lottie from 'lottie-react';
import footerAnimation from '../../../public/lotties/footer.json';
import { Fredoka } from 'next/font/google';

// Import Fredoka font
const fredoka = Fredoka({ subsets: ['latin'], weight: ['400', '700'] });

interface FoodHacksPromoProps {
  className?: string;
}

export function FoodHacksPromo({ className = '' }: FoodHacksPromoProps) {
  return (
    <div
      className={`border-gradient-to-br ml-10 rounded-tl-[1000px] rounded-tr-[650px] rounded-bl-[0px] bg-[#002a01] from-green-50 to-emerald-50 px-6 pt-6 pl-10 ${className}`}
      style={{ zIndex: 2147483647, position: 'relative' }}
    >
      <div className="flex flex-col items-center justify-between">
        {/* Left side with Lottie animation */}
        <div className="flex-shrink-0">
          <div className="h-24 w-24">
            <Lottie
              animationData={footerAnimation}
              loop={true}
              autoplay={true}
            />
          </div>
        </div>

        {/* Center content */}
        <div className="ml-4 flex-1 pb-8">
          <h3
            className="mt-5 mb-3 text-4xl font-bold font-dela text-gray-50"
          >
            #FoodHack
          </h3>
        </div>
      </div>

      {/* Aasta logo at the bottom */}
      {/* <div className="flex justify-center pb-2">
        <div className="relative h-20 w-20">
          <Image
            src="/aasta_icon_logo_with_bg.png"
            alt="Aasta"
            fill
            className="object-contain opacity-50"
            priority
          />
        </div>
      </div> */}
    </div>
  );
}
