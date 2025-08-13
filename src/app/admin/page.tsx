'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { adminSession } from '@/lib/admin-auth';

export default function AdminRootPage() {
  const router = useRouter();

  useEffect(() => {
    const session = adminSession.get();
    if (session) {
      router.push('/admin/dashboard');
    } else {
      router.push('/admin/login');
    }
  }, [router]);

  return (
    <div className="bg-primary-dark-green flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="bg-accent-leaf-green mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
          <span className="text-brand text-primary-dark-green text-xl font-bold">
            A
          </span>
        </div>
        <h1 className="text-brand text-off-white mb-4 text-2xl font-bold">
          Aasta Admin
        </h1>
        <p className="text-off-white">Redirecting...</p>
      </div>
    </div>
  );
}
