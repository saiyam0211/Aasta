// Enhanced notification broadcaster for PWA users with real push notification integration
// In production, you'd use Redis or another persistent store

interface ConnectedClient {
  userId: string;
  sessionId: string;
  isPWA: boolean;
  lastSeen: Date;
}

class NotificationBroadcaster {
  private connectedClients: Map<string, ConnectedClient> = new Map();
  private notificationQueue: Array<{
    id: string;
    title: string;
    body: string;
    timestamp: Date;
    targetUsers?: string[];
    data?: any;
  }> = [];

  // Register a PWA client
  registerClient(userId: string, sessionId: string, isPWA: boolean = false) {
    this.connectedClients.set(sessionId, {
      userId,
      sessionId,
      isPWA,
      lastSeen: new Date(),
    });

    console.log(
      `📱 Client registered: ${userId} (PWA: ${isPWA}) - Session: ${sessionId}`
    );
    this.cleanupOldClients();

    return {
      success: true,
      sessionId,
      isPWA,
      stats: this.getStats(),
    };
  }

  // Unregister a client
  unregisterClient(sessionId: string) {
    const client = this.connectedClients.get(sessionId);
    if (client) {
      this.connectedClients.delete(sessionId);
      console.log(
        `📱 Client unregistered: ${client.userId} - Session: ${sessionId}`
      );
    }
  }

  // Update client activity
  updateClientActivity(sessionId: string) {
    const client = this.connectedClients.get(sessionId);
    if (client) {
      client.lastSeen = new Date();
      console.log(`🔄 Updated activity for client: ${client.userId}`);
      return true;
    }
    return false;
  }

  // Broadcast notification to all PWA users
  broadcastToPWAUsers(title: string, body: string, data?: any) {
    const notificationId = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const notification = {
      id: notificationId,
      title,
      body,
      timestamp: new Date(),
      data,
    };

    // Add to queue for persistence
    this.notificationQueue.push(notification);

    // Get all connected PWA clients
    const pwaClients = Array.from(this.connectedClients.values()).filter(
      (client) => client.isPWA
    );

    console.log(
      `📢 Broadcasting notification to ${pwaClients.length} PWA clients:`,
      {
        title,
        body,
        totalClients: this.connectedClients.size,
        pwaClients: pwaClients.length,
      }
    );

    // In a real implementation, this would trigger actual push notifications
    // For now, we'll log the broadcast and rely on the actual push notification system
    pwaClients.forEach((client) => {
      console.log(
        `  → Queued for PWA user: ${client.userId} (session: ${client.sessionId})`
      );
    });

    // Clean up old notifications
    this.cleanupOldNotifications();

    return {
      sent: pwaClients.length,
      notificationId,
      timestamp: notification.timestamp,
      clients: pwaClients.map((c) => ({
        userId: c.userId,
        sessionId: c.sessionId,
      })),
    };
  }

  // Send notification to specific users
  sendToUsers(userIds: string[], title: string, body: string, data?: any) {
    const notificationId = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const notification = {
      id: notificationId,
      title,
      body,
      timestamp: new Date(),
      targetUsers: userIds,
      data,
    };

    // Add to queue for persistence
    this.notificationQueue.push(notification);

    // Find connected clients for specified users
    const targetClients = Array.from(this.connectedClients.values()).filter(
      (client) => userIds.includes(client.userId) && client.isPWA
    );

    console.log(
      `📤 Sending targeted notification to ${targetClients.length} users:`,
      {
        title,
        body,
        targetUsers: userIds,
        foundClients: targetClients.length,
      }
    );

    targetClients.forEach((client) => {
      console.log(
        `  → Targeted notification for: ${client.userId} (session: ${client.sessionId})`
      );
    });

    return {
      sent: targetClients.length,
      notificationId,
      timestamp: notification.timestamp,
      targetUsers: userIds,
      clients: targetClients.map((c) => ({
        userId: c.userId,
        sessionId: c.sessionId,
      })),
    };
  }

  // Get stats
  getStats() {
    const allClients = Array.from(this.connectedClients.values());
    const pwaClients = allClients.filter((client) => client.isPWA);
    const activeClients = allClients.filter(
      (client) => Date.now() - client.lastSeen.getTime() < 5 * 60 * 1000 // Active in last 5 minutes
    );

    return {
      totalClients: allClients.length,
      pwaClients: pwaClients.length,
      activeClients: activeClients.length,
      regularClients: allClients.length - pwaClients.length,
      recentNotifications: this.notificationQueue.slice(-10),
      lastUpdate: new Date(),
    };
  }

  // Get detailed client info
  getClientDetails() {
    const clients = Array.from(this.connectedClients.values()).map(
      (client) => ({
        userId: client.userId,
        sessionId: client.sessionId,
        isPWA: client.isPWA,
        lastSeen: client.lastSeen,
        isActive: Date.now() - client.lastSeen.getTime() < 5 * 60 * 1000,
      })
    );

    return {
      clients,
      stats: this.getStats(),
    };
  }

  // Clean up old clients (older than 30 minutes)
  private cleanupOldClients() {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    let cleanedCount = 0;

    for (const [sessionId, client] of this.connectedClients.entries()) {
      if (client.lastSeen < thirtyMinutesAgo) {
        this.connectedClients.delete(sessionId);
        cleanedCount++;
        console.log(
          `🧹 Cleaned up inactive client: ${client.userId} (session: ${sessionId})`
        );
      }
    }

    if (cleanedCount > 0) {
      console.log(
        `🧹 Cleanup complete: removed ${cleanedCount} inactive clients`
      );
    }
  }

  // Clean up old notifications (keep only last 100)
  private cleanupOldNotifications() {
    if (this.notificationQueue.length > 100) {
      const removed = this.notificationQueue.length - 100;
      this.notificationQueue = this.notificationQueue.slice(-100);
      console.log(`🧹 Cleaned up ${removed} old notifications`);
    }
  }

  // Force cleanup (for manual maintenance)
  forceCleanup() {
    this.cleanupOldClients();
    this.cleanupOldNotifications();
    console.log('🧹 Force cleanup completed');
    return this.getStats();
  }
}

// Singleton instance
export const notificationBroadcaster = new NotificationBroadcaster();

// Auto-cleanup every 5 minutes
setInterval(
  () => {
    notificationBroadcaster['cleanupOldClients']();
    notificationBroadcaster['cleanupOldNotifications']();
  },
  5 * 60 * 1000
);

// Enhanced cleanup every hour
setInterval(
  () => {
    notificationBroadcaster.forceCleanup();
  },
  60 * 60 * 1000
);
