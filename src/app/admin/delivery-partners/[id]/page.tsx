export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

interface DeliveryPartnerDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function DeliveryPartnerDetailPage({
  params,
}: DeliveryPartnerDetailPageProps) {
  const { id } = await params;

  return (
    <div>
      <h1>Delivery Partner Detail Page</h1>
      <p>Details for delivery partner ID: {id}</p>
    </div>
  );
}
