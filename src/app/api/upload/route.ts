import { NextRequest, NextResponse } from 'next/server';
import { uploadToS3 } from '@/lib/s3';

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({ 
        success: false, 
        error: 'No file uploaded' 
      }, { status: 400 });
    }

    // Upload to S3 (validation is handled in the uploadToS3 function)
    const uploadResult = await uploadToS3(file, 'menu-items');
    
    if (!uploadResult.success) {
      return NextResponse.json({ 
        success: false, 
        error: uploadResult.error 
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      success: true, 
      imageUrl: uploadResult.imageUrl,
      message: 'File uploaded successfully' 
    });

  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to upload file' 
    }, { status: 500 });
  }
}
