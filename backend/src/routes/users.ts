import express from 'express';
import { getAllUsers, getUserById, getOnlineUsers } from '../controllers/userController';
import { auth } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(auth);

// @route   GET /api/users
// @desc    Get all users
// @access  Private
router.get('/', getAllUsers);

// @route   GET /api/users/online
// @desc    Get online users
// @access  Private
router.get('/online', getOnlineUsers);

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private
router.get('/:id', getUserById);

export default router;
