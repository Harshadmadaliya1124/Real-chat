# Real-Time Chat Application

A full-stack real-time chat application built with Next.js, Node.js, Express, MongoDB, and Socket.IO. Features include user authentication, personal messaging, group chats, real-time messaging, online status, and typing indicators.

## Features

### User Management

- ✅ Email/password registration and login with JWT authentication
- ✅ Editable user profiles (display name, avatar URL)
- ✅ Secure password hashing with bcrypt
- ✅ User online/offline status tracking

### Real-Time Messaging

- ✅ Bi-directional WebSocket communication via Socket.IO
- ✅ Instant message delivery and acknowledgment
- ✅ Typing indicators
- ✅ Message read receipts
- ✅ Real-time online status updates

### Group Chats

- ✅ Create, rename, and delete chat rooms
- ✅ Room membership management
- ✅ Group message history with infinite scroll
- ✅ Member online status in groups

### Personal Chats

- ✅ One-to-one messaging between users
- ✅ Chat history with users you've messaged
- ✅ User discovery and contact list

## Tech Stack

### Backend

- **Node.js** with **Express** framework
- **TypeScript** for type safety
- **Socket.IO** for real-time WebSocket communication
- **MongoDB** with **Mongoose** ODM
- **JWT** for authentication
- **bcrypt** for password hashing
- **Express Validator** for input validation

### Frontend

- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Socket.IO Client** for real-time communication
- **React Hook Form** for form management
- **React Hot Toast** for notifications
- **Lucide React** for icons

## Project Structure

```
├── backend/                 # Node.js + Express backend
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── models/         # Mongoose models
│   │   ├── routes/         # Express routes
│   │   ├── middleware/     # Custom middleware
│   │   ├── socket/         # Socket.IO handlers
│   │   └── index.ts        # Server entry point
│   ├── package.json
│   └── tsconfig.json
├── frontend/               # Next.js frontend
│   ├── app/               # Next.js app directory
│   ├── components/        # React components
│   ├── lib/              # Utilities and API client
│   ├── package.json
│   └── tsconfig.json
└── README.md
```

## Prerequisites

- Node.js 18+
- MongoDB (local or cloud)
- npm or yarn

## Installation & Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd chat-app
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/chat-app
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

### 4. Start MongoDB

Make sure MongoDB is running on your system. If using MongoDB locally:

```bash
mongod
```

### 5. Run the Application

#### Development Mode

**Backend:**

```bash
cd backend
npm run dev
```

**Frontend:**

```bash
cd frontend
npm run dev
```

The application will be available at:

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

#### Production Mode

**Backend:**

```bash
cd backend
npm run build
npm start
```

**Frontend:**

```bash
cd frontend
npm run build
npm start
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile

### Users

- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `GET /api/users/online` - Get online users

### Chats

- `GET /api/chats/rooms` - Get user's rooms
- `POST /api/chats/rooms` - Create new room
- `PUT /api/chats/rooms/:id` - Update room
- `DELETE /api/chats/rooms/:id` - Delete room
- `GET /api/chats/rooms/:id/messages` - Get room messages
- `GET /api/chats/personal/:userId` - Get personal messages
- `GET /api/chats/history` - Get chat history

## Socket.IO Events

### Client to Server

- `message:personal` - Send personal message
- `message:group` - Send group message
- `message:read` - Mark message as read
- `typing:start` - Start typing indicator
- `typing:stop` - Stop typing indicator
- `room:join` - Join room
- `room:leave` - Leave room

### Server to Client

- `message:received` - New message received
- `message:delivered` - Message delivery confirmation
- `message:read` - Message read confirmation
- `typing:start` - User started typing
- `typing:stop` - User stopped typing
- `user:online` - User came online
- `user:offline` - User went offline
- `room:joined` - Successfully joined room
- `room:left` - Successfully left room
- `message:error` - Message error

## Environment Variables

### Backend (.env)

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/chat-app
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

## Features in Detail

### Real-Time Messaging

- Messages are sent instantly via WebSocket
- Delivery acknowledgments are sent back to sender
- Read receipts show when messages are read
- Typing indicators show when users are typing

### User Presence

- Online/offline status is tracked in real-time
- Last seen timestamps are updated automatically
- Status changes are broadcast to all connected users

### Message History

- Messages are stored in MongoDB for persistence
- Chat history loads the last 50 messages by default
- Infinite scroll can be implemented for older messages

### Security

- Passwords are hashed using bcrypt
- JWT tokens are used for authentication
- Input validation on all endpoints
- CORS protection enabled

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

If you encounter any issues or have questions, please open an issue on GitHub.
