'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Lottie from 'lottie-react';
import locationAnim from '../../../../public/lotties/location.json';
import { useLocationStore } from '@/hooks/useLocation';

export default function LocationOnboarding() {
  const router = useRouter();
  const { latitude, longitude, setLocation } = useLocationStore();
  const [isRequesting, setIsRequesting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (latitude && longitude) {
      router.replace('/');
    }
  }, [latitude, longitude, router]);

  const requestLocation = async () => {
    setIsRequesting(true);
    setError(null);
    try {
      const isCapacitor = typeof window !== 'undefined' && (window as any).Capacitor?.isNativePlatform?.();
      if (isCapacitor) {
        const { Geolocation } = await import('@capacitor/geolocation');
        const position = await Geolocation.getCurrentPosition({ enableHighAccuracy: true });
        setLocation(position.coords.latitude, position.coords.longitude);
        router.replace('/');
        return;
      }
      if (!navigator.geolocation) {
        throw new Error('Geolocation is not supported on this device.');
      }
      await new Promise<void>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setLocation(pos.coords.latitude, pos.coords.longitude);
            resolve();
          },
          (geoErr) => reject(geoErr),
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
        );
      });
      router.replace('/');
    } catch (e: any) {
      setError(e?.message || 'Failed to get location');
    } finally {
      setIsRequesting(false);
    }
  };

  const goManual = () => {
    router.push('/customer/location');
  };

  return (
    <div className="min-h-screen w-full bg-[#f0f9e8] pt-safe pb-safe flex flex-col items-center">
      <div className="w-full max-w-md px-6 pt-6">
        <div className="rounded-3xl bg-gradient-to-b from-[#d1f86a] to-[#b6ec54] p-6 shadow-xl">
          <div className="rounded-2xl bg-white/60 glass-liquid px-4 py-2 inline-block text-sm font-semibold text-[#002a01]">
            Location
          </div>
          <div className="mt-2">
            <Lottie animationData={locationAnim as any} loop autoplay style={{ width: '100%', height: 260 }} />
          </div>
          <h1 className="mt-2 text-3xl font-extrabold text-[#002a01]">Location is Important</h1>
          <p className="mt-2 text-[#053a03]/80">
            Pick-ups and delivery estimates get faster and more accurate when we know where you are.
          </p>
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          <div className="mt-6 space-y-3">
            <button
              onClick={requestLocation}
              disabled={isRequesting}
              className="w-full rounded-full bg-[#00a651] py-4 text-white font-semibold shadow-md active:scale-[0.99]"
            >
              {isRequesting ? 'Requesting…' : 'Allow Location'}
            </button>
            <button
              onClick={goManual}
              className="w-full rounded-full border-2 border-[#002a01] bg-white py-4 font-semibold text-[#002a01]"
            >
              Enter Location
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 