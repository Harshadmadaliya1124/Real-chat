import express from 'express';
import { body } from 'express-validator';
import {
  getUserRooms,
  createRoom,
  updateRoom,
  deleteRoom,
  getRoomMessages,
  getPersonalMessages,
  getChatHistory
} from '../controllers/chatController';
import { auth } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(auth);

// Room routes
// @route   GET /api/chats/rooms
// @desc    Get user's rooms
// @access  Private
router.get('/rooms', getUserRooms);

// @route   POST /api/chats/rooms
// @desc    Create a new room
// @access  Private
router.post('/rooms', [
  body('name', 'Room name is required').not().isEmpty(),
  body('description', 'Description must be less than 500 characters').optional().isLength({ max: 500 })
], createRoom);

// @route   PUT /api/chats/rooms/:id
// @desc    Update room
// @access  Private
router.put('/rooms/:id', [
  body('name', 'Room name is required').optional().not().isEmpty(),
  body('description', 'Description must be less than 500 characters').optional().isLength({ max: 500 })
], updateRoom);

// @route   DELETE /api/chats/rooms/:id
// @desc    Delete room
// @access  Private
router.delete('/rooms/:id', deleteRoom);

// @route   GET /api/chats/rooms/:id/messages
// @desc    Get room messages
// @access  Private
router.get('/rooms/:id/messages', getRoomMessages);

// Personal chat routes
// @route   GET /api/chats/personal/:userId
// @desc    Get personal messages
// @access  Private
router.get('/personal/:userId', getPersonalMessages);

// @route   GET /api/chats/history
// @desc    Get chat history with users
// @access  Private
router.get('/history', getChatHistory);

export default router;
