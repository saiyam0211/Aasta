/**
 * Utility functions for handling image URLs in the application
 */

/**
 * Convert S3 public URL to local API route for presigned URL generation
 * @param imageUrl - Original S3 URL or local API URL
 * @returns Local API URL that will generate presigned URLs
 */
export function getSecureImageUrl(imageUrl: string): string {
  if (!imageUrl) return '';

  // If it's already a local API URL, return as is
  if (imageUrl.startsWith('/api/images/')) {
    return imageUrl;
  }

  // If it's a presigned URL (contains signature), return as is
  if (imageUrl.includes('X-Amz-Signature')) {
    return imageUrl;
  }

  // If it's a public S3 URL, convert to local API route
  if (imageUrl.includes('amazonaws.com')) {
    try {
      const url = new URL(imageUrl);
      const s3Key = url.pathname.substring(1); // Remove leading slash
      return `/api/images/${s3Key}`;
    } catch (error) {
      console.error('Error parsing S3 URL:', error);
      return imageUrl; // Return original URL as fallback
    }
  }

  return imageUrl;
}

/**
 * Check if an image URL is a presigned URL
 * @param imageUrl - URL to check
 * @returns true if it's a presigned URL
 */
export function isPresignedUrl(imageUrl: string): boolean {
  return imageUrl.includes('X-Amz-Signature');
}

/**
 * Check if an image URL is a public S3 URL
 * @param imageUrl - URL to check
 * @returns true if it's a public S3 URL
 */
export function isPublicS3Url(imageUrl: string): boolean {
  return imageUrl.includes('amazonaws.com') && !isPresignedUrl(imageUrl);
}

/**
 * Check if an image URL is a local API route
 * @param imageUrl - URL to check
 * @returns true if it's a local API route
 */
export function isLocalApiUrl(imageUrl: string): boolean {
  return imageUrl.startsWith('/api/images/');
}

/**
 * Get the S3 key from any type of image URL
 * @param imageUrl - Any image URL format
 * @returns S3 key or null if extraction fails
 */
export function extractS3KeyFromUrl(imageUrl: string): string | null {
  try {
    if (isLocalApiUrl(imageUrl)) {
      // Extract from local API route: /api/images/restaurants/filename.jpg
      return imageUrl.replace('/api/images/', '');
    }

    if (isPublicS3Url(imageUrl) || isPresignedUrl(imageUrl)) {
      const url = new URL(imageUrl);
      return url.pathname.substring(1); // Remove leading slash
    }

    return null;
  } catch (error) {
    console.error('Error extracting S3 key from URL:', error);
    return null;
  }
}
