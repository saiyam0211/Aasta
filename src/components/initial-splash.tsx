'use client';

import { useEffect, useState } from 'react';
import Lottie from 'lottie-react';
import { dataPreloader } from '@/lib/data-preloader';
import { useLocationStore } from '@/hooks/useLocation';

export default function InitialSplash() {
  const [show, setShow] = useState(false);
  const [preloadProgress, setPreloadProgress] = useState(0);
  const { locationId, vegOnly } = useLocationStore();

  useEffect(() => {
    const initializeSplash = async () => {
      try {
        const seen = sessionStorage.getItem('aasta_splash_v1');
        if (!seen) {
          setShow(true);
          
          // Start preloading data if location is available
          if (locationId) {
            console.log('🚀 Starting data preload during splash...');
            setPreloadProgress(10);
            
            try {
              const result = await dataPreloader.preloadData({
                locationId,
                vegOnly: vegOnly || false
              });
              
              if (result.success) {
                console.log('✅ Data preloaded successfully:', {
                  restaurants: result.restaurants.length,
                  dishes: result.dishes.length,
                  hacks: result.hacks.length,
                  nearbyDishes: result.nearbyDishes.flat().length,
                  recentOrders: result.recentOrders.length
                });
                setPreloadProgress(100);
              } else {
                console.warn('⚠️ Data preload failed:', result.error);
                setPreloadProgress(50);
              }
            } catch (error) {
              console.error('❌ Data preload error:', error);
              setPreloadProgress(50);
            }
          } else {
            setPreloadProgress(100);
          }
          
          // Ensure splash is visible for at least 2 seconds for smooth experience
          const minDisplayTime = 2000;
          const startTime = Date.now();
          
          const hideSplash = () => {
            const elapsed = Date.now() - startTime;
            const remainingTime = Math.max(0, minDisplayTime - elapsed);
            
            setTimeout(() => {
              setShow(false);
              sessionStorage.setItem('aasta_splash_v1', '1');
            }, remainingTime);
          };
          
          hideSplash();
        }
      } catch (error) {
        console.error('Splash initialization error:', error);
        setShow(false);
      }
    };

    initializeSplash();
  }, [locationId, vegOnly]);

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
      style={{ background: '#002a01' }}
    >
      <div className="flex flex-col items-center justify-center w-full h-full">
        <div className="w-[260px] h-auto mb-8">
          <Lottie animationData={require('../../public/lotties/aasta.json')} loop autoplay />
        </div>
        
        {/* Preload Progress Indicator */}
        {locationId && (
          <div className="w-64">
            <div className="flex justify-between text-sm text-white/70 mb-2">
              <span>Loading your experience...</span>
              <span>{preloadProgress}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-1">
              <div 
                className="bg-[#dcf874] h-1 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${preloadProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


