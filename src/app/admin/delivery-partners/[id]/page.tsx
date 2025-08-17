'use client';

import { useParams } from 'next/navigation';

interface DeliveryPartnerDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function DeliveryPartnerDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  return (
    <div>
      <h1>Delivery Partner Detail Page</h1>
      <p>Details for delivery partner ID: {id}</p>
    </div>
  );
}
