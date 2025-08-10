import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { NextApiRequest } from 'next';
import { prisma } from './prisma';

export interface SocketUser {
  id: string;
  role: 'CUSTOMER' | 'RESTAURANT_OWNER' | 'DELIVERY_PARTNER' | 'ADMIN';
  restaurantId?: string;
  deliveryPartnerId?: string;
  socketId: string;
}

export class SocketManager {
  private io: SocketIOServer;
  private connectedUsers: Map<string, SocketUser> = new Map();
  private userSockets: Map<string, string> = new Map(); // userId -> socketId

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.NODE_ENV === 'production' 
          ? [process.env.NEXT_PUBLIC_APP_URL!] 
          : ["http://localhost:3000"],
        methods: ["GET", "POST"],
        credentials: true
      },
      pingTimeout: 60000,
      pingInterval: 25000,
      transports: ['websocket', 'polling']
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`Socket connected: ${socket.id}`);

      // Authentication handler
      socket.on('authenticate', async (data: { userId: string; token: string }) => {
        try {
          const user = await this.authenticateUser(data.userId, data.token);
          if (user) {
            const socketUser: SocketUser = {
              id: user.id,
              role: user.role as any,
              restaurantId: user.restaurant?.id,
              deliveryPartnerId: user.deliveryPartner?.id,
              socketId: socket.id
            };

            this.connectedUsers.set(socket.id, socketUser);
            this.userSockets.set(user.id, socket.id);

            // Join appropriate rooms based on role
            await this.joinUserRooms(socket, socketUser);

            socket.emit('authenticated', { success: true, user: socketUser });
            console.log(`User authenticated: ${user.id} (${user.role})`);
          } else {
            socket.emit('authentication_error', { message: 'Invalid credentials' });
          }
        } catch (error) {
          console.error('Authentication error:', error);
          socket.emit('authentication_error', { message: 'Authentication failed' });
        }
      });

      // Delivery partner location updates
      socket.on('update_location', async (data: { latitude: number; longitude: number }) => {
        const user = this.connectedUsers.get(socket.id);
        if (user && user.role === 'DELIVERY_PARTNER' && user.deliveryPartnerId) {
          try {
            await prisma.deliveryPartner.update({
              where: { id: user.deliveryPartnerId },
              data: {
                currentLatitude: data.latitude,
                currentLongitude: data.longitude
              }
            });

            // Broadcast location to relevant restaurants and customers
            this.broadcastLocationUpdate(user.deliveryPartnerId, data);
          } catch (error) {
            console.error('Error updating location:', error);
          }
        }
      });

      // Order status updates from restaurants
      socket.on('update_order_status', async (data: { orderId: string; status: string }) => {
        const user = this.connectedUsers.get(socket.id);
        if (user && user.role === 'RESTAURANT_OWNER') {
          try {
            const order = await prisma.order.update({
              where: { id: data.orderId },
              data: { status: data.status as any },
              include: {
                customer: { include: { user: true } },
                deliveryPartner: { include: { user: true } },
                restaurant: true
              }
            });

            // Notify customer and delivery partner
            this.notifyOrderStatusUpdate(order);
          } catch (error) {
            console.error('Error updating order status:', error);
          }
        }
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        const user = this.connectedUsers.get(socket.id);
        if (user) {
          this.connectedUsers.delete(socket.id);
          this.userSockets.delete(user.id);
          console.log(`User disconnected: ${user.id}`);
        }
      });

      // Ping/Pong for connection health
      socket.on('ping', () => {
        socket.emit('pong');
      });
    });
  }

  private async authenticateUser(userId: string, token: string) {
    // In a real implementation, you'd verify the JWT token
    // For now, we'll just fetch the user by ID
    return await prisma.user.findUnique({
      where: { id: userId },
      include: {
        restaurant: true,
        deliveryPartner: true
      }
    });
  }

  private async joinUserRooms(socket: any, user: SocketUser) {
    // Join user-specific room
    socket.join(`user_${user.id}`);

    // Join role-specific rooms
    socket.join(`role_${user.role.toLowerCase()}`);

    // Join specific rooms based on role
    if (user.role === 'RESTAURANT_OWNER' && user.restaurantId) {
      socket.join(`restaurant_${user.restaurantId}`);
    } else if (user.role === 'DELIVERY_PARTNER' && user.deliveryPartnerId) {
      socket.join(`delivery_partner_${user.deliveryPartnerId}`);
      
      // Join assigned restaurants rooms
      const partner = await prisma.deliveryPartner.findUnique({
        where: { id: user.deliveryPartnerId }
      });
      
      if (partner?.assignedRestaurants) {
        partner.assignedRestaurants.forEach(restaurantId => {
          socket.join(`restaurant_orders_${restaurantId}`);
        });
      }
    }
  }

  private broadcastLocationUpdate(deliveryPartnerId: string, location: { latitude: number; longitude: number }) {
    // Notify assigned orders' customers and restaurants
    this.io.to(`delivery_partner_${deliveryPartnerId}`).emit('location_update', {
      deliveryPartnerId,
      location,
      timestamp: new Date().toISOString()
    });
  }

  private notifyOrderStatusUpdate(order: any) {
    const orderUpdate = {
      orderId: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      restaurant: order.restaurant.name,
      timestamp: new Date().toISOString()
    };

    // Notify customer
    this.io.to(`user_${order.customer.userId}`).emit('order_status_update', orderUpdate);

    // Notify delivery partner if assigned
    if (order.deliveryPartner) {
      this.io.to(`user_${order.deliveryPartner.userId}`).emit('order_status_update', orderUpdate);
    }

    // Notify restaurant operations
    this.io.to(`restaurant_${order.restaurantId}`).emit('order_status_update', orderUpdate);
  }

  // Public methods for external use
  public sendOrderUpdate(orderId: string, status: string, additionalData?: any) {
    this.io.emit('order_update', {
      orderId,
      status,
      timestamp: new Date().toISOString(),
      ...additionalData
    });
  }

  public sendDeliveryAlert(deliveryPartnerId: string, message: string, data?: any) {
    this.io.to(`delivery_partner_${deliveryPartnerId}`).emit('delivery_alert', {
      message,
      timestamp: new Date().toISOString(),
      ...data
    });
  }

  public sendRestaurantNotification(restaurantId: string, type: string, data: any) {
    this.io.to(`restaurant_${restaurantId}`).emit('restaurant_notification', {
      type,
      data,
      timestamp: new Date().toISOString()
    });
  }

  public sendBulkNotification(message: string, targetRole?: string) {
    const room = targetRole ? `role_${targetRole.toLowerCase()}` : undefined;
    
    if (room) {
      this.io.to(room).emit('system_notification', {
        message,
        timestamp: new Date().toISOString()
      });
    } else {
      this.io.emit('system_notification', {
        message,
        timestamp: new Date().toISOString()
      });
    }
  }

  public getUserSocket(userId: string): string | undefined {
    return this.userSockets.get(userId);
  }

  public isUserOnline(userId: string): boolean {
    return this.userSockets.has(userId);
  }

  public getConnectedUsers(): SocketUser[] {
    return Array.from(this.connectedUsers.values());
  }

  public getConnectedUsersByRole(role: string): SocketUser[] {
    return Array.from(this.connectedUsers.values()).filter(user => user.role === role);
  }
}

// Global socket manager instance
let socketManager: SocketManager | null = null;

export const initializeSocketManager = (server: HTTPServer): SocketManager => {
  if (!socketManager) {
    socketManager = new SocketManager(server);
  }
  return socketManager;
};

export const getSocketManager = (): SocketManager | null => {
  return socketManager;
};
