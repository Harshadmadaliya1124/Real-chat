import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import Message from '../models/Message';
import User from '../models/User';
import Room from '../models/Room';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  user?: any;
}

interface MessageData {
  content: string;
  receiverId?: string;
  roomId?: string;
  messageType: 'personal' | 'group';
}

export const setupSocketHandlers = (io: Server) => {
  // Authentication middleware
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
      const user = await User.findById(decoded.userId).select('-password');
      
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', async (socket: AuthenticatedSocket) => {
    console.log(`User connected: ${socket.user?.displayName}`);

    // Update user online status
    await User.findByIdAndUpdate(socket.userId, {
      isOnline: true,
      lastSeen: new Date()
    });

    // Join user to their personal room for notifications
    socket.join(`user:${socket.userId}`);

    // Auto-join user to their group rooms; if no rooms, also join default General room
    const userRooms = await Room.find({ members: socket.userId, isActive: true });
    userRooms.forEach(room => socket.join(`room:${room._id}`));

    // Ensure user is in General room membership
    const generalRoom = await Room.findOne({ name: 'General', isActive: true });
    if (generalRoom) {
      const isMember = generalRoom.members.map(id => id.toString()).includes(socket.userId!);
      if (!isMember) {
        generalRoom.members.push(new (require('mongoose').Types.ObjectId)(socket.userId));
        await generalRoom.save();
        socket.join(`room:${generalRoom._id}`);
      }
    }

    // Emit user online status to all connected clients
    socket.broadcast.emit('user:online', {
      userId: socket.userId,
      displayName: socket.user?.displayName,
      avatarUrl: socket.user?.avatarUrl
    });

    // Handle personal message
    socket.on('message:personal', async (data: MessageData) => {
      try {
        const { content, receiverId, messageType } = data;

        if (!receiverId || messageType !== 'personal') {
          return;
        }

        // Check if receiver exists
        const receiver = await User.findById(receiverId);
        if (!receiver) {
          return;
        }

        // Save message to database
        const message = new Message({
          senderId: socket.userId,
          receiverId,
          content,
          messageType: 'personal'
        });

        await message.save();

        const populatedMessage = await Message.findById(message._id)
          .populate('senderId', 'displayName avatarUrl')
          .populate('receiverId', 'displayName avatarUrl');

        // Emit to sender
        socket.emit('message:received', populatedMessage);

        // Emit to receiver
        socket.to(`user:${receiverId}`).emit('message:received', populatedMessage);

        // Send delivery acknowledgment
        socket.emit('message:delivered', { messageId: message._id });

      } catch (error) {
        console.error('Personal message error:', error);
        socket.emit('message:error', { error: 'Failed to send message' });
      }
    });

    // Handle group message
    socket.on('message:group', async (data: MessageData) => {
      try {
        const { content, roomId, messageType } = data;

        if (!roomId || messageType !== 'group') {
          return;
        }

        // Check if user is member of the room
        const room = await Room.findById(roomId);
        if (!room || !room.members.includes(socket.userId)) {
          socket.emit('message:error', { error: 'Not authorized' });
          return;
        }

        // Save message to database
        const message = new Message({
          senderId: socket.userId,
          roomId,
          content,
          messageType: 'group'
        });

        await message.save();

        const populatedMessage = await Message.findById(message._id)
          .populate('senderId', 'displayName avatarUrl');

        // Emit to all room members
        io.to(`room:${roomId}`).emit('message:received', populatedMessage);

        // Send delivery acknowledgment
        socket.emit('message:delivered', { messageId: message._id });

      } catch (error) {
        console.error('Group message error:', error);
        socket.emit('message:error', { error: 'Failed to send message' });
      }
    });

    // Handle message read acknowledgment
    socket.on('message:read', async (data: { messageId: string }) => {
      try {
        const { messageId } = data;

        const message = await Message.findById(messageId);
        if (!message) {
          return;
        }

        // Add user to readBy array if not already there
        if (!message.readBy.includes(socket.userId)) {
          message.readBy.push(socket.userId);
          await message.save();
        }

        // Emit read acknowledgment to message sender
        if (message.senderId.toString() !== socket.userId) {
          socket.to(`user:${message.senderId}`).emit('message:read', {
            messageId,
            readBy: socket.userId
          });
        }

      } catch (error) {
        console.error('Message read error:', error);
      }
    });

    // Handle typing indicators
    socket.on('typing:start', (data: { receiverId?: string; roomId?: string }) => {
      const { receiverId, roomId } = data;
      
      if (receiverId) {
        socket.to(`user:${receiverId}`).emit('typing:start', {
          userId: socket.userId,
          displayName: socket.user?.displayName
        });
      } else if (roomId) {
        socket.to(`room:${roomId}`).emit('typing:start', {
          userId: socket.userId,
          displayName: socket.user?.displayName
        });
      }
    });

    socket.on('typing:stop', (data: { receiverId?: string; roomId?: string }) => {
      const { receiverId, roomId } = data;
      
      if (receiverId) {
        socket.to(`user:${receiverId}`).emit('typing:stop', {
          userId: socket.userId
        });
      } else if (roomId) {
        socket.to(`room:${roomId}`).emit('typing:stop', {
          userId: socket.userId
        });
      }
    });

    // Handle room join
    socket.on('room:join', async (roomId: string) => {
      try {
        const room = await Room.findById(roomId);
        if (room && room.members.includes(socket.userId)) {
          socket.join(`room:${roomId}`);
          socket.emit('room:joined', { roomId });
        }
      } catch (error) {
        console.error('Room join error:', error);
      }
    });

    // Handle room leave
    socket.on('room:leave', (roomId: string) => {
      socket.leave(`room:${roomId}`);
      socket.emit('room:left', { roomId });
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      console.log(`User disconnected: ${socket.user?.displayName}`);

      // Update user offline status
      await User.findByIdAndUpdate(socket.userId, {
        isOnline: false,
        lastSeen: new Date()
      });

      // Emit user offline status
      socket.broadcast.emit('user:offline', {
        userId: socket.userId,
        displayName: socket.user?.displayName
      });
    });
  });
};
