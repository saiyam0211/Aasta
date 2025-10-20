import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';

// Check if AWS credentials are available
const hasAwsCredentials = process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY && process.env.AWS_S3_BUCKET_NAME;

// Initialize S3 client only if credentials are available
let s3Client: S3Client | null = null;
if (hasAwsCredentials) {
  s3Client = new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });
}

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;
const NOTIFICATION_IMAGES_PREFIX = 'notifications/';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;
    
    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ success: false, error: 'Invalid file type. Please upload an image.' }, { status: 400 });
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: 'File size must be less than 5MB' }, { status: 400 });
    }

    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const extension = file.name.split('.').pop() || 'jpg';
    const filename = `notification-${timestamp}.${extension}`;

    // Check if S3 is available
    if (!hasAwsCredentials || !s3Client || !BUCKET_NAME) {
      console.log('AWS S3 credentials not configured, using placeholder image');
      
      // Return a placeholder image URL for development
      const placeholderUrl = `https://via.placeholder.com/400x300/ffd500/ffffff?text=${encodeURIComponent(filename)}`;
      
      return NextResponse.json({ 
        success: true, 
        url: placeholderUrl,
        filename: filename,
        key: `placeholder-${filename}`,
        message: 'AWS S3 not configured. Using placeholder image.'
      });
    }

    const key = `${NOTIFICATION_IMAGES_PREFIX}${filename}`;

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to S3
    const uploadCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: file.type,
      Metadata: {
        'uploaded-at': new Date().toISOString(),
        'expires-after': '1 week'
      }
    });

    await s3Client.send(uploadCommand);

    // Return public URL
    const publicUrl = `https://${BUCKET_NAME}.s3.amazonaws.com/${key}`;
    
    return NextResponse.json({ 
      success: true, 
      url: publicUrl,
      filename: filename,
      key: key
    });

  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to upload image' 
    }, { status: 500 });
  }
}

// Cleanup function to delete old notification images
export async function DELETE(request: NextRequest) {
  try {
    // Check if S3 is available
    if (!hasAwsCredentials || !s3Client || !BUCKET_NAME) {
      return NextResponse.json({ 
        success: false, 
        error: 'AWS S3 not configured' 
      }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    
    if (key) {
      // Delete specific image
      const deleteCommand = new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key
      });

      await s3Client.send(deleteCommand);
      
      return NextResponse.json({ 
        success: true, 
        message: 'Image deleted successfully' 
      });
    } else {
      // Cleanup all images older than 1 week
      const listCommand = new ListObjectsV2Command({
        Bucket: BUCKET_NAME,
        Prefix: NOTIFICATION_IMAGES_PREFIX,
      });
      
      const response = await s3Client.send(listCommand);
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      let deletedCount = 0;
      
      if (response.Contents) {
        for (const object of response.Contents) {
          if (object.LastModified && object.LastModified < oneWeekAgo) {
            const deleteCommand = new DeleteObjectCommand({
              Bucket: BUCKET_NAME,
              Key: object.Key!,
            });
            
            await s3Client.send(deleteCommand);
            deletedCount++;
          }
        }
      }
      
      return NextResponse.json({ 
        success: true, 
        message: `Cleaned up ${deletedCount} old images`,
        deletedCount 
      });
    }

  } catch (error) {
    console.error('Error cleaning up S3 images:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to cleanup images' 
    }, { status: 500 });
  }
}
