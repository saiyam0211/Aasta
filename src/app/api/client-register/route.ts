import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { notificationBroadcaster } from '@/lib/notification-broadcaster';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized - Please login first' },
        { status: 401 }
      );
    }

    const { sessionId, isPWA, userAgent, pwaDetails } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Register client with notification broadcaster
    const result = notificationBroadcaster.registerClient(
      session.user.id,
      sessionId,
      isPWA
    );

    console.log(`✅ Client registered successfully:`, {
      userId: session.user.id,
      sessionId,
      isPWA,
      userAgent: userAgent?.substring(0, 50) + '...',
      pwaDetails,
    });

    return NextResponse.json({
      success: true,
      message: 'Client registered successfully',
      sessionId,
      isPWA,
      stats: result.stats,
    });
  } catch (error) {
    console.error('❌ Error registering client:', error);
    return NextResponse.json(
      { error: 'Failed to register client' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Update client activity
    const updated = notificationBroadcaster.updateClientActivity(sessionId);

    if (!updated) {
      console.log(`⚠️ Session not found for activity update: ${sessionId}`);
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Activity updated',
      sessionId,
    });
  } catch (error) {
    console.error('❌ Error updating client activity:', error);
    return NextResponse.json(
      { error: 'Failed to update activity' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Unregister client
    notificationBroadcaster.unregisterClient(sessionId);

    return NextResponse.json({
      success: true,
      message: 'Client unregistered successfully',
      sessionId,
    });
  } catch (error) {
    console.error('❌ Error unregistering client:', error);
    return NextResponse.json(
      { error: 'Failed to unregister client' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Allow public access to basic stats, detailed info requires auth
    const url = new URL(request.url);
    const detailed = url.searchParams.get('detailed') === 'true';

    if (detailed && !session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized for detailed info' },
        { status: 401 }
      );
    }

    const stats = detailed
      ? notificationBroadcaster.getClientDetails()
      : notificationBroadcaster.getStats();

    return NextResponse.json({
      success: true,
      ...stats,
    });
  } catch (error) {
    console.error('❌ Error getting client stats:', error);
    return NextResponse.json({ error: 'Failed to get stats' }, { status: 500 });
  }
}
