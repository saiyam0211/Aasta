"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RestaurantsRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the new restaurant management path
    router.replace('/operations/restaurant/restaurants');
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-[#002a01] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to restaurant management...</p>
      </div>
    </div>
  );
}
