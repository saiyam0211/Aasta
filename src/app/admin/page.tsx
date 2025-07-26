"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { adminSession } from "@/lib/admin-auth";

export default function AdminRootPage() {
  const router = useRouter();

  useEffect(() => {
    const session = adminSession.get();
    if (session) {
      router.push("/admin/dashboard");
    } else {
      router.push("/admin/login");
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary-dark-green">
      <div className="text-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-accent-leaf-green">
          <span className="text-brand font-bold text-xl text-primary-dark-green">A</span>
        </div>
        <h1 className="text-brand text-2xl font-bold mb-4 text-off-white">Aasta Admin</h1>
        <p className="text-off-white">Redirecting...</p>
      </div>
    </div>
  );
}
