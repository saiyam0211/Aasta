import { NextRequest, NextResponse } from 'next/server';
import { cleanupOldImages } from '@/lib/cron';

export async function POST(request: NextRequest) {
  try {
    console.log('🧹 Manual cleanup triggered...');
    
    const result = await cleanupOldImages();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Cleanup completed',
      result 
    });

  } catch (error) {
    console.error('Error during manual cleanup:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to trigger cleanup' 
    }, { status: 500 });
  }
}
