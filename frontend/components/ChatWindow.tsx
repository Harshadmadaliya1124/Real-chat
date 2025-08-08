'use client';

import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { chatsAPI } from '@/lib/api';
import { socketService } from '@/lib/socket';
import { Send, MoreVertical } from 'lucide-react';
import { formatTime, generateAvatarUrl } from '@/lib/utils';

interface User {
  _id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  isOnline: boolean;
  lastSeen: string;
}

interface Message {
  _id: string;
  senderId: User;
  receiverId?: User;
  roomId?: string;
  content: string;
  messageType: 'personal' | 'group';
  readBy: string[];
  deliveredTo: string[];
  createdAt: string;
}

interface ChatWindowProps {
  chat: {
    type: 'personal' | 'group';
    id: string;
    name: string;
  };
  currentUser: User;
}

export default function ChatWindow({ chat, currentUser }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    loadMessages();
    setupSocketListeners();
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [chat.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    setIsLoading(true);
    try {
      const response = chat.type === 'personal' 
        ? await chatsAPI.getPersonalMessages(chat.id)
        : await chatsAPI.getRoomMessages(chat.id);
      
      setMessages(response.data);
    } catch (error) {
      toast.error('Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  };

  const setupSocketListeners = () => {
    socketService.onMessageReceived((message: Message) => {
      if (
        (chat.type === 'personal' && 
         (message.senderId._id === chat.id || message.receiverId?._id === chat.id)) ||
        (chat.type === 'group' && message.roomId === chat.id)
      ) {
        setMessages(prev => [...prev, message]);
        
        // Mark message as read if it's not from current user
        if (message.senderId._id !== currentUser._id) {
          socketService.markMessageAsRead(message._id);
        }
      }
    });

    socketService.onTypingStart((data) => {
      if (data.userId !== currentUser._id) {
        setTypingUsers(prev => new Set([...prev, data.userId]));
      }
    });

    socketService.onTypingStop((data) => {
      if (data.userId !== currentUser._id) {
        setTypingUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(data.userId);
          return newSet;
        });
      }
    });

    socketService.onMessageError((data) => {
      toast.error(data.error);
    });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageContent = newMessage.trim();
    setNewMessage('');

    try {
      if (chat.type === 'personal') {
        socketService.sendPersonalMessage(messageContent, chat.id);
      } else {
        socketService.sendGroupMessage(messageContent, chat.id);
      }

      // Stop typing indicator
      setIsTyping(false);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);

    if (!isTyping) {
      setIsTyping(true);
      if (chat.type === 'personal') {
        socketService.startTyping(chat.id);
      } else {
        socketService.startTyping(undefined, chat.id);
      }
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      if (chat.type === 'personal') {
        socketService.stopTyping(chat.id);
      } else {
        socketService.stopTyping(undefined, chat.id);
      }
    }, 1000);
  };

  const isOwnMessage = (message: Message) => {
    return message.senderId._id === currentUser._id;
  };

  const renderMessage = (message: Message) => {
    const isOwn = isOwnMessage(message);

    return (
      <div
        key={message._id}
        className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}
      >
        <div className={`flex ${isOwn ? 'flex-row-reverse' : 'flex-row'} items-end max-w-xs lg:max-w-md`}>
          {!isOwn && (
            <img
              src={message.senderId.avatarUrl || generateAvatarUrl(message.senderId.displayName)}
              alt={message.senderId.displayName}
              className="w-8 h-8 rounded-full ml-2"
            />
          )}
          <div className={`px-4 py-2 rounded-lg ${
            isOwn 
              ? 'bg-primary-600 text-white' 
              : 'bg-gray-200 text-gray-900'
          }`}>
            {!isOwn && (
              <p className="text-xs font-medium mb-1 text-gray-600">
                {message.senderId.displayName}
              </p>
            )}
            <p className="text-sm">{message.content}</p>
            <p className={`text-xs mt-1 ${
              isOwn ? 'text-primary-100' : 'text-gray-500'
            }`}>
              {formatTime(message.createdAt)}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <span className="text-primary-600 font-medium">
                {chat.type === 'personal' ? chat.name.charAt(0) : '#'}
              </span>
            </div>
            <div className="ml-3">
              <h2 className="text-lg font-medium text-gray-900">{chat.name}</h2>
              <p className="text-sm text-gray-500">
                {chat.type === 'personal' ? 'Direct message' : 'Group chat'}
              </p>
            </div>
          </div>
          <button className="p-2 hover:bg-gray-100 rounded-lg">
            <MoreVertical className="h-5 w-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-gray-500">No messages yet</p>
              <p className="text-sm text-gray-400">Start the conversation!</p>
            </div>
          </div>
        ) : (
          <div>
            {messages.map(renderMessage)}
            {typingUsers.size > 0 && (
              <div className="flex justify-start mb-4">
                <div className="bg-gray-200 px-4 py-2 rounded-lg">
                  <p className="text-sm text-gray-600 italic">
                    {Array.from(typingUsers).join(', ')} typing...
                  </p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={handleTyping}
            placeholder={`Message ${chat.name}...`}
            className="flex-1 input"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="btn btn-primary px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
