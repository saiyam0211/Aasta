"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import CustomerLayout from "@/components/layouts/customer-layout";

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return; // Still loading

    if (!session) {
      // Redirect to sign in
      router.push("/auth/signin?callbackUrl=/orders");
      return;
    }

    // Redirect based on user role
    switch (session.user?.role) {
      case "CUSTOMER":
        router.push("/customer/orders");
        break;
      case "RESTAURANT":
        router.push("/restaurant/orders");
        break;
      case "DELIVERY_PARTNER":
        router.push("/delivery/orders");
        break;
      case "ADMIN":
        router.push("/admin/orders");
        break;
      default:
        router.push("/customer/orders");
    }
  }, [session, status, router]);

  // Show loading while redirecting
  return (
    <CustomerLayout>
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Redirecting to your orders...</p>
        </div>
      </div>
    </CustomerLayout>
  );
}
