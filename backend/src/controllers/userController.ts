import { Request, Response } from 'express';
import User from '../models/User';

interface AuthRequest extends Request {
  user?: any;
}

// @desc    Get all users
// @route   GET /api/users
// @access  Private
export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    const users = await User.find({ _id: { $ne: req.user.id } })
      .select('displayName avatarUrl isOnline lastSeen')
      .sort({ displayName: 1 });

    res.json(users);
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id)
      .select('displayName avatarUrl isOnline lastSeen');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get online users
// @route   GET /api/users/online
// @access  Private
export const getOnlineUsers = async (req: AuthRequest, res: Response) => {
  try {
    const users = await User.find({ 
      _id: { $ne: req.user.id },
      isOnline: true 
    })
      .select('displayName avatarUrl lastSeen')
      .sort({ lastSeen: -1 });

    res.json(users);
  } catch (error) {
    console.error('Get online users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
