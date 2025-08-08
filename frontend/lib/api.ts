import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data: { email: string; password: string; displayName: string }) =>
    api.post('/auth/register', data),
  
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  
  getMe: () => api.get('/auth/me'),
  
  updateProfile: (data: { displayName?: string; avatarUrl?: string }) =>
    api.put('/auth/profile', data),

  deleteProfile: () => api.delete('/auth/profile'),
};

// Users API
export const usersAPI = {
  getAll: () => api.get('/users'),
  getById: (id: string) => api.get(`/users/${id}`),
  getOnline: () => api.get('/users/online'),
};

// Chats API
export const chatsAPI = {
  getRooms: () => api.get('/chats/rooms'),
  createRoom: (data: { name: string; description?: string; memberIds?: string[] }) =>
    api.post('/chats/rooms', data),
  updateRoom: (id: string, data: { name?: string; description?: string }) =>
    api.put(`/chats/rooms/${id}`, data),
  deleteRoom: (id: string) => api.delete(`/chats/rooms/${id}`),
  getRoomMessages: (id: string, page = 1, limit = 50) =>
    api.get(`/chats/rooms/${id}/messages?page=${page}&limit=${limit}`),
  getPersonalMessages: (userId: string, page = 1, limit = 50) =>
    api.get(`/chats/personal/${userId}?page=${page}&limit=${limit}`),
  getChatHistory: () => api.get('/chats/history'),
};

export default api;
