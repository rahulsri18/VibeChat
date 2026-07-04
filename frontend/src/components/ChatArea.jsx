import React, { useState, useEffect, useRef } from 'react';
import { Send, Users, ShieldAlert, Smile, Info, Check, CheckCheck } from 'lucide-react';

export default function ChatArea({
  activeChat,
  currentUser,
  messages,
  typingUsers,
  onSendMessage,
  onTyping,
  onReact,
  isDetailsOpen,
  onToggleDetails
}) {
  const [inputText, setInputText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUsers]);

  // Close emoji picker on chat change
  useEffect(() => {
    setShowEmojiPicker(false);
  }, [activeChat?._id]);

  // Handle input change and typing notification
  const handleInputChange = (e) => {
    setInputText(e.target.value);
    onTyping(true);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      onTyping(false);
    }, 2000);
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    onSendMessage(inputText.trim());
    setInputText('');

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    onTyping(false);
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [activeChat?._id]);

  if (!activeChat) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 dark:bg-[#121214] transition-colors duration-300">
        <div className="text-center p-6 space-y-4 max-w-sm">
          <div className="w-16 h-16 bg-accent-50 dark:bg-accent-dark-bg text-accent-600 dark:text-accent-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <Users size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-105">
            Your Conversations
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Select a conversation from the sidebar or start a new chat to begin real-time messaging.
          </p>
        </div>
      </div>
    );
  }

  // Get active chat display info
  let chatName = '';
  let chatSubtitle = '';
  let chatAvatarColor = activeChat.avatarColor;

  if (activeChat.isGroup) {
    chatName = activeChat.name || 'Group Chat';
    chatSubtitle = `${activeChat.participants?.length || 0} members`;
  } else {
    const recipient = activeChat.participants?.find(p => p._id !== currentUser?.id);
    chatName = recipient?.username || 'Unknown User';
    chatSubtitle = recipient?.status || 'offline';
    chatAvatarColor = recipient?.avatarColor;
  }

  const activeTypers = (typingUsers[activeChat._id] || [])
    .filter(t => t.userId !== currentUser?.id);

  const presenceColors = {
    online: 'bg-emerald-500',
    away: 'bg-amber-500',
    offline: 'bg-slate-400'
  };

  const renderInitials = (name, color) => {
    const initials = name ? name.substring(0, 2).toUpperCase() : '??';
    return (
      <div 
        style={{ backgroundColor: color || 'var(--color-accent-600)' }} 
        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-inner"
      >
        {initials}
      </div>
    );
  };

  const formatMsgTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Date Divider label helper
  const getDayLabel = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' });
  };

  // Group Messages by Day and Inject Separators
  const renderMessageList = () => {
    const elements = [];
    let lastDateLabel = '';

    messages.forEach((msg) => {
      const dateLabel = getDayLabel(msg.createdAt);
      
      // Inject day divider if it changes
      if (dateLabel !== lastDateLabel) {
        elements.push(
          <div key={`divider-${msg.id || msg._id}`} className="flex justify-center my-6">
            <span className="text-[10px] bg-slate-200/60 dark:bg-zinc-950 px-3 py-1 rounded-full text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
              {dateLabel}
            </span>
          </div>
        );
        lastDateLabel = dateLabel;
      }

      const isMe = msg.sender?.id === currentUser?.id || msg.sender === currentUser?.id;
      const senderName = msg.sender?.username || 'Unknown';
      const senderColor = msg.sender?.avatarColor;

      elements.push(
        <div 
          key={msg.id || msg._id} 
          className={`flex gap-3 max-w-[75%] animate-message ${isMe ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
        >
          {!isMe && (
            <div className="shrink-0 self-end mb-1">
              {renderInitials(senderName, senderColor)}
            </div>
          )}
          
          <div className="relative group/bubble">
            {/* Reactions Hover Toolbar */}
            <div className={`absolute -top-8 hidden group-hover/bubble:flex items-center gap-1 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 px-2 py-0.5 rounded-full shadow-lg z-20 animate-message ${isMe ? 'left-0' : 'right-0'}`}>
              {['👍', '❤️', '😂', '😮', '😢', '🔥'].map(emoji => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => onReact(msg.id || msg._id, emoji)}
                  className="hover:scale-130 active:scale-95 transition-transform text-xs p-0.5 cursor-pointer"
                >
                  {emoji}
                </button>
              ))}
            </div>

            {!isMe && activeChat.isGroup && (
              <span className="text-[10px] text-slate-505 dark:text-slate-400 ml-2 mb-0.5 block capitalize">
                {senderName}
              </span>
            )}
            
            <div 
              className={`px-4 py-2.5 rounded-2xl text-sm break-words shadow-xs ${
                isMe 
                  ? 'bg-accent-600 text-white rounded-br-none font-medium' 
                  : 'bg-white dark:bg-zinc-955 text-slate-805 dark:text-slate-200 border border-slate-200/50 dark:border-zinc-900 rounded-bl-none'
              }`}
            >
              <p className="leading-relaxed">{msg.content}</p>
              
              <span className={`text-[9px] flex items-center justify-end gap-1 mt-1.5 ${isMe ? 'text-accent-100' : 'text-slate-400 dark:text-slate-400'}`}>
                {formatMsgTime(msg.createdAt)}
                {isMe && (
                  <span>
                    {!activeChat.isGroup && activeChat.participants?.find(p => p._id !== currentUser?.id)?.status === 'online' ? (
                      <CheckCheck size={11} className="text-emerald-350" style={{color: '#34d399'}} />
                    ) : (
                      <CheckCheck size={11} className="text-accent-100" />
                    )}
                  </span>
                )}
              </span>
            </div>

            {/* Display message reactions below bubble */}
            {msg.reactions && msg.reactions.length > 0 && (
              <div className={`flex flex-wrap gap-1 mt-1.5 ${isMe ? 'justify-end' : 'justify-start'}`}>
                {Object.entries(
                  msg.reactions.reduce((acc, r) => {
                    acc[r.emoji] = (acc[r.emoji] || 0) + 1;
                    return acc;
                  }, {})
                ).map(([emoji, count]) => (
                  <button
                    key={emoji}
                    onClick={() => onReact(msg.id || msg._id, emoji)}
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-white dark:bg-zinc-950 border border-slate-200/60 dark:border-zinc-800 rounded-full text-[10px] hover:bg-accent-50 dark:hover:bg-accent-dark-bg transition-all cursor-pointer font-semibold shadow-xs"
                  >
                    <span>{emoji}</span>
                    <span className="text-slate-450 dark:text-slate-450 text-[9px]">{count}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    });

    return elements;
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-[#121214] transition-colors duration-300 relative">
      {/* Chat Header */}
      <div className="px-6 py-4 bg-white dark:bg-zinc-950 border-b border-slate-200 dark:border-zinc-900 flex items-center justify-between z-10 transition-colors">
        <div className="flex items-center gap-3">
          {activeChat.isGroup ? (
            <div 
              style={{ backgroundColor: chatAvatarColor || 'var(--color-accent-600)' }} 
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold shadow-inner"
            >
              <Users size={16} />
            </div>
          ) : (
            renderInitials(chatName, chatAvatarColor)
          )}
          
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white capitalize text-sm">
              {chatName}
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              {!activeChat.isGroup && (
                <span className={`w-2 h-2 rounded-full ${presenceColors[chatSubtitle] || 'bg-slate-400'} ${chatSubtitle === 'online' ? 'presence-pulse' : ''}`}></span>
              )}
              <span className="text-[10px] font-medium text-slate-505 dark:text-slate-400 capitalize">
                {chatSubtitle}
              </span>
            </div>
          </div>
        </div>

        {/* Toggle Details Button */}
        <button 
          onClick={onToggleDetails}
          className={`p-2 rounded-xl transition-colors cursor-pointer ${
            isDetailsOpen 
              ? 'bg-accent-50 dark:bg-accent-dark-bg text-accent-600 dark:text-accent-400 font-semibold' 
              : 'text-slate-505 hover:bg-slate-100 dark:hover:bg-zinc-900'
          }`}
          title="Chat Info"
        >
          <Info size={18} />
        </button>
      </div>

      {/* Messages Pane */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-600">
            <span className="text-xs">Send a message to start the conversation</span>
          </div>
        ) : (
          renderMessageList()
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Typing Status / Input Area */}
      <div className="p-4 bg-white dark:bg-zinc-955 border-t border-slate-200 dark:border-zinc-900 transition-colors relative">
        
        {/* Floating Emoji Picker Popover */}
        {showEmojiPicker && (
          <div className="absolute bottom-20 right-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-2.5 rounded-2xl shadow-2xl z-50 grid grid-cols-5 gap-2.5 animate-message">
            {['😀', '😂', '❤️', '👍', '🎉', '🔥', '🚀', '👀', '😮', '😢'].map(emoji => (
              <button
                key={emoji}
                type="button"
                onClick={() => {
                  setInputText(prev => prev + emoji);
                  setShowEmojiPicker(false);
                }}
                className="text-lg hover:scale-125 active:scale-95 transition-transform p-1 cursor-pointer"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        {/* Typing Indicators overlay */}
        <div className="h-6 -mt-3 mb-1 pl-2 text-xs text-slate-500 dark:text-slate-400 italic">
          {activeTypers.length > 0 && (
            <div className="flex items-center gap-1.5 animate-pulse">
              <span className="capitalize">
                {activeTypers.map(t => t.username).join(', ')} 
                {activeTypers.length === 1 ? ' is ' : ' are '} typing
              </span>
              <span className="flex gap-0.5">
                <span className="w-1 h-1 bg-slate-500 dark:bg-slate-400 rounded-full animate-bounce"></span>
                <span className="w-1 h-1 bg-slate-500 dark:bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1 h-1 bg-slate-500 dark:bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </span>
            </div>
          )}
        </div>

        <form onSubmit={handleSend} className="flex gap-2">
          {/* Emoji Toggle Button */}
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
              showEmojiPicker 
                ? 'bg-accent-50 dark:bg-accent-dark-bg border-accent-500/20 dark:border-accent-ring text-accent-600' 
                : 'bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-slate-400 hover:bg-slate-105'
            }`}
          >
            <Smile size={18} />
          </button>

          <input
            type="text"
            placeholder="Type a message..."
            value={inputText}
            onChange={handleInputChange}
            className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-805 dark:text-slate-200 placeholder-slate-400 text-sm focus:outline-hidden focus:ring-2 focus:ring-accent-500/40 focus:border-accent-500 transition-all"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-3 bg-accent-600 hover:bg-accent-700 disabled:bg-slate-200 dark:disabled:bg-slate-900 text-white disabled:text-slate-400 dark:disabled:text-slate-650 rounded-xl shadow-md shadow-accent-600/10 dark:shadow-none hover:shadow-accent-600/20 active:scale-98 transition-all cursor-pointer flex items-center justify-center shrink-0"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
