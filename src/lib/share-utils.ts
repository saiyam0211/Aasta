export interface ShareData {
  title: string;
  text: string;
  url: string;
}

export async function shareContent(data: ShareData): Promise<boolean> {
  // Check if Web Share API is available (mobile browsers)
  if (navigator.share && navigator.canShare && navigator.canShare(data)) {
    try {
      await navigator.share(data);
      return true;
    } catch (error) {
      console.log('Web Share API failed:', error);
      // Fall back to clipboard copy
    }
  }

  // Fallback: Copy to clipboard
  try {
    const shareText = `${data.title}\n\n${data.text}\n\n${data.url}`;
    await navigator.clipboard.writeText(shareText);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}

export function generateProductShareData(
  productName: string,
  productDescription: string,
  price: number,
  restaurantName: string,
  productId: string
): ShareData {
  const url = `${window.location.origin}/restaurants/${productId}`;
  return {
    title: `Check out ${productName} at ${restaurantName}`,
    text: `${productName} - ${productDescription}\nPrice: ₹${price}\nRestaurant: ${restaurantName}`,
    url,
  };
}

export function generateRestaurantShareData(
  restaurantName: string,
  restaurantDescription: string,
  rating: number | string,
  location: string,
  restaurantId: string
): ShareData {
  const url = `${window.location.origin}/restaurants/${restaurantId}`;
  return {
    title: `Discover ${restaurantName} on Aasta`,
    text: `${restaurantName}\n${restaurantDescription}\nRating: ${rating}⭐\nLocation: ${location}`,
    url,
  };
}
