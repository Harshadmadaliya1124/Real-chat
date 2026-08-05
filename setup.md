## Quick Setup Guide...

Follow these steps to get the chat application running locally:

## Prerequisites

- Node.js 18+ installed
- MongoDB running locally or MongoDB Atlas account
- Git (optional)

## Step 1: Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp env.example .env

# Edit .env file with your MongoDB connection
# For local MongoDB:
MONGODB_URI=mongodb://localhost:27017/chat-app

# For MongoDB Atlas:
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/chat-app

# Start the backend server
npm run dev
```

The backend will be running at http://localhost:5000

## Step 2: Frontend Setup

```bash
# Open a new terminal and navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the frontend development server
npm run dev
```

The frontend will be running at http://localhost:3000

## Step 3: Test the Application

1. Open http://localhost:3000 in your browser
2. Register a new account
3. Create a second account in another browser/incognito window
4. Start chatting between the two accounts!

## Troubleshooting

### Backend Issues

**MongoDB Connection Error:**

- Make sure MongoDB is running: `mongod`
- Check your connection string in `.env`
- For MongoDB Atlas, ensure your IP is whitelisted

**Port Already in Use:**

- Change the PORT in `.env` file
- Kill the process using the port: `lsof -ti:5000 | xargs kill -9`

### Frontend Issues

**API Connection Error:**

- Ensure backend is running on port 5000
- Check browser console for CORS errors
- Verify environment variables

**Build Errors:**

- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check TypeScript errors: `npm run build`

## Environment Variables Reference

### Backend (.env)

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/chat-app
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
```

### Frontend (.env.local) - Optional

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

## Production Deployment

### Backend

```bash
cd backend
npm run build
npm start
```

### Frontend

```bash
cd frontend
npm run build
npm start
```

## Features to Test

1. **User Registration/Login**

   - Register with email, password, and display name
   - Login with credentials
   - Profile updates

2. **Personal Messaging**

   - Send messages to other users
   - Real-time message delivery
   - Typing indicators
   - Message history

3. **Group Chats**

   - Create new rooms
   - Send group messages
   - Member management

4. **Real-time Features**
   - Online/offline status
   - Typing indicators
   - Instant message delivery
   - Read receipts

## Support

If you encounter issues:

1. Check the console for error messages
2. Verify all dependencies are installed
3. Ensure MongoDB is running
4. Check environment variables
5. Open an issue on GitHub with error details
