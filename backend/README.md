# Chat App Backend

Node.js + Express + TypeScript backend for the real-time chat application.

## Features

- **User Authentication**: JWT-based authentication with bcrypt password hashing
- **Real-time Messaging**: Socket.IO for instant message delivery
- **Group Chats**: Create and manage chat rooms
- **Personal Chats**: One-to-one messaging
- **User Presence**: Online/offline status tracking
- **Message History**: Persistent message storage in MongoDB
- **Typing Indicators**: Real-time typing status
- **Read Receipts**: Message read acknowledgments

## Tech Stack

- **Node.js** with **Express** framework
- **TypeScript** for type safety
- **Socket.IO** for WebSocket communication
- **MongoDB** with **Mongoose** ODM
- **JWT** for authentication
- **bcrypt** for password hashing
- **Express Validator** for input validation

## Project Structure

```
src/
├── controllers/          # Route controllers
│   ├── authController.ts # Authentication logic
│   ├── userController.ts # User management
│   └── chatController.ts # Chat and room management
├── models/              # Mongoose models
│   ├── User.ts         # User schema
│   ├── Message.ts      # Message schema
│   └── Room.ts         # Room schema
├── routes/              # Express routes
│   ├── auth.ts         # Authentication routes
│   ├── users.ts        # User routes
│   └── chats.ts        # Chat routes
├── middleware/          # Custom middleware
│   └── auth.ts         # JWT authentication middleware
├── socket/              # Socket.IO handlers
│   └── socketHandlers.ts # WebSocket event handlers
└── index.ts            # Server entry point
```

## Installation

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Create environment file:**

   ```bash
   cp env.example .env
   ```

3. **Configure environment variables:**

   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/chat-app
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   NODE_ENV=development
   ```

4. **Start MongoDB:**
   Make sure MongoDB is running on your system.

## Development

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## API Endpoints

### Authentication

#### Register User

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "displayName": "John Doe"
}
```

#### Login User

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Get Current User

```http
GET /api/auth/me
Authorization: Bearer <token>
```

#### Update Profile

```http
PUT /api/auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "displayName": "New Name",
  "avatarUrl": "https://example.com/avatar.jpg"
}
```

### Users

#### Get All Users

```http
GET /api/users
Authorization: Bearer <token>
```

#### Get User by ID

```http
GET /api/users/:id
Authorization: Bearer <token>
```

#### Get Online Users

```http
GET /api/users/online
Authorization: Bearer <token>
```

### Chats

#### Get User's Rooms

```http
GET /api/chats/rooms
Authorization: Bearer <token>
```

#### Create Room

```http
POST /api/chats/rooms
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Room Name",
  "description": "Room description",
  "memberIds": ["userId1", "userId2"]
}
```

#### Update Room

```http
PUT /api/chats/rooms/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "New Room Name",
  "description": "New description"
}
```

#### Delete Room

```http
DELETE /api/chats/rooms/:id
Authorization: Bearer <token>
```

#### Get Room Messages

```http
GET /api/chats/rooms/:id/messages?page=1&limit=50
Authorization: Bearer <token>
```

#### Get Personal Messages

```http
GET /api/chats/personal/:userId?page=1&limit=50
Authorization: Bearer <token>
```

#### Get Chat History

```http
GET /api/chats/history
Authorization: Bearer <token>
```

## Socket.IO Events

### Client to Server

#### Send Personal Message

```javascript
socket.emit("message:personal", {
  content: "Hello!",
  receiverId: "userId",
  messageType: "personal",
});
```

#### Send Group Message

```javascript
socket.emit("message:group", {
  content: "Hello everyone!",
  roomId: "roomId",
  messageType: "group",
});
```

#### Mark Message as Read

```javascript
socket.emit("message:read", {
  messageId: "messageId",
});
```

#### Typing Indicators

```javascript
// Start typing
socket.emit('typing:start', {
  receiverId: 'userId' // for personal chat
  // OR
  roomId: 'roomId' // for group chat
});

// Stop typing
socket.emit('typing:stop', {
  receiverId: 'userId' // for personal chat
  // OR
  roomId: 'roomId' // for group chat
});
```

#### Room Management

```javascript
// Join room
socket.emit("room:join", "roomId");

// Leave room
socket.emit("room:leave", "roomId");
```

### Server to Client

#### Message Events

```javascript
// New message received
socket.on("message:received", (message) => {
  console.log("New message:", message);
});

// Message delivered
socket.on("message:delivered", (data) => {
  console.log("Message delivered:", data.messageId);
});

// Message read
socket.on("message:read", (data) => {
  console.log("Message read by:", data.readBy);
});
```

#### Typing Events

```javascript
// User started typing
socket.on("typing:start", (data) => {
  console.log(`${data.displayName} is typing...`);
});

// User stopped typing
socket.on("typing:stop", (data) => {
  console.log("User stopped typing");
});
```

#### Presence Events

```javascript
// User came online
socket.on("user:online", (data) => {
  console.log(`${data.displayName} is online`);
});

// User went offline
socket.on("user:offline", (data) => {
  console.log(`${data.displayName} is offline`);
});
```

#### Room Events

```javascript
// Successfully joined room
socket.on("room:joined", (data) => {
  console.log("Joined room:", data.roomId);
});

// Successfully left room
socket.on("room:left", (data) => {
  console.log("Left room:", data.roomId);
});
```

#### Error Events

```javascript
// Message error
socket.on("message:error", (data) => {
  console.error("Message error:", data.error);
});
```

## Database Models

### User Model

```typescript
interface IUser {
  email: string;
  password: string;
  displayName: string;
  avatarUrl?: string;
  isOnline: boolean;
  lastSeen: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}
```

### Message Model

```typescript
interface IMessage {
  senderId: ObjectId;
  receiverId?: ObjectId; // For personal messages
  roomId?: ObjectId; // For group messages
  content: string;
  messageType: "personal" | "group";
  readBy: ObjectId[];
  deliveredTo: ObjectId[];
}
```

### Room Model

```typescript
interface IRoom {
  name: string;
  description?: string;
  createdBy: ObjectId;
  members: ObjectId[];
  isActive: boolean;
}
```

## Authentication

The backend uses JWT (JSON Web Tokens) for authentication. Tokens are sent in the `Authorization` header:

```http
Authorization: Bearer <token>
```

Tokens are automatically verified by the `auth` middleware for protected routes.

## Error Handling

The API returns consistent error responses:

```json
{
  "message": "Error description",
  "errors": [] // Validation errors if applicable
}
```

Common HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Security Features

- **Password Hashing**: All passwords are hashed using bcrypt
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: All inputs are validated using express-validator
- **CORS Protection**: Cross-origin requests are properly handled
- **Rate Limiting**: Can be easily added for production

## Production Deployment

1. **Set environment variables:**

   ```env
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=your-production-mongodb-uri
   JWT_SECRET=your-production-jwt-secret
   ```

2. **Build the application:**

   ```bash
   npm run build
   ```

3. **Start the server:**
   ```bash
   npm start
   ```

## Testing

To add tests, you can use Jest or Mocha with Supertest:

```bash
npm install --save-dev jest @types/jest supertest @types/supertest
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request
