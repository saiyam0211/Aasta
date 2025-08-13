import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

// Configure AWS S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || process.env.AWS_S3_BUCKET || 'aasta-delivery-images';

// Allowed file types for images
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/webp'
];

// Maximum file size (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export interface UploadResult {
  success: boolean;
  imageUrl?: string;
  error?: string;
}

/**
 * Upload a file to AWS S3
 * @param file - The file to upload
 * @param folder - The S3 folder/prefix (e.g., 'restaurants', 'menu-items')
 * @returns Promise with upload result
 */
export async function uploadToS3(file: File, folder: string): Promise<UploadResult> {
  try {
    console.log('S3 upload started for file:', file.name, 'Size:', file.size, 'Type:', file.type);
    
    // Validate file type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      console.log('Invalid file type:', file.type);
      return {
        success: false,
        error: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.'
      };
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      console.log('File too large:', file.size, 'Max:', MAX_FILE_SIZE);
      return {
        success: false,
        error: 'File size too large. Maximum size is 5MB.'
      };
    }

    // Generate unique filename
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const uniqueFileName = `${uuidv4()}.${fileExtension}`;
    const s3Key = `${folder}/${uniqueFileName}`;

    console.log('S3 upload config:', {
      bucket: BUCKET_NAME,
      key: s3Key,
      contentType: file.type
    });

    // Convert file to buffer
    const buffer = await file.arrayBuffer();
    console.log('Buffer created, size:', buffer.byteLength);

    // Upload to S3
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key,
      Body: Buffer.from(buffer),
      ContentType: file.type,
      ContentDisposition: 'inline',
      CacheControl: 'public, max-age=31536000', // 1 year cache
    });

    console.log('Sending upload command to S3...');
    await s3Client.send(command);
    console.log('S3 upload successful');

    // Construct the public URL
    const imageUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'ap-south-1'}.amazonaws.com/${s3Key}`;

    return {
      success: true,
      imageUrl
    };

  } catch (error) {
    console.error('Error uploading to S3:', error);
    return {
      success: false,
      error: 'Failed to upload image to cloud storage.'
    };
  }
}

/**
 * Delete a file from AWS S3
 * @param imageUrl - The full URL of the image to delete
 * @returns Promise with deletion result
 */
export async function deleteFromS3(imageUrl: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Extract the S3 key from the URL
    const url = new URL(imageUrl);
    const s3Key = url.pathname.substring(1); // Remove leading slash

    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key,
    });

    await s3Client.send(command);

    return { success: true };
  } catch (error) {
    console.error('Error deleting from S3:', error);
    return {
      success: false,
      error: 'Failed to delete image from cloud storage.'
    };
  }
}

/**
 * Upload buffer data directly to S3
 * @param buffer - Buffer data to upload
 * @param fileName - Original filename for extension
 * @param contentType - MIME type of the file
 * @param folder - The S3 folder/prefix
 * @returns Promise with upload result
 */
export async function uploadBufferToS3(
  buffer: Buffer, 
  fileName: string, 
  contentType: string, 
  folder: string
): Promise<UploadResult> {
  try {
    // Validate content type
    if (!ALLOWED_IMAGE_TYPES.includes(contentType)) {
      return {
        success: false,
        error: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.'
      };
    }

    // Generate unique filename
    const fileExtension = fileName.split('.').pop()?.toLowerCase() || 'jpg';
    const uniqueFileName = `${uuidv4()}.${fileExtension}`;
    const s3Key = `${folder}/${uniqueFileName}`;

    // Upload to S3
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key,
      Body: buffer,
      ContentType: contentType,
      ContentDisposition: 'inline',
      CacheControl: 'public, max-age=31536000', // 1 year cache
    });

    await s3Client.send(command);

    // Construct the public URL
    const imageUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'ap-south-1'}.amazonaws.com/${s3Key}`;

    return {
      success: true,
      imageUrl
    };

  } catch (error) {
    console.error('Error uploading buffer to S3:', error);
    return {
      success: false,
      error: 'Failed to upload image to cloud storage.'
    };
  }
}

/**
 * Generate a presigned URL for secure image access
 * @param s3Key - The S3 key/path of the object
 * @param expiresIn - URL expiration time in seconds (default: 1 hour)
 * @returns Promise with presigned URL
 */
export async function getPresignedUrl(s3Key: string, expiresIn: number = 3600): Promise<string | null> {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn });
    return url;
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    return null;
  }
}

/**
 * Extract S3 key from image URL
 * @param imageUrl - Full S3 URL
 * @returns S3 key or null if invalid
 */
export function extractS3Key(imageUrl: string): string | null {
  try {
    const url = new URL(imageUrl);
    return url.pathname.substring(1); // Remove leading slash
  } catch (error) {
    console.error('Error extracting S3 key:', error);
    return null;
  }
}

/**
 * Upload to S3 and return presigned URL instead of public URL
 * @param file - The file to upload
 * @param folder - The S3 folder/prefix
 * @returns Promise with upload result containing presigned URL
 */
export async function uploadToS3WithPresignedUrl(file: File, folder: string): Promise<UploadResult> {
  try {
    console.log('S3 upload with presigned URL started for file:', file.name);
    
    // Validate file type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return {
        success: false,
        error: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.'
      };
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return {
        success: false,
        error: 'File size too large. Maximum size is 5MB.'
      };
    }

    // Generate unique filename
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const uniqueFileName = `${uuidv4()}.${fileExtension}`;
    const s3Key = `${folder}/${uniqueFileName}`;

    // Convert file to buffer
    const buffer = await file.arrayBuffer();

    // Upload to S3
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key,
      Body: Buffer.from(buffer),
      ContentType: file.type,
      ContentDisposition: 'inline',
      CacheControl: 'public, max-age=31536000',
    });

    await s3Client.send(command);
    console.log('S3 upload successful');

    // Generate presigned URL (valid for 7 days)
    const presignedUrl = await getPresignedUrl(s3Key, 7 * 24 * 3600);
    
    if (!presignedUrl) {
      throw new Error('Failed to generate presigned URL');
    }

    return {
      success: true,
      imageUrl: presignedUrl
    };

  } catch (error) {
    console.error('Error uploading to S3 with presigned URL:', error);
    return {
      success: false,
      error: 'Failed to upload image to cloud storage.'
    };
  }
}
