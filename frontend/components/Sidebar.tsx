'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { usersAPI, chatsAPI } from '@/lib/api';
import { socketService } from '@/lib/socket';
import { 
  Users, 
  MessageCircle, 
  Plus, 
  LogOut, 
  Settings,
  User,
  Hash,
  Circle
} from 'lucide-react';
import Link from 'next/link';
import { cn, formatTime, generateAvatarUrl } from '@/lib/utils';

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

interface SidebarProps {
  user: User;
  selectedChat: { type: 'personal' | 'group'; id: string; name: string } | null;
  onChatSelect: (chat: { type: 'personal' | 'group'; id: string; name: string }) => void;
  onLogout: () => void;
}

export default function Sidebar({ user, selectedChat, onChatSelect, onLogout }: SidebarProps) {
  const [activeTab, setActiveTab] = useState<'personal' | 'groups'>('personal');
  const [users, setUsers] = useState<User[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [chatHistory, setChatHistory] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadData();
    setupSocketListeners();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [usersRes, roomsRes, historyRes] = await Promise.all([
        usersAPI.getAll(),
        chatsAPI.getRooms(),
        chatsAPI.getChatHistory()
      ]);

      setUsers(usersRes.data);
      setRooms(roomsRes.data);
      setChatHistory(historyRes.data);

      // Set online users
      const online = new Set<string>();
      usersRes.data.forEach((u: User) => {
        if (u.isOnline) online.add(u._id);
      });
      setOnlineUsers(online);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const setupSocketListeners = () => {
    socketService.onUserOnline((data) => {
      setOnlineUsers(prev => new Set([...prev, data.userId]));
    });

    socketService.onUserOffline((data) => {
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(data.userId);
        return newSet;
      });
    });
  };

  const handleUserClick = (selectedUser: User) => {
    onChatSelect({
      type: 'personal',
      id: selectedUser._id,
      name: selectedUser.displayName
    });
  };

  const handleRoomClick = (room: Room) => {
    onChatSelect({
      type: 'group',
      id: room._id,
      name: room.name
    });
  };

  const renderUserItem = (userItem: User) => {
    const isSelected = selectedChat?.type === 'personal' && selectedChat.id === userItem._id;
    const isOnline = onlineUsers.has(userItem._id);

    return (
      <div
        key={userItem._id}
        onClick={() => handleUserClick(userItem)}
        className={cn(
          'flex items-center p-3 cursor-pointer hover:bg-gray-100 transition-colors',
          isSelected && 'bg-primary-50 border-r-2 border-primary-600'
        )}
      >
        <div className="relative">
          <img
            src={userItem.avatarUrl || generateAvatarUrl(userItem.displayName)}
            alt={userItem.displayName}
            className="w-10 h-10 rounded-full"
          />
          {isOnline && (
            <Circle className="absolute -bottom-1 -right-1 h-3 w-3 text-green-500 fill-current" />
          )}
        </div>
        <div className="ml-3 flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {userItem.displayName}
          </p>
          <p className="text-xs text-gray-500 truncate">
            {isOnline ? 'Online' : `Last seen ${formatTime(userItem.lastSeen)}`}
          </p>
        </div>
      </div>
    );
  };

  const renderRoomItem = (room: Room) => {
    const isSelected = selectedChat?.type === 'group' && selectedChat.id === room._id;
    const onlineMembers = room.members.filter(member => onlineUsers.has(member._id)).length;

    return (
      <div
        key={room._id}
        onClick={() => handleRoomClick(room)}
        className={cn(
          'flex items-center p-3 cursor-pointer hover:bg-gray-100 transition-colors',
          isSelected && 'bg-primary-50 border-r-2 border-primary-600'
        )}
      >
        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
          <Hash className="h-5 w-5 text-primary-600" />
        </div>
        <div className="ml-3 flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {room.name}
          </p>
          <p className="text-xs text-gray-500 truncate">
            {onlineMembers} online • {room.members.length} members
          </p>
        </div>
        {room.createdBy?._id === user._id && (
          <div className="flex items-center space-x-1">
            <button
              className="p-1 hover:bg-gray-100 rounded text-xs"
              onClick={async (e) => {
                e.stopPropagation();
                const newName = prompt('Rename group', room.name);
                if (!newName) return;
                try {
                  const res = await chatsAPI.updateRoom(room._id, { name: newName });
                  setRooms(prev => prev.map(r => r._id === room._id ? res.data : r));
                } catch {
                  toast.error('Failed to rename room');
                }
              }}
            >
              Rename
            </button>
            <button
              className="p-1 hover:bg-gray-100 rounded text-xs text-red-600"
              onClick={async (e) => {
                e.stopPropagation();
                if (!confirm('Delete this room?')) return;
                try {
                  await chatsAPI.deleteRoom(room._id);
                  setRooms(prev => prev.filter(r => r._id !== room._id));
                } catch {
                  toast.error('Failed to delete room');
                }
              }}
            >
              Delete
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <img
              src={user.avatarUrl || generateAvatarUrl(user.displayName)}
              alt={user.displayName}
              className="w-8 h-8 rounded-full"
            />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">{user.displayName}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Link href="/settings" className="p-1 hover:bg-gray-100 rounded">
              <Settings className="h-4 w-4 text-gray-500" />
            </Link>
            <button onClick={onLogout} className="p-1 hover:bg-gray-100 rounded">
              <LogOut className="h-4 w-4 text-gray-500" />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('personal')}
          className={cn(
            'flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors',
            activeTab === 'personal'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          )}
        >
          <Users className="h-4 w-4 inline mr-2" />
          Personal
        </button>
        <button
          onClick={() => setActiveTab('groups')}
          className={cn(
            'flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors',
            activeTab === 'groups'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          )}
        >
          <MessageCircle className="h-4 w-4 inline mr-2" />
          Groups
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        ) : activeTab === 'personal' ? (
          <div>
            {/* Chat History */}
            {chatHistory.length > 0 && (
              <div className="p-3">
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                  Recent Chats
                </h3>
                {chatHistory.map(renderUserItem)}
              </div>
            )}
            
            {/* All Users */}
            <div className="p-3">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                All Users
              </h3>
              {users.map(renderUserItem)}
            </div>
          </div>
        ) : (
          <div className="p-3">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Your Groups
              </h3>
              <button className="p-1 hover:bg-gray-100 rounded" onClick={async () => {
                const name = prompt('Enter group name');
                if (!name) return;
                try {
                  const res = await chatsAPI.createRoom({ name });
                  setRooms(prev => [res.data, ...prev]);
                } catch {
                  toast.error('Failed to create room');
                }
              }}>
                <Plus className="h-4 w-4 text-gray-500" />
              </button>
            </div>
            {rooms.map(renderRoomItem)}
          </div>
        )}
      </div>
    </div>
  );
}
