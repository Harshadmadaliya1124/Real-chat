'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { socketService } from '@/lib/socket';
import { authAPI } from '@/lib/api';
import Sidebar from '@/components/Sidebar';
import Link from 'next/link';
import ChatWindow from '@/components/ChatWindow';
import { User } from 'lucide-react';

interface User {
  _id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  isOnline: boolean;
  lastSeen: string;
}

interface Room {
  _id: string;
  name: string;
  description?: string;
  createdBy: User;
  members: User[];
  isActive: boolean;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [selectedChat, setSelectedChat] = useState<{
    type: 'personal' | 'group';
    id: string;
    name: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      
      // Connect to socket
      socketService.connect(token);
      
      // Verify token is still valid
      authAPI.getMe()
        .then(() => setIsLoading(false))
        .catch(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          router.push('/login');
        });
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      router.push('/login');
    }
  }, [router]);

  const handleLogout = () => {
    socketService.disconnect();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
    toast.success('Logged out successfully');
  };

  const handleChatSelect = (chat: { type: 'personal' | 'group'; id: string; name: string }) => {
    setSelectedChat(chat);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="h-screen flex bg-gray-50">
      <Sidebar
        user={user}
        selectedChat={selectedChat}
        onChatSelect={handleChatSelect}
        onLogout={handleLogout}
      />
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <ChatWindow
            chat={selectedChat}
            currentUser={user}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Welcome to Chat App
              </h3>
              <p className="text-gray-600">
                Select a conversation to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
