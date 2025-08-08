import { Request, Response } from 'express';
import Message from '../models/Message';
import Room from '../models/Room';
import User from '../models/User';

interface AuthRequest extends Request {
  user?: any;
}

// @desc    Get user's rooms
// @route   GET /api/chats/rooms
// @access  Private
export const getUserRooms = async (req: AuthRequest, res: Response) => {
  try {
    const rooms = await Room.find({ 
      members: req.user.id,
      isActive: true 
    })
      .populate('createdBy', 'displayName avatarUrl')
      .populate('members', 'displayName avatarUrl isOnline')
      .sort({ updatedAt: -1 });

    res.json(rooms);
  } catch (error) {
    console.error('Get user rooms error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create a new room
// @route   POST /api/chats/rooms
// @access  Private
export const createRoom = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, memberIds } = req.body;

    const room = new Room({
      name,
      description,
      createdBy: req.user.id,
      members: memberIds ? [req.user.id, ...memberIds] : [req.user.id]
    });

    await room.save();

    const populatedRoom = await Room.findById(room._id)
      .populate('createdBy', 'displayName avatarUrl')
      .populate('members', 'displayName avatarUrl isOnline');

    res.status(201).json(populatedRoom);
  } catch (error) {
    console.error('Create room error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update room
// @route   PUT /api/chats/rooms/:id
// @access  Private
export const updateRoom = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description } = req.body;
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    if (room.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (name) room.name = name;
    if (description !== undefined) room.description = description;

    await room.save();

    const updatedRoom = await Room.findById(room._id)
      .populate('createdBy', 'displayName avatarUrl')
      .populate('members', 'displayName avatarUrl isOnline');

    res.json(updatedRoom);
  } catch (error) {
    console.error('Update room error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete room
// @route   DELETE /api/chats/rooms/:id
// @access  Private
export const deleteRoom = async (req: AuthRequest, res: Response) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    if (room.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    room.isActive = false;
    await room.save();

    res.json({ message: 'Room deleted' });
  } catch (error) {
    console.error('Delete room error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get room messages
// @route   GET /api/chats/rooms/:id/messages
// @access  Private
export const getRoomMessages = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // Check if user is member of the room
    const room = await Room.findById(req.params.id);
    if (!room || !room.members.includes(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const messages = await Message.find({ roomId: req.params.id })
      .populate('senderId', 'displayName avatarUrl')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json(messages.reverse());
  } catch (error) {
    console.error('Get room messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get personal messages
// @route   GET /api/chats/personal/:userId
// @access  Private
export const getPersonalMessages = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const otherUserId = req.params.userId;

    const messages = await Message.find({
      messageType: 'personal',
      $or: [
        { senderId: req.user.id, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: req.user.id }
      ]
    })
      .populate('senderId', 'displayName avatarUrl')
      .populate('receiverId', 'displayName avatarUrl')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json(messages.reverse());
  } catch (error) {
    console.error('Get personal messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get chat history with users
// @route   GET /api/chats/history
// @access  Private
export const getChatHistory = async (req: AuthRequest, res: Response) => {
  try {
    // Get users the current user has chatted with
    const personalMessages = await Message.find({
      messageType: 'personal',
      $or: [
        { senderId: req.user.id },
        { receiverId: req.user.id }
      ]
    }).distinct('senderId receiverId');

    const userIds = [...new Set(personalMessages.flat())].filter(
      id => id.toString() !== req.user.id
    );

    const users = await User.find({ _id: { $in: userIds } })
      .select('displayName avatarUrl isOnline lastSeen')
      .sort({ lastSeen: -1 });

    res.json(users);
  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
