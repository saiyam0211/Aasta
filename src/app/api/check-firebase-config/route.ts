import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import admin from '@/lib/firebase-admin';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get Firebase app info
    const app = admin.app();
    const projectId = app.options.projectId;
    
    // Try to get a test token to verify configuration
    try {
      // This will fail if the configuration is wrong, but gives us info
      const testToken = 'test-token-for-verification';
      await admin.messaging().send({
        token: testToken,
        notification: { title: 'Test', body: 'Test' }
      });
    } catch (error: any) {
      // We expect this to fail, but it tells us about the configuration
      return NextResponse.json({
        success: false,
        message: 'Firebase configuration issue detected',
        projectId,
        error: error.message,
        errorCode: error.code,
        isSenderIdMismatch: error.message?.includes('SenderId mismatch') || error.code === 'messaging/invalid-registration-token'
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Firebase configuration appears correct',
      projectId
    });

  } catch (error: any) {
    console.error('Error checking Firebase config:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to check Firebase configuration',
      error: error.message,
      projectId: admin.app().options.projectId
    });
  }
}
