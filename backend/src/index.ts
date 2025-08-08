import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import chatRoutes from './routes/chats';
import { setupSocketHandlers } from './socket/socketHandlers';
import Room from './models/Room';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/chat-app')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chats', chatRoutes);

// Socket.IO setup
setupSocketHandlers(io);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Ensure a default public "General" room exists and is active
(async () => {
  try {
    const existing = await Room.findOne({ name: 'General', isActive: true });
    if (!existing) {
      await new Room({
        name: 'General',
        description: 'Default public room for everyone',
        createdBy: new mongoose.Types.ObjectId(),
        members: [],
        isActive: true
      }).save();
      console.log('Created default room: General');
    }
  } catch (e) {
    console.error('Failed to ensure default room', e);
  }
})();
