# Chat App Frontend

Next.js + TypeScript frontend for the real-time chat application.

## Features

- **Modern UI**: Clean, responsive design with Tailwind CSS
- **Real-time Chat**: Instant messaging with Socket.IO
- **User Authentication**: Login/register with JWT
- **Personal & Group Chats**: Support for both chat types
- **User Presence**: Online/offline status indicators
- **Typing Indicators**: Real-time typing status
- **Message History**: Persistent chat history
- **Responsive Design**: Works on desktop and mobile

## Tech Stack

- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Socket.IO Client** for real-time communication
- **React Hook Form** for form management
- **React Hot Toast** for notifications
- **Lucide React** for icons
- **Axios** for API communication

## Project Structure

```
app/                    # Next.js app directory
├── globals.css        # Global styles with Tailwind
├── layout.tsx         # Root layout component
├── page.tsx           # Home page (redirects to login/dashboard)
├── login/             # Login page
│   └── page.tsx
├── register/          # Registration page
│   └── page.tsx
└── dashboard/         # Main chat dashboard
    └── page.tsx
components/            # React components
├── Sidebar.tsx        # Chat sidebar with user/room list
└── ChatWindow.tsx     # Main chat interface
lib/                   # Utilities and services
├── api.ts            # API client with Axios
├── socket.ts         # Socket.IO client service
└── utils.ts          # Utility functions
```

## Installation

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Create environment file (optional):**

   ```bash
   # .env.local
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

The application will be available at http://localhost:3000

## Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## Components

### Sidebar Component

The sidebar displays:

- Current user profile
- Personal chat tab with user list
- Group chat tab with room list
- Online status indicators
- Recent chat history

**Props:**

```typescript
interface SidebarProps {
  user: User;
  selectedChat: { type: "personal" | "group"; id: string; name: string } | null;
  onChatSelect: (chat: {
    type: "personal" | "group";
    id: string;
    name: string;
  }) => void;
  onLogout: () => void;
}
```

### ChatWindow Component

The main chat interface displays:

- Chat header with participant info
- Message history with infinite scroll
- Message input with typing indicators
- Real-time message updates

**Props:**

```typescript
interface ChatWindowProps {
  chat: {
    type: "personal" | "group";
    id: string;
    name: string;
  };
  currentUser: User;
}
```

## Pages

### Home Page (`/`)

- Redirects to login if not authenticated
- Redirects to dashboard if authenticated

### Login Page (`/login`)

- Email/password login form
- Form validation with React Hook Form
- Error handling and success notifications
- Link to registration page

### Register Page (`/register`)

- User registration form
- Password confirmation validation
- Form validation with React Hook Form
- Link to login page

### Dashboard Page (`/dashboard`)

- Main chat interface
- Sidebar with user/room navigation
- Chat window for selected conversation
- Authentication check and redirect

## Services

### API Client (`lib/api.ts`)

Handles all HTTP requests to the backend:

```typescript
// Authentication
authAPI.register(data);
authAPI.login(data);
authAPI.getMe();
authAPI.updateProfile(data);

// Users
usersAPI.getAll();
usersAPI.getById(id);
usersAPI.getOnline();

// Chats
chatsAPI.getRooms();
chatsAPI.createRoom(data);
chatsAPI.getRoomMessages(id);
chatsAPI.getPersonalMessages(userId);
```

### Socket Service (`lib/socket.ts`)

Manages WebSocket connections and events:

```typescript
// Connect to socket
socketService.connect(token);

// Send messages
socketService.sendPersonalMessage(content, receiverId);
socketService.sendGroupMessage(content, roomId);

// Typing indicators
socketService.startTyping(receiverId, roomId);
socketService.stopTyping(receiverId, roomId);

// Event listeners
socketService.onMessageReceived(callback);
socketService.onTypingStart(callback);
socketService.onUserOnline(callback);
```

### Utilities (`lib/utils.ts`)

Common utility functions:

```typescript
// Format time
formatTime(date);

