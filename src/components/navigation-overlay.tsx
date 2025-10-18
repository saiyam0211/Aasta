'use client';

import { useEffect, useState } from 'react';
import { navigationService } from '@/lib/navigation-service';

export default function NavigationOverlay() {
  const [navigationState, setNavigationState] = useState(navigationService.getNavigationState());

  useEffect(() => {
    const unsubscribe = navigationService.subscribe(setNavigationState);
    return unsubscribe;
  }, []);

  if (!navigationState.isNavigating) return null;

  return (
    <div className="fixed inset-0 z-[9998] bg-black/20 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#002a01] border-t-transparent"></div>
          <div className="text-[#002a01] font-medium">
            {navigationState.targetPath === '/profile' && 'Opening Profile...'}
            {navigationState.targetPath === '/cart' && 'Opening Cart...'}
            {navigationState.targetPath?.startsWith('/restaurants/') && 'Opening Restaurant...'}
            {navigationState.targetPath?.startsWith('/orders/') && 'Opening Order...'}
            {!navigationState.targetPath && 'Loading...'}
          </div>
        </div>
      </div>
    </div>
  );
}
