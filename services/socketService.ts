import { io, Socket } from 'socket.io-client';
import { API_CONFIG } from '@/config/api';

class SocketService {
  private socket: Socket | null = null;
  private connected: boolean = false;

  // Initialize socket connection
  connect(token?: string): void {
    if (this.socket?.connected) {
      console.log('Socket already connected');
      return;
    }

    const options = token
      ? {
          auth: { token },
          transports: ['websocket', 'polling'],
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionAttempts: 5,
        }
      : {
          transports: ['websocket', 'polling'],
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionAttempts: 5,
        };

    this.socket = io(API_CONFIG.SOCKET_URL, options);

    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket?.id);
      this.connected = true;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
      this.connected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  }

  // Disconnect socket
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
      console.log('Socket disconnected manually');
    }
  }

  // Check if connected
  isConnected(): boolean {
    return this.connected && this.socket?.connected || false;
  }

  // Emit event
  emit(event: string, data?: any): void {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn(`Cannot emit "${event}": Socket not connected`);
    }
  }

  // Listen to event
  on(event: string, callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  // Remove event listener
  off(event: string, callback?: (data: any) => void): void {
    if (this.socket) {
      if (callback) {
        this.socket.off(event, callback);
      } else {
        this.socket.off(event);
      }
    }
  }

  // Remove all listeners for an event
  removeAllListeners(event?: string): void {
    if (this.socket) {
      if (event) {
        this.socket.removeAllListeners(event);
      } else {
        this.socket.removeAllListeners();
      }
    }
  }

  // Real-time notifications
  subscribeToNotifications(callback: (notification: any) => void): void {
    this.on('notification', callback);
  }

  unsubscribeFromNotifications(): void {
    this.off('notification');
  }

  // Real-time product updates
  subscribeToProductUpdates(callback: (product: any) => void): void {
    this.on('product:update', callback);
  }

  unsubscribeFromProductUpdates(): void {
    this.off('product:update');
  }

  // Real-time order updates
  subscribeToOrderUpdates(callback: (order: any) => void): void {
    this.on('order:update', callback);
  }

  unsubscribeFromOrderUpdates(): void {
    this.off('order:update');
  }

  // Chat/messaging
  joinRoom(roomId: string): void {
    this.emit('room:join', { roomId });
  }

  leaveRoom(roomId: string): void {
    this.emit('room:leave', { roomId });
  }

  sendMessage(roomId: string, message: string): void {
    this.emit('message:send', { roomId, message });
  }

  subscribeToMessages(callback: (message: any) => void): void {
    this.on('message:receive', callback);
  }

  unsubscribeFromMessages(): void {
    this.off('message:receive');
  }

  // Get socket instance (for advanced usage)
  getSocket(): Socket | null {
    return this.socket;
  }
}

export const socketService = new SocketService();
