import { NextRequest, NextResponse } from 'next/server';
import { uploadToS3, deleteFromS3 } from '@/lib/s3';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    console.log('Restaurant image upload API called');
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const restaurantId = formData.get('restaurantId') as string;

    console.log('FormData received:', {
      hasFile: !!file,
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type,
      restaurantId,
    });

    if (!file) {
      console.log('No file in form data');
      return NextResponse.json(
        {
          success: false,
          error: 'No file uploaded',
        },
        { status: 400 }
      );
    }

    if (!restaurantId) {
      console.log('No restaurant ID provided');
      return NextResponse.json(
        {
          success: false,
          error: 'Restaurant ID is required',
        },
        { status: 400 }
      );
    }

    console.log('AWS Config check:', {
      hasAccessKey: !!process.env.AWS_ACCESS_KEY_ID,
      hasSecretKey: !!process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION,
      bucket: process.env.AWS_S3_BUCKET_NAME || process.env.AWS_S3_BUCKET,
    });

    // Get current restaurant to check if it has an existing image
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
      select: { imageUrl: true },
    });

    if (!restaurant) {
      return NextResponse.json(
        {
          success: false,
          error: 'Restaurant not found',
        },
        { status: 404 }
      );
    }

    // Upload new image to S3 with presigned URL for immediate access
    // Note: You can switch between uploadToS3 and uploadToS3WithPresignedUrl based on your bucket policy
    const uploadResult = await uploadToS3(file, 'restaurants');

    if (!uploadResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: uploadResult.error,
        },
        { status: 400 }
      );
    }

    // Update restaurant with new image URL
    const updatedRestaurant = await prisma.restaurant.update({
      where: { id: restaurantId },
      data: { imageUrl: uploadResult.imageUrl },
    });

    // Delete old image from S3 if it exists and was stored in S3
    if (restaurant.imageUrl && restaurant.imageUrl.includes('amazonaws.com')) {
      try {
        await deleteFromS3(restaurant.imageUrl);
      } catch (error) {
        console.error('Failed to delete old restaurant image from S3:', error);
        // Don't fail the request if old image deletion fails
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        imageUrl: uploadResult.imageUrl,
        restaurant: updatedRestaurant,
      },
      message: 'Restaurant image uploaded successfully',
    });
  } catch (error) {
    console.error('Error uploading restaurant image:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to upload restaurant image',
      },
      { status: 500 }
    );
  }
}
