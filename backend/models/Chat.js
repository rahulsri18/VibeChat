const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    default: ''
  },
  isGroup: {
    type: Boolean,
    default: false
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  avatarColor: {
    type: String,
    default: () => {
      const colors = [
        '#6B7280', '#3B82F6', '#10B981', 
        '#8B5CF6', '#EC4899', '#F59E0B'
      ];
      return colors[Math.floor(Math.random() * colors.length)];
    }
  }
}, { timestamps: true });

module.exports = mongoose.model('Chat', ChatSchema);
