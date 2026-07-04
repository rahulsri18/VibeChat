const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const User = require('./models/User');
const Chat = require('./models/Chat');
const Message = require('./models/Message');
const memoryDb = require('./memoryDb');
const { authMiddleware, socketAuthMiddleware } = require('./middleware/auth');

const app = express();
const server = http.createServer(app);

// Configure CORS
app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/chat-app';
let useMongo = true;

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected successfully');
  })
  .catch(err => {
    console.warn('\n================================================================');
    console.warn('⚠️ WARNING: Could not connect to MongoDB at ' + MONGODB_URI);
    console.warn('🔌 FALLBACK: Starting application in In-Memory Demo Mode.');
    console.warn('================================================================\n');
    useMongo = false;
  });

// --- REST API ROUTES ---

// Register Route
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    let user;
    if (mongoose.connection.readyState === 1 && useMongo) {
      const existingUser = await User.findOne({ username: username.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({ message: 'Username already taken' });
      }

      const newUser = new User({ username, password });
      await newUser.save();
      
      user = {
        id: newUser._id,
        username: newUser.username,
        avatarColor: newUser.avatarColor,
        status: newUser.status
      };
    } else {
      user = await memoryDb.registerUser(username, password);
    }

    const token = jwt.sign(
      { id: user.id || user._id, username: user.username },
      process.env.JWT_SECRET || 'super_secret_key_987654321_chat_app',
      { expiresIn: '7d' }
    );

    res.status(201).json({ token, user });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Registration failed' });
  }
});

// Login Route
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    let user;
    if (mongoose.connection.readyState === 1 && useMongo) {
      const dbUser = await User.findOne({ username: username.toLowerCase() });
      if (!dbUser) {
        return res.status(400).json({ message: 'Invalid username or password' });
      }

      const isMatch = await dbUser.comparePassword(password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid username or password' });
      }

      dbUser.status = 'online';
      dbUser.lastActive = new Date();
      await dbUser.save();

      user = {
        id: dbUser._id,
        username: dbUser.username,
        avatarColor: dbUser.avatarColor,
        status: dbUser.status
      };
    } else {
      user = await memoryDb.loginUser(username, password);
    }

    const token = jwt.sign(
      { id: user.id || user._id, username: user.username },
      process.env.JWT_SECRET || 'super_secret_key_987654321_chat_app',
      { expiresIn: '7d' }
    );

    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Login failed' });
  }
});

// Google Sign-In / Sign-Up Route
app.post('/api/auth/google', async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ message: 'Google credential is required' });
    }

    // Safely parse Google ID Token payload
    const base64Url = credential.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(Buffer.from(base64, 'base64').toString().split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    const payload = JSON.parse(jsonPayload);
    const { email, name } = payload;

    if (!email) {
      return res.status(400).json({ message: 'Email not provided by Google' });
    }

    let user;
    if (mongoose.connection.readyState === 1 && useMongo) {
      let dbUser = await User.findOne({ email: email.toLowerCase() });
      
      if (!dbUser) {
        const baseUsername = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
        let targetUsername = baseUsername;
        let suffix = 1;
        while (await User.findOne({ username: targetUsername })) {
          targetUsername = `${baseUsername}${suffix}`;
          suffix++;
        }

        const bcrypt = require('bcryptjs');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(Math.random().toString(36), salt);

        dbUser = new User({
          username: targetUsername,
          email: email.toLowerCase(),
          password: hashedPassword,
          status: 'online',
          lastActive: new Date()
        });
        await dbUser.save();
      } else {
        dbUser.status = 'online';
        dbUser.lastActive = new Date();
        await dbUser.save();
      }

      user = {
        id: dbUser._id,
        username: dbUser.username,
        avatarColor: dbUser.avatarColor,
        status: dbUser.status
      };
    } else {
      const baseUsername = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      user = await memoryDb.findOrCreateGoogleUser(email, baseUsername);
    }

    const token = jwt.sign(
      { id: user.id || user._id, username: user.username },
      process.env.JWT_SECRET || 'super_secret_key_987654321_chat_app',
      { expiresIn: '7d' }
    );

    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Google Authentication failed' });
  }
});

// Get Current User Profile
app.get('/api/auth/me', authMiddleware, async (req, res) => {
  res.json({
    id: req.user.id,
    username: req.user.username,
    avatarColor: req.user.avatarColor,
    status: req.user.status
  });
});

// Get All Users (for starting a chat)
app.get('/api/users', authMiddleware, async (req, res) => {
  try {
    let usersList;
    if (mongoose.connection.readyState === 1 && useMongo) {
      usersList = await User.find({ _id: { $ne: req.user.id } })
        .select('username avatarColor status lastActive');
    } else {
      usersList = memoryDb.getUsersExcept(req.user.id);
    }
    res.json(usersList);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve users', error: error.message });
  }
});

