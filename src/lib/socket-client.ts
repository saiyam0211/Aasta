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
}

export const socketClient = new SocketClient();
