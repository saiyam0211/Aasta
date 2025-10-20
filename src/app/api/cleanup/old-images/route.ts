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
    console.log('🧹 Starting cleanup of old notification images...');
    
    // Calculate date 1 week ago
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    let deletedCount = 0;
    let errorCount = 0;
    let continuationToken: string | undefined;
    
    do {
      // List objects in the notifications folder
      const listCommand = new ListObjectsV2Command({
        Bucket: BUCKET_NAME,
        Prefix: NOTIFICATION_IMAGES_PREFIX,
        ContinuationToken: continuationToken,
        MaxKeys: 1000 // Process in batches
      });
      
      const response = await s3Client.send(listCommand);
      continuationToken = response.NextContinuationToken;
      
      if (!response.Contents) {
        break;
      }
      
      // Process each object
      for (const object of response.Contents) {
        if (!object.Key || !object.LastModified) {
          continue;
        }
        
        // Check if the object is older than 1 week
        if (object.LastModified < oneWeekAgo) {
          try {
            const deleteCommand = new DeleteObjectCommand({
              Bucket: BUCKET_NAME,
              Key: object.Key
            });
            
            await s3Client.send(deleteCommand);
            deletedCount++;
            console.log(`🗑️ Deleted old image: ${object.Key}`);
          } catch (error) {
            errorCount++;
            console.error(`❌ Error deleting ${object.Key}:`, error);
          }
        }
      }
    } while (continuationToken);
    
    console.log(`✅ Cleanup completed: ${deletedCount} images deleted, ${errorCount} errors`);
    
    return NextResponse.json({
      success: true,
      message: `Cleanup completed: ${deletedCount} images deleted, ${errorCount} errors`,
      deletedCount,
      errorCount
    });
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to cleanup old images'
    }, { status: 500 });
  }
}

// Manual cleanup endpoint
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const force = searchParams.get('force') === 'true';
    
    if (!force) {
      return NextResponse.json({
        success: false,
        error: 'Add ?force=true to confirm cleanup'
      }, { status: 400 });
    }
    
    // Run the cleanup
    const result = await POST(request);
    return result;
    
  } catch (error) {
    console.error('❌ Error during manual cleanup:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to cleanup old images'
    }, { status: 500 });
  }
}
