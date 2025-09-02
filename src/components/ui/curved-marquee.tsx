'use client';

import React from 'react';

interface CurvedMarqueeProps {
  messages?: string[];
  className?: string;
  speed?: number; // duration in seconds for one complete scroll
  textColor?: string;
  bgColor?: string;
}

const defaultMessages = [
  '🎉 50% OFF on your first order!',
  '🚚 Free delivery on orders above ₹299',
  '⚡ 20 min delivery guaranteed',
  '💸 Get ₹100 cashback on weekend orders',
  '🔥 Hot deals this weekend only',
  '🍕 Pizza starting at just ₹199',
  '🎁 Special offers for new users',
];

export function CurvedMarquee({
  messages = defaultMessages,
  className = '',
  speed = 20,
  textColor = '#ffffff',
  bgColor = 'bg-[#002a01]',
}: CurvedMarqueeProps) {
  const marqueeText = messages.join('   •   ');

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Curved background with same style as header */}
      <div
        className={`relative mr-5 w-[93%] rounded-tr-[300px] rounded-br-[1000px] ${bgColor} px-5 py-3`}
      >
        {/* White corner cutout effect - same as header */}
        <div className="absolute top-[3rem] left-0 z-12 h-8 w-12 rounded-tl-[100px] bg-white shadow-none"></div>
        <div className="absolute top-[3rem] left-0 z-10 h-6 w-8 bg-[#002a01]"></div>

        {/* SVG Curved text following the shape */}
        <div className="relative flex h-6 items-center overflow-hidden">
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 1000 60"
            className="absolute top-0 left-0 h-full w-full"
            preserveAspectRatio="none"
          >
            {/* Define the curved path that matches the rounded corners */}
            <defs>
              <path
                id="marquee-curve"
                d="M 50 30 Q 150 25 300 28 Q 500 30 700 29 Q 850 28 950 30"
                fill="none"
              />
            </defs>

            {/* First scrolling text instance */}
            <text
              className="text-sm font-medium"
              fill={textColor}
              fontSize="14"
            >
              <textPath
                href="#marquee-curve"
                startOffset="0%"
                style={{
                  animation: `curveScroll ${speed}s linear infinite`,
                }}
              >
                {marqueeText} • {marqueeText}
              </textPath>
            </text>
          </svg>
        </div>

        {/* Gradient fade effects on edges */}
        <div
          className={`pointer-events-none absolute top-0 left-0 z-10 h-full w-12 bg-gradient-to-r from-[#002a01] to-transparent`}
        ></div>
        <div
          className={`pointer-events-none absolute top-0 right-0 z-10 h-full w-12 bg-gradient-to-l from-[#002a01] to-transparent`}
        ></div>
      </div>

      {/* Keyframes for curved text scrolling animation */}
      <style jsx>{`
        @keyframes curveScroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-100%);
          }
        }

        /* Smooth curved text animation */
        textPath {
          animation-timing-function: linear;
        }
      `}</style>
    </div>
  );
}
