import React from 'react';
import { X, Users, Calendar, Info } from 'lucide-react';

export default function ChatDetails({ chat, currentUser, onClose }) {
  if (!chat) return null;

  // Format creation date
  const formatCreatedDate = (isoString) => {
    if (!isoString) return 'Unknown';
    const date = new Date(isoString);
    return date.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // Helper to render user initials avatar
  const renderInitials = (name, color) => {
    const initials = name ? name.substring(0, 2).toUpperCase() : '??';
    return (
      <div 
        style={{ backgroundColor: color || 'var(--color-accent-600)' }} 
        className="w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold text-xs shadow-inner"
      >
        {initials}
      </div>
    );
  };

  // Mappings for chat metadata
  let chatName = '';
  let chatAvatarColor = chat.avatarColor;
  let chatType = '';

  if (chat.isGroup) {
    chatName = chat.name || 'Group Chat';
    chatType = 'Group Channel';
  } else {
    const recipient = chat.participants?.find(p => p._id !== currentUser?.id);
    chatName = recipient?.username || 'Unknown User';
    chatAvatarColor = recipient?.avatarColor;
    chatType = 'Direct Message';
  }

  const presenceColors = {
    online: 'bg-emerald-500',
    away: 'bg-amber-500',
    offline: 'bg-slate-400'
  };

  return (
    <div className="w-64 border-l border-slate-200 dark:border-zinc-900 bg-white dark:bg-zinc-950 flex flex-col h-full z-10 transition-all animate-message">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-zinc-900 flex items-center justify-between">
        <h4 className="font-bold text-slate-800 dark:text-white flex items-center gap-1.5 text-xs uppercase tracking-wider">
          <Info size={14} className="text-accent-500" />
          Chat Details
        </h4>
        <button 
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
        >
          <X size={16} />
        </button>
      </div>

      {/* Profile Card */}
      <div className="p-6 flex flex-col items-center text-center border-b border-slate-200 dark:border-zinc-900 space-y-3">
        {chat.isGroup ? (
          <div 
            style={{ backgroundColor: chatAvatarColor || 'var(--color-accent-600)' }} 
            className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold shadow-md"
          >
            <Users size={28} />
          </div>
        ) : (
          <div className="text-xl">
            {renderInitials(chatName, chatAvatarColor)}
          </div>
        )}

        <div>
          <h3 className="font-bold text-slate-850 dark:text-white capitalize text-sm">
            {chatName}
          </h3>
          <span className="text-[10px] bg-slate-105 dark:bg-zinc-900 border border-slate-200/50 dark:border-zinc-800/80 px-2 py-0.5 rounded-full text-slate-505 dark:text-slate-400 font-semibold mt-1 inline-block">
            {chatType}
          </span>
        </div>

        <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400">
          <Calendar size={12} />
          <span>Created {formatCreatedDate(chat.createdAt)}</span>
        </div>
      </div>

      {/* Member / Participants list */}
      <div className="flex-1 overflow-y-auto p-4">
        <h5 className="font-bold text-[10px] uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
          <span>Members ({chat.participants?.length || 0})</span>
          <Users size={12} />
        </h5>
        
        <div className="space-y-3">
          {chat.participants?.map(user => {
            const isMe = user._id === currentUser?.id;
            const presence = user.status || 'offline';

            return (
              <div key={user._id} className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="relative shrink-0 scale-90">
                    {renderInitials(user.username, user.avatarColor)}
                    <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-zinc-950 ${presenceColors[presence]}`}></div>
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 capitalize truncate max-w-[100px] block">
                      {user.username} {isMe && <span className="text-[9px] text-slate-400 font-normal">(You)</span>}
                    </span>
                    <span className="text-[9px] text-slate-400 block capitalize">
                      {presence}
                    </span>
                  </div>
                </div>

                {chat.isGroup && chat.admin === user._id && (
                  <span className="text-[8px] bg-accent-50 dark:bg-accent-dark-bg text-accent-600 dark:text-accent-400 border border-accent-500/20 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                    Admin
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
