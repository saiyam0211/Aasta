'use client';

import RestaurantLayout from '@/components/layouts/restaurant-layout';
import FinancialDashboard from '@/components/dashboard/FinancialDashboard';

export default function RestaurantFinancialsPage() {
  return (
    <RestaurantLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Financial Dashboard
          </h1>
          <p className="text-gray-600">
            Monitor your restaurant's financial performance and payment
            analytics.
          </p>
        </div>

        <FinancialDashboard />
      </div>
    </RestaurantLayout>
  );
}
