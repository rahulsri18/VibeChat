const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const memoryDb = require('../memoryDb');

const verifyToken = (token) => {
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'super_secret_key_987654321_chat_app');
  } catch (err) {
    return null;
  }
};

// Express HTTP Middleware
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: 'Invalid or expired token.' });
    }

    let user;
    // Check if connected to MongoDB
    if (mongoose.connection.readyState === 1) {
      user = await User.findById(decoded.id).select('-password');
    } else {
      user = memoryDb.getUserById(decoded.id);
    }

    if (!user) {
      return res.status(401).json({ message: 'User no longer exists.' });
    }

    // Standardize object fields
    req.user = {
      _id: user._id || user.id,
      id: user._id || user.id,
      username: user.username,
      avatarColor: user.avatarColor,
      status: user.status
    };
    
    next();
  } catch (error) {
    return res.status(500).json({ message: 'Server authentication error', error: error.message });
  }
};

// Socket.io Middleware
const socketAuthMiddleware = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error. No token provided.'));
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return next(new Error('Authentication error. Invalid token.'));
    }

    let user;
    if (mongoose.connection.readyState === 1) {
      user = await User.findById(decoded.id).select('-password');
    } else {
      user = memoryDb.getUserById(decoded.id);
    }

    if (!user) {
      return next(new Error('Authentication error. User not found.'));
    }

    // Attach structured user
    socket.user = {
      _id: user._id || user.id,
      id: user._id || user.id,
      username: user.username,
      avatarColor: user.avatarColor,
      status: user.status
    };
    
    next();
  } catch (error) {
    next(new Error('Authentication error. Server failure.'));
  }
};

module.exports = {
  authMiddleware,
  socketAuthMiddleware,
  verifyToken
};
