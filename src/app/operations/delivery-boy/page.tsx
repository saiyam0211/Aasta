'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#002a01] to-[#004a02]">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#d1f86a]">
          <span className="text-brand text-xl font-bold text-[#002a01]">D</span>
        </div>
        <h1 className="text-brand mb-4 text-2xl font-bold text-white">
          Delivery Operations
        </h1>
        <p className="text-white">Redirecting...</p>
      </div>
    </div>
  );
}
