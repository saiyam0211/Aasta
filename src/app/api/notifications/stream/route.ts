import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { notificationBroadcaster } from '@/lib/notification-broadcaster';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return new Response('Session ID required', { status: 400 });
    }

    // Create a ReadableStream for Server-Sent Events
    const stream = new ReadableStream({
      start(controller) {
        // Send initial connection message
        const encoder = new TextEncoder();
        const data = `data: ${JSON.stringify({
          type: 'connected',
          timestamp: new Date().toISOString(),
          sessionId,
        })}\n\n`;
        controller.enqueue(encoder.encode(data));

        // Set up periodic heartbeat
        const heartbeat = setInterval(() => {
          try {
            const heartbeatData = `data: ${JSON.stringify({
              type: 'heartbeat',
              timestamp: new Date().toISOString(),
            })}\n\n`;
            controller.enqueue(encoder.encode(heartbeatData));
          } catch (error) {
            console.error('Heartbeat error:', error);
            clearInterval(heartbeat);
            controller.close();
          }
        }, 30000); // Send heartbeat every 30 seconds

        // Register client with notification broadcaster
        notificationBroadcaster.registerClient(
          session.user.id,
          sessionId,
          false
        );

        // Handle cleanup when connection closes
        request.signal?.addEventListener('abort', () => {
          clearInterval(heartbeat);
          notificationBroadcaster.unregisterClient(sessionId);
          controller.close();
        });
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Cache-Control',
      },
    });
  } catch (error) {
    console.error('❌ Error in notification stream:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
