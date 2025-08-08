import express from 'express';
import { body } from 'express-validator';
import { register, login, getMe, updateProfile, deleteProfile } from '../controllers/authController';
import { auth } from '../middleware/auth';

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', [
  body('email', 'Please include a valid email').isEmail(),
  body('password', 'Password must be 6 or more characters').isLength({ min: 6 }),
  body('displayName', 'Display name is required').not().isEmpty()
], register);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
  body('email', 'Please include a valid email').isEmail(),
  body('password', 'Password is required').exists()
], login);

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, getMe);

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, [
  body('displayName', 'Display name is required').optional().not().isEmpty(),
  body('avatarUrl', 'Avatar URL must be valid').optional().isURL()
], updateProfile);

// @route   DELETE /api/auth/profile
// @desc    Delete user profile/account
// @access  Private
router.delete('/profile', auth, deleteProfile);

export default router;
