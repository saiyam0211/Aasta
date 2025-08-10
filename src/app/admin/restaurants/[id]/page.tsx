interface RestaurantDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function RestaurantDetailPage({ params }: RestaurantDetailPageProps) {
  const { id } = await params;

  return (
    <div>
      <h1>Restaurant Detail Page</h1>
      <p>Details for restaurant ID: {id}</p>
    </div>
  );
}
