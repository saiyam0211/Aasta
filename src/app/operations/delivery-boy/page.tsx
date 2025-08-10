"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DeliveryOperationsPage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated as delivery operations
    const session = localStorage.getItem('operations-session');
    if (!session) {
      router.push('/operations/login');
      return;
    }

    const sessionData = JSON.parse(session);
    if (sessionData.type !== 'delivery') {
      router.push('/operations/login');
      return;
    }

    // Redirect to delivery management
    router.push('/operations/delivery');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#002a01] to-[#004a02]">
      <div className="text-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-[#d1f86a]">
          <span className="text-brand font-bold text-xl text-[#002a01]">D</span>
        </div>
        <h1 className="text-brand text-2xl font-bold mb-4 text-white">Delivery Operations</h1>
        <p className="text-white">Redirecting...</p>
      </div>
    </div>
  );
}
