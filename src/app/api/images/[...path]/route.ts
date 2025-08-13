import { NextResponse } from 'next/server';
import { getPresignedUrl } from '@/lib/s3';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const prefix = '/api/images/';
    let s3Key = url.pathname.startsWith(prefix) ? url.pathname.slice(prefix.length) : '';
    s3Key = decodeURIComponent(s3Key);

    if (!s3Key) {
      return NextResponse.json({ success: false, error: 'Invalid image path' }, { status: 400 });
    }

    const presignedUrl = await getPresignedUrl(s3Key, 3600);
    if (!presignedUrl) {
      return NextResponse.json({ success: false, error: 'Failed to generate secure image URL' }, { status: 500 });
    }

    return NextResponse.redirect(presignedUrl);
  } catch (error) {
    console.error('Error serving image:', error);
    return NextResponse.json({ success: false, error: 'Failed to serve image' }, { status: 500 });
  }
}
