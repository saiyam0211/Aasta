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
