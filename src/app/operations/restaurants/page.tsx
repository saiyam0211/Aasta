'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RestaurantsRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the new restaurant management path
    router.replace('/operations/restaurant/restaurants');
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-[#002a01] border-t-transparent"></div>
        <p className="text-gray-600">Redirecting to restaurant management...</p>
      </div>
    </div>
  );
}
