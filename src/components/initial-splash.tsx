'use client';

import { useEffect, useState } from 'react';
import Lottie from 'lottie-react';
import { useLocationStore } from '@/hooks/useLocation';

export default function InitialSplash() {
  const [show, setShow] = useState(false);
  const [preloadProgress, setPreloadProgress] = useState(0);
  const { locationId } = useLocationStore();

  useEffect(() => {
    try {
      const seen = sessionStorage.getItem('aasta_splash_v1');
      if (!seen) {
        setShow(true);
        
        // Start preloading data immediately
        preloadHomeData();
        
        // Ensure splash is visible for at least 3000ms for perceived smoothness
        const t = setTimeout(() => {
          setShow(false);
          sessionStorage.setItem('aasta_splash_v1', '1');
        }, 3000);
        return () => clearTimeout(t);
      }
    } catch {}
  }, []);

  const preloadHomeData = async () => {
    if (!locationId) return;
    
    try {
      console.log('🚀 Starting data preload during splash screen...');
      
      // Preload all home page data in parallel (without veg filter for now)
      const preloadPromises = [
        // Popular content (restaurants + featured dishes)
        fetch(`/api/restaurants/by-location?locationId=${locationId}&limit=12&_=${Date.now()}`)
          .then(res => res.json())
          .then(data => {
            setPreloadProgress(prev => prev + 20);
            return { type: 'popular', data };
          }),
        
        // Hack of the day
        fetch(`/api/restaurants/by-location?locationId=${locationId}&_=${Date.now()}`)
          .then(res => res.json())
          .then(data => {
            setPreloadProgress(prev => prev + 20);
            return { type: 'hacks', data };
          }),
        
        // Nearby dishes
        fetch(`/api/restaurants/by-location?locationId=${locationId}&limit=12&_=${Date.now()}`)
          .then(res => res.json())
          .then(data => {
            setPreloadProgress(prev => prev + 20);
            return { type: 'nearby', data };
          }),
        
        // Recent orders
        fetch('/api/orders?limit=10&paymentStatus=COMPLETED')
          .then(res => res.json())
          .then(data => {
            setPreloadProgress(prev => prev + 20);
            return { type: 'recent', data };
          }),
        
        // Updates etag for polling
        fetch('/api/updates/etag')
          .then(res => res.json())
          .then(data => {
            setPreloadProgress(prev => prev + 20);
            return { type: 'etag', data };
          })
      ];
      
      // Wait for all preloads to complete
      const results = await Promise.allSettled(preloadPromises);
      
      // Store preloaded data in sessionStorage for instant access
      const preloadedData = {
        timestamp: Date.now(),
        locationId,
        results: results.map((result, index) => ({
          type: ['popular', 'hacks', 'nearby', 'recent', 'etag'][index],
          success: result.status === 'fulfilled',
          data: result.status === 'fulfilled' ? result.value.data : null
        }))
      };
      
      sessionStorage.setItem('aasta_preloaded_data', JSON.stringify(preloadedData));
      console.log('✅ Data preload completed during splash screen');
      
    } catch (error) {
      console.error('❌ Error during data preload:', error);
    }
  };

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
      style={{ background: '#002a01' }}
    >
      <div className="flex items-center justify-center w-full h-full">
        <div className="w-[260px] h-auto">
          <Lottie animationData={require('../../public/lotties/aasta.json')} loop autoplay />
        </div>
      </div>
      
      {/* Optional: Show preload progress */}
      {preloadProgress > 0 && preloadProgress < 100 && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2">
          <div className="bg-black/20 backdrop-blur-sm rounded-full px-4 py-2">
            <div className="text-white text-sm font-medium">
              Loading... {preloadProgress}%
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


