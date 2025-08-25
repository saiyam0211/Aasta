"use client";

import React, { useEffect, useRef } from 'react';
import Lottie from 'lottie-react';
import aastaAnim from '../../../public/lotties/aasta.json';

interface AastaLoaderProps {
  size?: number;
  backgroundColor?: string;
  fullscreen?: boolean;
  className?: string;
  segmentSeconds?: number; // how long of the animation to loop from the start
}

export function AastaLoader({
  size = 220,
  backgroundColor = '#002a01',
  fullscreen = true,
  className,
  segmentSeconds = 2,
}: AastaLoaderProps) {
  const lottieRef = useRef<any>(null);

  useEffect(() => {
    const anim = lottieRef.current;
    if (!anim) return;

    const playSegment = () => {
      try {
        const totalSeconds = anim?.getDuration?.(false) || 0; // seconds
        const totalFrames = anim?.getDuration?.(true) || 0; // frames
        if (totalSeconds > 0 && totalFrames > 0) {
          const framesPerSecond = totalFrames / totalSeconds;
          const endFrame = Math.max(1, Math.floor(framesPerSecond * segmentSeconds));
          anim.playSegments([0, endFrame], true);
        } else {
          anim.goToAndPlay?.(0, true);
        }
      } catch {
        anim?.goToAndPlay?.(0, true);
      }
    };

    // Start the first segment
    playSegment();

    // Re-trigger the first segment every time the segment completes
    anim?.addEventListener?.('complete', playSegment);

    return () => {
      anim?.removeEventListener?.('complete', playSegment);
    };
  }, [segmentSeconds]);

  const containerStyles: React.CSSProperties = fullscreen
    ? { backgroundColor }
    : {};

  return (
    <div
      className={className}
      style={{
        ...containerStyles,
        width: '100%',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Lottie
        lottieRef={lottieRef}
        animationData={aastaAnim as any}
        loop={true}
        autoplay
        style={{ width: size, height: size }}
      />
    </div>
  );
}

export default AastaLoader;
