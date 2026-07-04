const bcrypt = require('bcryptjs');

// In-memory data structures
const users = [];
const chats = [];
const messages = [];

// Helper to generate mock ObjectIds
const generateId = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

const registerUser = async (username, password) => {
  const normUsername = username.trim().toLowerCase();
  const existing = users.find(u => u.username === normUsername);
  if (existing) {
    throw new Error('Username already taken');
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const colors = [
    '#EF4444', '#F97316', '#F59E0B', '#10B981', 
    '#06B6D4', '#3B82F6', '#6366F1', '#8B5CF6', 
    '#EC4899', '#14B8A6'
  ];
  const avatarColor = colors[Math.floor(Math.random() * colors.length)];

  const newUser = {
    _id: generateId(),
    username: normUsername,
    password: hashedPassword,
    avatarColor,
    status: 'online',
    lastActive: new Date(),
    createdAt: new Date()
  };

  users.push(newUser);
  return {
    id: newUser._id,
    username: newUser.username,
    avatarColor: newUser.avatarColor,
    status: newUser.status
  };
};

const loginUser = async (username, password) => {
  const normUsername = username.trim().toLowerCase();
  const user = users.find(u => u.username === normUsername);
  if (!user) {
    throw new Error('Invalid username or password');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Invalid username or password');
  }

  user.status = 'online';
  user.lastActive = new Date();

  return {
    id: user._id,
    username: user.username,
    avatarColor: user.avatarColor,
    status: user.status
  };
};

const getUserById = (id) => {
  const user = users.find(u => u._id === id);
  if (!user) return null;
  return {
    id: user._id,
    _id: user._id,
    username: user.username,
    avatarColor: user.avatarColor,
    status: user.status,
    lastActive: user.lastActive
  };
};

const getUsersExcept = (userId) => {
  return users
    .filter(u => u._id !== userId)
    .map(u => ({
      _id: u._id,
      username: u.username,
      avatarColor: u.avatarColor,
      status: u.status,
      lastActive: u.lastActive
    }));
};

const getChatsForUser = (userId) => {
  const userChats = chats.filter(c => c.participants.includes(userId));
  
  return userChats.map(c => {
    // Populate participants
    const populatedParticipants = c.participants.map(pId => {
      const u = users.find(user => user._id === pId);
      return u ? {
        _id: u._id,
        username: u.username,
        avatarColor: u.avatarColor,
        status: u.status,
        lastActive: u.lastActive
      } : { _id: pId, username: 'Unknown' };
    });

    // Populate last message
    const chatMsgs = messages.filter(m => m.chatId === c._id);
    const lastMsg = chatMsgs.length > 0 ? chatMsgs[chatMsgs.length - 1] : null;
    let populatedLastMsg = null;

    if (lastMsg) {
      const sender = users.find(u => u._id === lastMsg.senderId);
      populatedLastMsg = {
        id: lastMsg._id,
        content: lastMsg.content,
        sender: sender ? {
          id: sender._id,
          username: sender.username,
          avatarColor: sender.avatarColor
        } : { id: lastMsg.senderId, username: 'Unknown' },
        createdAt: lastMsg.createdAt
      };
    }

    return {
      _id: c._id,
      name: c.name,
      isGroup: c.isGroup,
      admin: c.admin,
      participants: populatedParticipants,
      lastMessage: populatedLastMsg,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt
    };
  }).sort((a, b) => b.updatedAt - a.updatedAt);
};

const createChat = (isGroup, name, participantIds, adminId) => {
  // Ensure current user is in participants
  const uniqueParticipants = [...new Set([...participantIds, adminId])];

  if (!isGroup) {
    // Check if direct chat already exists
    const existing = chats.find(c => 
      !c.isGroup && 
      c.participants.length === 2 && 
      uniqueParticipants.every(p => c.participants.includes(p))
    );

    if (existing) {
      // Find last message
      const chatMsgs = messages.filter(m => m.chatId === existing._id);
      const lastMsg = chatMsgs.length > 0 ? chatMsgs[chatMsgs.length - 1] : null;
      let populatedLastMsg = null;

      if (lastMsg) {
        const sender = users.find(u => u._id === lastMsg.senderId);
        populatedLastMsg = {
          id: lastMsg._id,
          content: lastMsg.content,
          sender: sender ? { id: sender._id, username: sender.username } : { id: lastMsg.senderId },
          createdAt: lastMsg.createdAt
        };
      }

      const populatedParticipants = existing.participants.map(pId => {
        const u = users.find(user => user._id === pId);
        return u ? {
          _id: u._id,
          username: u.username,
          avatarColor: u.avatarColor,
          status: u.status,
          lastActive: u.lastActive
        } : { _id: pId };
      });

      return {
        ...existing,
        participants: populatedParticipants,
        lastMessage: populatedLastMsg
      };
    }
  }

  const colors = ['#6B7280', '#3B82F6', '#10B981', '#8B5CF6', '#EC4899', '#F59E0B'];
  const avatarColor = colors[Math.floor(Math.random() * colors.length)];

  const newChat = {
    _id: generateId(),
    name: isGroup ? name || 'Group Chat' : '',
    isGroup,
    participants: uniqueParticipants,
    admin: isGroup ? adminId : undefined,
    avatarColor,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  chats.push(newChat);

  // Return populated
  const populatedParticipants = newChat.participants.map(pId => {
    const u = users.find(user => user._id === pId);
    return u ? {
      _id: u._id,
      username: u.username,
      avatarColor: u.avatarColor,
      status: u.status,
      lastActive: u.lastActive
    } : { _id: pId };
  });

  return {
    ...newChat,
    participants: populatedParticipants,
    lastMessage: null
  };
};

const populateReactions = (reacts) => {
  return (reacts || []).map(r => {
    const u = users.find(usr => usr._id === r.userId);
    return {
      user: u ? { id: u._id, username: u.username } : { id: r.userId, username: 'Unknown' },
      emoji: r.emoji
    };
  });
};

const getMessages = (chatId, userId) => {
  // Check if chat exists and user is participant
  const chat = chats.find(c => c._id === chatId && c.participants.includes(userId));
  if (!chat) return [];

  const chatMsgs = messages.filter(m => m.chatId === chatId);

  return chatMsgs.map(m => {
    const sender = users.find(u => u._id === m.senderId);
    return {
      id: m._id,
      chatId: m.chatId,
      content: m.content,
      sender: sender ? {
        id: sender._id,
        username: sender.username,
        avatarColor: sender.avatarColor
      } : { id: m.senderId, username: 'Unknown' },
      reactions: populateReactions(m.reactions),
      createdAt: m.createdAt
    };
  });
};

const createMessage = (chatId, senderId, content) => {
  const chat = chats.find(c => c._id === chatId && c.participants.includes(senderId));
  if (!chat) {
    throw new Error('Chat not found or access denied');
  }

  const newMsg = {
    _id: generateId(),
    chatId,
    senderId,
    content: content.trim(),
    reactions: [],
    createdAt: new Date()
  };

  messages.push(newMsg);
  chat.updatedAt = new Date();

  const sender = users.find(u => u._id === senderId);

  return {
    id: newMsg._id,
    chatId: newMsg.chatId,
    content: newMsg.content,
    sender: sender ? {
      id: sender._id,
      username: sender.username,
      avatarColor: sender.avatarColor
    } : { id: senderId },
    reactions: [],
    createdAt: newMsg.createdAt,
    chatParticipants: chat.participants // Return to help Socket notify
  };
};

const toggleReaction = (messageId, userId, emoji) => {
  const msg = messages.find(m => m._id === messageId);
  if (!msg) {
    throw new Error('Message not found');
  }

  if (!msg.reactions) {
    msg.reactions = [];
  }

  const existingIdx = msg.reactions.findIndex(r => r.userId === userId && r.emoji === emoji);
  if (existingIdx > -1) {
    // Remove reaction
    msg.reactions.splice(existingIdx, 1);
  } else {
    // Add reaction
    msg.reactions.push({ userId, emoji });
  }

  return {
    reactions: populateReactions(msg.reactions),
    chatId: msg.chatId
  };
};

const updateStatus = (userId, status) => {
  const user = users.find(u => u._id === userId);
  if (user) {
    user.status = status;
    user.lastActive = new Date();
    return {
      userId,
      status,
      lastActive: user.lastActive
    };
  }
  return null;
};

const findOrCreateGoogleUser = async (email, username, avatarColor) => {
  const normEmail = email.trim().toLowerCase();
  const normUsername = username.trim().toLowerCase();
  
  let user = users.find(u => u.email === normEmail || u.username === normUsername);
  
  if (!user) {
    let finalUsername = normUsername;
    let suffix = 1;
    while (users.find(u => u.username === finalUsername)) {
      finalUsername = `${normUsername}${suffix}`;
      suffix++;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(Math.random().toString(36), salt);

    user = {
      _id: generateId(),
      username: finalUsername,
      email: normEmail,
      password: hashedPassword,
      avatarColor: avatarColor || '#EF4444',
      status: 'online',
      lastActive: new Date(),
      createdAt: new Date()
    };
    users.push(user);
  }
  
  return {
    _id: user._id,
    id: user._id,
    username: user.username,
    email: user.email,
    avatarColor: user.avatarColor,
    status: user.status
  };
};

module.exports = {
  registerUser,
  loginUser,
  getUserById,
  getUsersExcept,
  getChatsForUser,
  createChat,
  getMessages,
  createMessage,
  toggleReaction,
  updateStatus,
  findOrCreateGoogleUser,
  users // export raw array for active tracking in sockets
};
