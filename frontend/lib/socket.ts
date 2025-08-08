import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;
  private token: string | null = null;

  connect(token: string) {
    this.token = token;
    
    this.socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000', {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
      console.log('Connected to socket server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from socket server');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Personal messaging
  sendPersonalMessage(content: string, receiverId: string) {
    if (this.socket) {
      this.socket.emit('message:personal', {
        content,
        receiverId,
        messageType: 'personal'
      });
    }
  }

  // Group messaging
  sendGroupMessage(content: string, roomId: string) {
    if (this.socket) {
      this.socket.emit('message:group', {
        content,
        roomId,
        messageType: 'group'
      });
    }
  }

  // Message read acknowledgment
  markMessageAsRead(messageId: string) {
    if (this.socket) {
      this.socket.emit('message:read', { messageId });
    }
  }

  // Typing indicators
  startTyping(receiverId?: string, roomId?: string) {
    if (this.socket) {
      this.socket.emit('typing:start', { receiverId, roomId });
    }
  }

  stopTyping(receiverId?: string, roomId?: string) {
    if (this.socket) {
      this.socket.emit('typing:stop', { receiverId, roomId });
    }
  }

  // Room management
  joinRoom(roomId: string) {
    if (this.socket) {
      this.socket.emit('room:join', roomId);
    }
  }

  leaveRoom(roomId: string) {
    if (this.socket) {
      this.socket.emit('room:leave', roomId);
    }
  }

  // Event listeners
  onMessageReceived(callback: (message: any) => void) {
    if (this.socket) {
      this.socket.on('message:received', callback);
    }
  }

  onMessageDelivered(callback: (data: { messageId: string }) => void) {
    if (this.socket) {
      this.socket.on('message:delivered', callback);
    }
  }

  onMessageRead(callback: (data: { messageId: string; readBy: string }) => void) {
    if (this.socket) {
      this.socket.on('message:read', callback);
    }
  }

  onTypingStart(callback: (data: { userId: string; displayName: string }) => void) {
    if (this.socket) {
      this.socket.on('typing:start', callback);
    }
  }

  onTypingStop(callback: (data: { userId: string }) => void) {
    if (this.socket) {
      this.socket.on('typing:stop', callback);
    }
  }

  onUserOnline(callback: (data: { userId: string; displayName: string; avatarUrl?: string }) => void) {
    if (this.socket) {
      this.socket.on('user:online', callback);
    }
  }

  onUserOffline(callback: (data: { userId: string; displayName: string }) => void) {
    if (this.socket) {
      this.socket.on('user:offline', callback);
    }
  }

  onRoomJoined(callback: (data: { roomId: string }) => void) {
    if (this.socket) {
      this.socket.on('room:joined', callback);
    }
  }

  onRoomLeft(callback: (data: { roomId: string }) => void) {
    if (this.socket) {
      this.socket.on('room:left', callback);
    }
  }

  onMessageError(callback: (data: { error: string }) => void) {
    if (this.socket) {
      this.socket.on('message:error', callback);
    }
  }

  // Remove event listeners
  off(event: string) {
    if (this.socket) {
      this.socket.off(event);
    }
  }

  // Get socket instance
  getSocket() {
    return this.socket;
  }

  // Check if connected
  isConnected() {
    return this.socket?.connected || false;
  }
}

export const socketService = new SocketService();
export default socketService;
