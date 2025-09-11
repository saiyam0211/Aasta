'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Lottie from 'lottie-react';
import locationAnim from '../../../../public/lotties/location.json';
import { useLocationStore } from '@/hooks/useLocation';
import { useSearchParams } from 'next/navigation';

export default function LocationOnboarding() {
  const router = useRouter();
  const { latitude, longitude, setLocation } = useLocationStore();
  const [isRequesting, setIsRequesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const isReselect = searchParams.get('reselect') === '1';

  useEffect(() => {
    if (latitude && longitude && !isReselect) {
      router.replace('/');
    }
  }, [latitude, longitude, router, isReselect]);

  const requestLocation = async () => {
    setIsRequesting(true);
    setError(null);
    try {
      const isCapacitor =
        typeof window !== 'undefined' &&
        (window as any).Capacitor?.isNativePlatform?.();
      if (isCapacitor) {
        const { Geolocation } = await import('@capacitor/geolocation');
        const position = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
        });
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
    router.push('/customer/location?reselect=1');
  };

  return (
    <div className="pt-safe pb-safe flex min-h-screen w-full flex-col items-center bg-[#f0f9e8]">
      <div className="w-full max-w-md px-6 pt-6">
        <div className="rounded-3xl bg-[#002a01] p-6 shadow-xl">
          <div className="inline-block rounded-2xl border border-[#002a01] bg-[#002a01]/30 bg-white/60 px-4 py-2 text-sm font-semibold text-[#002a01] backdrop-blur-sm">
            Location
          </div>
          <div className="mt-2">
            <Lottie
              animationData={locationAnim as any}
              loop
              autoplay
              style={{ width: '100%', height: 300 }}
            />
          </div>
          <h1 className="text-4xl font-extrabold text-[#fff]">
            Where should we deliver the hacks?
          </h1>
          <p className="mt-4 text-lg text-[#fff]/80">
            Your location helps us serve meals, hot deals, and quick deliveries
            — right to you.
          </p>
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          <div className="mt-6 space-y-3">
            <button
              onClick={requestLocation}
              disabled={isRequesting}
              className="w-full rounded-3xl bg-[#dcf874] py-7 text-xl font-semibold text-black shadow-md active:scale-[0.99]"
            >
              {isRequesting ? 'Requesting…' : 'Allow Location'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