// Format date
formatDate(date);

// Get user initials
getInitials(name);

// Truncate text
truncateText(text, maxLength);

// Generate avatar URL
generateAvatarUrl(name, size);

// Class name utility
cn(...inputs);
```

## Styling

The application uses Tailwind CSS with custom components:

### Custom Components

```css
.btn {
  @apply px-4 py-2 rounded-lg font-medium transition-colors duration-200;
}

.btn-primary {
  @apply bg-primary-600 text-white hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2;
}

.input {
  @apply w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent;
}

.card {
  @apply bg-white rounded-lg shadow-sm border border-gray-200;
}
```

### Color Palette

- Primary: Blue (`primary-50` to `primary-900`)
- Gray: Neutral grays for text and backgrounds
- Success: Green for online status
- Error: Red for error states

## State Management

The application uses React's built-in state management:

- **Local State**: `useState` for component-specific state
- **Effects**: `useEffect` for side effects and data fetching
- **Context**: Could be added for global state if needed
- **Local Storage**: For persisting authentication tokens

## Authentication Flow

1. **Login/Register**: User submits credentials
2. **Token Storage**: JWT token stored in localStorage
3. **Socket Connection**: Connect to WebSocket with token
4. **API Requests**: Token automatically included in headers
5. **Token Validation**: Backend validates token on each request
6. **Logout**: Clear token and disconnect socket

## Real-time Features

### Message Handling

- Messages sent via WebSocket for instant delivery
- Messages stored in local state for UI updates
- Automatic scroll to bottom on new messages
- Message read receipts

### Typing Indicators

- Start typing when user begins typing
- Stop typing after 1 second of inactivity
- Real-time typing status from other users
- Visual indicators in chat window

### User Presence

- Online/offline status updates in real-time
- Last seen timestamps
- Status indicators in user lists
- Automatic status updates on connection/disconnection

## Responsive Design

The application is fully responsive:

- **Desktop**: Full sidebar + chat window layout
- **Tablet**: Collapsible sidebar
- **Mobile**: Stacked layout with navigation

### Breakpoints

- `sm`: 640px and up
- `md`: 768px and up
- `lg`: 1024px and up
- `xl`: 1280px and up

## Error Handling

- **API Errors**: Handled with try-catch blocks
- **Network Errors**: Toast notifications for user feedback
- **Validation Errors**: Form-level error display
- **Authentication Errors**: Automatic redirect to login

## Performance Optimizations

- **Code Splitting**: Next.js automatic code splitting
- **Image Optimization**: Next.js Image component
- **Lazy Loading**: Components loaded on demand
- **Memoization**: React.memo for expensive components
- **Debouncing**: Typing indicators debounced

## Environment Variables

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000

# Optional: Analytics
NEXT_PUBLIC_GA_ID=your-google-analytics-id
```

## Production Deployment

1. **Build the application:**

   ```bash
   npm run build
   ```

2. **Start production server:**

   ```bash
   npm start
   ```

3. **Environment variables:**
   ```env
   NEXT_PUBLIC_API_URL=https://your-api-domain.com/api
   NEXT_PUBLIC_SOCKET_URL=https://your-api-domain.com
   ```

## Testing

To add tests, you can use Jest and React Testing Library:

```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom
```

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Accessibility

- Semantic HTML elements
- ARIA labels and roles
- Keyboard navigation support
- Focus management
- Color contrast compliance

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Troubleshooting

### Common Issues

1. **Socket connection fails:**

   - Check if backend is running
   - Verify CORS settings
   - Check environment variables

2. **Authentication issues:**

   - Clear localStorage
   - Check token expiration
   - Verify JWT secret

3. **Styling issues:**

   - Run `npm run build` to rebuild Tailwind
   - Check Tailwind configuration
   - Verify CSS imports

4. **Build errors:**
   - Clear `.next` folder
   - Reinstall dependencies
   - Check TypeScript errors
