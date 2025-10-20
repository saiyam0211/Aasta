import { NextRequest, NextResponse } from 'next/server';
import { S3Client, ListObjectsV2Command, DeleteObjectCommand } from '@aws-sdk/client-s3';

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME!;
const NOTIFICATION_IMAGES_PREFIX = 'notifications/';

export async function POST(request: NextRequest) {
  try {
    console.log('Starting cleanup of old notification images...');
    
    // List all notification images
    const listCommand = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: NOTIFICATION_IMAGES_PREFIX,
    });
    
    const response = await s3Client.send(listCommand);
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    let deletedCount = 0;
    let totalCount = 0;
    
    if (response.Contents) {
      totalCount = response.Contents.length;
      
      for (const object of response.Contents) {
        if (object.LastModified && object.LastModified < oneWeekAgo) {
          try {
            const deleteCommand = new DeleteObjectCommand({
              Bucket: BUCKET_NAME,
              Key: object.Key!,
            });
            
            await s3Client.send(deleteCommand);
            deletedCount++;
            console.log(`Deleted old image: ${object.Key}`);
          } catch (deleteError) {
            console.error(`Failed to delete ${object.Key}:`, deleteError);
          }
        }
      }
    }
    
    console.log(`Cleanup completed. Deleted ${deletedCount} out of ${totalCount} images.`);
    
    return NextResponse.json({ 
      success: true, 
      message: `Cleaned up ${deletedCount} old images out of ${totalCount} total`,
      deletedCount,
      totalCount
    });

  } catch (error) {
    console.error('Error during image cleanup:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to cleanup images' 
    }, { status: 500 });
  }
}