// Get User's Chats (Direct and Groups)
app.get('/api/chats', authMiddleware, async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1 && useMongo) {
      const chats = await Chat.find({ participants: req.user.id })
        .populate('participants', 'username avatarColor status lastActive')
        .sort({ updatedAt: -1 });

      const chatsWithLastMessage = await Promise.all(chats.map(async (chat) => {
        const lastMessage = await Message.findOne({ chatId: chat._id })
          .populate('sender', 'username avatarColor')
          .sort({ createdAt: -1 });
        
        return {
          ...chat.toObject(),
          lastMessage: lastMessage ? {
            id: lastMessage._id,
            content: lastMessage.content,
            sender: {
              id: lastMessage.sender._id,
              username: lastMessage.sender.username,
              avatarColor: lastMessage.sender.avatarColor
            },
            createdAt: lastMessage.createdAt
          } : null
        };
      }));
      res.json(chatsWithLastMessage);
    } else {
      res.json(memoryDb.getChatsForUser(req.user.id));
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve chats', error: error.message });
  }
});

// Create Chat (Direct or Group)
app.post('/api/chats', authMiddleware, async (req, res) => {
  try {
    const { name, isGroup, participants } = req.body;

    if (!participants || !Array.isArray(participants) || participants.length === 0) {
      return res.status(400).json({ message: 'Participants are required' });
    }

    if (mongoose.connection.readyState === 1 && useMongo) {
      const userIds = [...new Set([...participants, req.user.id.toString()])];

      if (!isGroup) {
        if (userIds.length !== 2) {
          return res.status(400).json({ message: 'Direct chat must have exactly 2 participants' });
        }

        const existingChat = await Chat.findOne({
          isGroup: false,
          participants: { $all: userIds }
        }).populate('participants', 'username avatarColor status lastActive');

        if (existingChat) {
          const lastMessage = await Message.findOne({ chatId: existingChat._id })
            .populate('sender', 'username avatarColor')
            .sort({ createdAt: -1 });

          return res.json({
            ...existingChat.toObject(),
            lastMessage: lastMessage ? {
              id: lastMessage._id,
              content: lastMessage.content,
              sender: {
                id: lastMessage.sender._id,
                username: lastMessage.sender.username
              },
              createdAt: lastMessage.createdAt
            } : null
          });
        }
      }

      const chat = new Chat({
        name: isGroup ? name || 'Group Chat' : '',
        isGroup,
        participants: userIds,
        admin: isGroup ? req.user.id : undefined
      });

      await chat.save();
      
      const populatedChat = await Chat.findById(chat._id)
        .populate('participants', 'username avatarColor status lastActive');

      res.status(201).json(populatedChat);
    } else {
      const chat = memoryDb.createChat(isGroup, name, participants, req.user.id);
      res.status(201).json(chat);
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to create chat', error: error.message });
  }
});

// Get Message History for a Chat
app.get('/api/chats/:chatId/messages', authMiddleware, async (req, res) => {
  try {
    const { chatId } = req.params;

    if (mongoose.connection.readyState === 1 && useMongo) {
      const chat = await Chat.findOne({ _id: chatId, participants: req.user.id });
      if (!chat) {
        return res.status(403).json({ message: 'Access denied or chat not found' });
      }

      const messages = await Message.find({ chatId })
        .populate('sender', 'username avatarColor')
        .populate('reactions.user', 'username')
        .sort({ createdAt: 1 });

      const formattedMessages = messages.map(m => ({
        id: m._id,
        chatId: m.chatId,
        content: m.content,
        sender: {
          id: m.sender._id,
          username: m.sender.username,
          avatarColor: m.sender.avatarColor
        },
        reactions: (m.reactions || []).map(r => ({
          user: r.user ? { id: r.user._id, username: r.user.username } : null,
          emoji: r.emoji
        })),
        createdAt: m.createdAt
      }));

      res.json(formattedMessages);
    } else {
      res.json(memoryDb.getMessages(chatId, req.user.id));
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve message history', error: error.message });
  }
});


// --- WEBSOCKET EVENT HANDLING ---

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

io.use(socketAuthMiddleware);

const activeUsers = new Map();

io.on('connection', async (socket) => {
  const userId = socket.user.id;
  console.log(`User connected: ${socket.user.username} (${userId}) [Socket: ${socket.id}]`);

  if (!activeUsers.has(userId)) {
    activeUsers.set(userId, new Set());
  }
  activeUsers.get(userId).add(socket.id);

  if (activeUsers.get(userId).size === 1) {
    try {
      if (mongoose.connection.readyState === 1 && useMongo) {
        await User.findByIdAndUpdate(userId, { status: 'online', lastActive: new Date() });
      } else {
        memoryDb.updateStatus(userId, 'online');
      }
      socket.broadcast.emit('user:status-changed', {
        userId,
        status: 'online',
        lastActive: new Date()
      });
    } catch (err) {
      console.error('Error updating status on connection:', err);
    }
  }

  // Join rooms
  try {
    if (mongoose.connection.readyState === 1 && useMongo) {
      const chats = await Chat.find({ participants: socket.user.id });
      chats.forEach(chat => {
        socket.join(chat._id.toString());
      });
    } else {
      const userChats = memoryDb.getChatsForUser(userId);
      userChats.forEach(chat => {
        socket.join(chat._id.toString());
      });
    }
  } catch (err) {
    console.error('Error joining chat rooms for socket:', err);
  }

  socket.on('user:update-status', async ({ status }) => {
    if (!['online', 'away', 'offline'].includes(status)) return;
    try {
      if (mongoose.connection.readyState === 1 && useMongo) {
        await User.findByIdAndUpdate(userId, { status, lastActive: new Date() });
      } else {
        memoryDb.updateStatus(userId, status);
      }
      io.emit('user:status-changed', {
        userId,
        status,
        lastActive: new Date()
      });
    } catch (err) {
      console.error('Error updating status:', err);
    }
  });

  socket.on('chat:join-room', ({ chatId }) => {
    socket.join(chatId);
  });

  socket.on('message:send', async ({ chatId, content }) => {
    if (!content || !content.trim()) return;

    try {
      let populatedMessage;
      let participantIds = [];

      if (mongoose.connection.readyState === 1 && useMongo) {
        const chat = await Chat.findOne({ _id: chatId, participants: socket.user.id });
        if (!chat) {
          return socket.emit('error', { message: 'Cannot send message to this chat' });
        }

        const message = new Message({
          chatId,
          sender: socket.user.id,
          content: content.trim()
        });
        await message.save();

        await Chat.findByIdAndUpdate(chatId, { updatedAt: new Date() });

        populatedMessage = {
          id: message._id,
          chatId,
          content: message.content,
          sender: {
            id: socket.user.id,
            username: socket.user.username,
            avatarColor: socket.user.avatarColor
          },
          reactions: [],
          createdAt: message.createdAt
        };
        participantIds = chat.participants.map(p => p.toString());
      } else {
        const mockMsg = memoryDb.createMessage(chatId, userId, content);
        populatedMessage = {
          id: mockMsg.id,
          chatId,
          content: mockMsg.content,
          sender: mockMsg.sender,
          reactions: [],
          createdAt: mockMsg.createdAt
        };
        participantIds = mockMsg.chatParticipants;
      }

      io.to(chatId).emit('message:received', populatedMessage);

      participantIds.forEach(pId => {
        const idStr = pId.toString();
        if (idStr !== userId && activeUsers.has(idStr)) {
          activeUsers.get(idStr).forEach(sockId => {
            io.to(sockId).emit('chat:new-room-notification', { chatId });
          });
        }
      });

    } catch (err) {
      console.error('Error sending message:', err);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  socket.on('message:react', async ({ messageId, emoji }) => {
    if (!messageId || !emoji) return;

    try {
      let chatId;
      let updatedReactions = [];

      if (mongoose.connection.readyState === 1 && useMongo) {
        const msg = await Message.findById(messageId);
        if (!msg) return;

        chatId = msg.chatId.toString();

        // Validate user is participant of the chat
        const chat = await Chat.findOne({ _id: chatId, participants: socket.user.id });
        if (!chat) return;

        const existingReactionIndex = msg.reactions.findIndex(
          r => r.user.toString() === userId && r.emoji === emoji
        );

        if (existingReactionIndex > -1) {
          msg.reactions.splice(existingReactionIndex, 1);
        } else {
          msg.reactions.push({ user: socket.user.id, emoji });
        }

        await msg.save();

        const populatedMsg = await Message.findById(messageId).populate('reactions.user', 'username');
        updatedReactions = (populatedMsg.reactions || []).map(r => ({
          user: r.user ? { id: r.user._id, username: r.user.username } : null,
          emoji: r.emoji
        }));
      } else {
        const res = memoryDb.toggleReaction(messageId, userId, emoji);
        chatId = res.chatId;
        updatedReactions = res.reactions;
      }

      // Broadcast reaction update to the room
      io.to(chatId).emit('message:reaction-updated', {
        messageId,
        chatId,
        reactions: updatedReactions
      });
    } catch (err) {
      console.error('Error toggling reaction:', err);
    }
  });

  socket.on('chat:typing', ({ chatId, isTyping }) => {
    socket.to(chatId).emit('chat:typing', {
      chatId,
      userId,
      username: socket.user.username,
      isTyping
    });
  });

  socket.on('disconnect', async () => {
    const userSockets = activeUsers.get(userId);
    if (userSockets) {
      userSockets.delete(socket.id);
      
      if (userSockets.size === 0) {
        activeUsers.delete(userId);
        try {
          const lastActiveTime = new Date();
          if (mongoose.connection.readyState === 1 && useMongo) {
            await User.findByIdAndUpdate(userId, { status: 'offline', lastActive: lastActiveTime });
          } else {
            memoryDb.updateStatus(userId, 'offline');
          }
          io.emit('user:status-changed', {
            userId,
            status: 'offline',
            lastActive: lastActiveTime
          });
        } catch (err) {
          console.error('Error updating status on disconnect:', err);
        }
      }
    }
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
