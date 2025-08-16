import { io, Socket } from 'socket.io-client';

class SocketClient {
  private socket: Socket | null = null;

  connect(token: string) {
    if (!this.socket) {
      this.socket = io('http://localhost:3000', {
        auth: {
          token,
        },
      });

      this.setupEventHandlers();
    }
  }

  isConnected() {
    return !!this.socket && this.socket.connected;
  }

  authenticate(userId: string, token: string) {
    if (this.socket) {
      this.socket.emit('authenticate', { userId, token });
    }
  }

  private setupEventHandlers() {
    if (this.socket) {
      this.socket.on('connect', () => {
        console.log('Connected to WebSocket server');
      });

      this.socket.on('order_status_update', (data) => {
        console.log('Order status update:', data);
      });

      this.socket.on('delivery_alert', (data) => {
        console.log('Delivery alert:', data);
      });

      this.socket.on('restaurant_notification', (data) => {
        console.log('Restaurant notification:', data);
      });

      this.socket.on('system_notification', (data) => {
        console.log('System notification:', data);
      });
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  emit(event: string, data: any) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }

  on(event: string, handler: (data: any) => void) {
    if (this.socket) {
      this.socket.on(event, handler);
    }
  }

  off(event: string, handler: (data: any) => void) {
    if (this.socket) {
      this.socket.off(event, handler);
    }
  }
}

export const socketClient = new SocketClient();
