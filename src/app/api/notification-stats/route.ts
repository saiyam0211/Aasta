import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { notificationBroadcaster } from '@/lib/notification-broadcaster';

export async function GET(request: Request) {
  try {
    // Check operations authentication
    const operationsSession = request.headers.get('x-operations-auth');

    if (!operationsSession) {
      // Try NextAuth session as fallback
      const session = await getServerSession(authOptions);
      if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    // Get stats from notification broadcaster
    const stats = notificationBroadcaster.getStats();

    return NextResponse.json({
      success: true,
      stats: {
        totalClients: stats.totalClients,
        pwaClients: stats.pwaClients,
        regularClients: stats.regularClients,
        activeClients: stats.activeClients || 0,
        lastUpdate: stats.lastUpdate || new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('❌ Error fetching notification stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notification stats' },
      { status: 500 }
    );
  }
}
