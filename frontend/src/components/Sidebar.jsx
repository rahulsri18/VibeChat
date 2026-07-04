import React, { useState } from 'react';
import { 
  LogOut, Plus, Search, Users, Sun, Moon, Home, Palette,
  MessageSquare, UserCheck, X, Check, Activity, ShieldAlert
} from 'lucide-react';
import { themePresets } from '../App';

export default function Sidebar({
  currentUser,
  onLogout,
  chats,
  activeChat,
  onSelectChat,
  users,
  onUpdateStatus,
  darkMode,
  onToggleTheme,
  onCreateChat,
  onBackToHome,
  themeAccent,
  onChangeAccent
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isGroupCreate, setIsGroupCreate] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'direct' | 'groups'
  const [showAccentPicker, setShowAccentPicker] = useState(false);
  const [modalError, setModalError] = useState('');

  // Status mappings
  const statuses = [
    { value: 'online', label: 'Online', color: 'bg-emerald-500' },
    { value: 'away', label: 'Away', color: 'bg-amber-500' },
    { value: 'offline', label: 'Offline', color: 'bg-slate-400' }
  ];

  const currentStatusObj = statuses.find(s => s.value === currentUser?.status) || statuses[2];

  // Filter users based on search
  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter chats based on search & active tab
  const filteredChats = chats.filter(c => {
    // Tab filtering
    if (activeTab === 'direct' && c.isGroup) return false;
    if (activeTab === 'groups' && !c.isGroup) return false;

    // Search filtering
    if (c.isGroup) {
      return c.name.toLowerCase().includes(searchTerm.toLowerCase());
    } else {
      const recipient = c.participants.find(p => p._id !== currentUser?.id);
      return recipient?.username.toLowerCase().includes(searchTerm.toLowerCase());
    }
  });

  const handleUserToggle = (userId) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  const handleStartChat = async (user) => {
    await onCreateChat({
      isGroup: false,
      participants: [user._id]
    });
    setShowModal(false);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setIsGroupCreate(false);
    setGroupName('');
    setSelectedUsers([]);
    setModalError('');
  };

  const handleStartGroup = async () => {
    setModalError('');
    if (!groupName.trim()) {
      setModalError('Please enter a group name.');
      return;
    }
    if (selectedUsers.length === 0) {
      setModalError('Please select at least one participant.');
      return;
    }

    try {
      await onCreateChat({
        isGroup: true,
        name: groupName.trim(),
        participants: selectedUsers
      });
      handleCloseModal();
    } catch (err) {
      setModalError('Failed to create group. Please check connection.');
    }
  };

  const formatTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const renderInitials = (name, color) => {
    const initials = name ? name.substring(0, 2).toUpperCase() : '??';
    return (
      <div 
        style={{ backgroundColor: color || 'var(--color-accent-600)' }} 
        className="w-11 h-11 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-inner"
      >
        {initials}
      </div>
    );
  };

  return (
    <div className="w-80 h-full bg-white dark:bg-zinc-950 border-r border-slate-200 dark:border-zinc-900 flex flex-col transition-colors duration-300 shrink-0">
      
      {/* Sidebar Profile Header */}
      <div className="p-4 border-b border-slate-200 dark:border-zinc-900 flex items-center justify-between bg-slate-55/50 dark:bg-zinc-955/20">
        <div className="flex items-center gap-3">
          <div className="relative">
            {renderInitials(currentUser?.username, currentUser?.avatarColor)}
            
            {/* Status Dropdown Indicator Trigger */}
            <button 
              onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
              className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white dark:border-zinc-955 bg-slate-100 dark:bg-zinc-900 flex items-center justify-center shadow-md cursor-pointer hover:scale-105 transition-transform animate-message"
              title="Change Status"
            >
              <div className={`w-2.5 h-2.5 rounded-full ${currentStatusObj.color}`}></div>
            </button>

            {/* Status Selector Dropdown */}
            {statusDropdownOpen && (
              <div className="absolute left-0 mt-2 w-32 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-xl z-50 py-1 overflow-hidden animate-message">
                {statuses.map(st => (
                  <button
                    key={st.value}
                    onClick={() => {
                      onUpdateStatus(st.value);
                      setStatusDropdownOpen(false);
                    }}
                    className="w-full px-3 py-1.5 text-xs text-left text-slate-700 dark:text-slate-350 hover:bg-slate-105 dark:hover:bg-zinc-800 flex items-center gap-2"
                  >
                    <span className={`w-2.5 h-2.5 rounded-full ${st.color}`}></span>
                    {st.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Accent Color Palette Picker */}
          <div className="relative">
            <button 
              onClick={() => setShowAccentPicker(!showAccentPicker)}
              className="p-2 text-slate-505 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
              title="Change Theme Color"
            >
              <Palette size={18} />
            </button>
            
            {showAccentPicker && (
              <div className="absolute right-0 mt-2 p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-850 rounded-xl shadow-xl z-50 flex gap-2 animate-message">
                {Object.entries(themePresets).map(([key, preset]) => (
                  <button
                    key={key}
                    onClick={() => {
                      onChangeAccent(key);
                      setShowAccentPicker(false);
                    }}
                    style={{ backgroundColor: preset.colorHex }}
                    className="w-5 h-5 rounded-full hover:scale-120 active:scale-95 transition-transform cursor-pointer border border-white/20 shadow-sm"
                    title={preset.name}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Back to Home Screen */}
          <button 
            onClick={onBackToHome}
            className="p-2 text-slate-505 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
            title="Go to Home Screen"
          >
            <Home size={18} />
          </button>

          {/* Light/Dark Toggle */}
          <button 
            onClick={onToggleTheme}
            className="p-2 text-slate-550 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
            title="Toggle theme"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          
          {/* Logout */}
          <button 
            onClick={onLogout}
            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors cursor-pointer"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {/* Search and Action */}
      <div className="p-3 space-y-2 border-b border-slate-200 dark:border-zinc-900">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Search chats..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-slate-100 dark:bg-zinc-900 border border-transparent dark:border-transparent rounded-lg text-slate-800 dark:text-slate-200 placeholder-slate-400 text-xs focus:outline-hidden focus:ring-1 focus:ring-accent-500"
          />
        </div>
        
        <button 
          onClick={() => setShowModal(true)}
          className="w-full py-1.5 px-3 bg-accent-600 hover:bg-accent-700 text-white font-medium rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-md shadow-accent-600/10 active:scale-98 transition-all cursor-pointer"
        >
          <Plus size={14} />
          New Conversation
        </button>

        {/* Tabs for filtering chats */}
        <div className="flex gap-1 bg-slate-100 dark:bg-zinc-900 p-0.5 rounded-lg text-[10px] font-bold uppercase">
          {['all', 'direct', 'groups'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-1 rounded-md transition-all cursor-pointer ${
                activeTab === tab 
                  ? 'bg-white dark:bg-zinc-800 text-accent-600 dark:text-accent-400 shadow-xs font-bold' 
                  : 'text-slate-505 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filteredChats.length === 0 ? (
          <div className="text-center text-slate-400 dark:text-slate-600 py-8 text-xs">
            No conversations found
          </div>
        ) : (
          filteredChats.map(chat => {
            const isSelected = activeChat?._id === chat._id;
            let displayName = '';
            let avatarColor = chat.avatarColor;
            let displayPresence = null;

            if (chat.isGroup) {
              displayName = chat.name || 'Group Chat';
            } else {
              const recipient = chat.participants.find(p => p._id !== currentUser?.id);
              displayName = recipient?.username || 'Unknown User';
              avatarColor = recipient?.avatarColor;
              displayPresence = recipient?.status;
            }

            const lastMsgContent = chat.lastMessage?.content || 'No messages yet';
            const lastMsgTime = formatTime(chat.lastMessage?.createdAt || chat.updatedAt);

            const presenceColors = {
              online: 'bg-emerald-500',
              away: 'bg-amber-500',
              offline: 'bg-slate-400'
            };

            return (
              <button
                key={chat._id}
                onClick={() => onSelectChat(chat)}
                className={`w-full text-left p-3 rounded-xl flex items-start gap-3 transition-all cursor-pointer ${
                  isSelected 
                    ? 'bg-accent-50 dark:bg-accent-dark-bg text-slate-805 dark:text-white ring-1 ring-accent-ring' 
                    : 'text-slate-605 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-zinc-900/60'
                }`}
              >
                <div className="relative shrink-0">
                  {chat.isGroup ? (
                    <div 
                      style={{ backgroundColor: avatarColor || 'var(--color-accent-600)' }} 
                      className="w-11 h-11 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-inner"
                    >
                      <Users size={18} />
                    </div>
                  ) : (
                    renderInitials(displayName, avatarColor)
                  )}
                  {!chat.isGroup && displayPresence && (
                    <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-zinc-950 ${presenceColors[displayPresence]} ${displayPresence === 'online' ? 'presence-pulse' : ''}`}></div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <span className={`font-semibold capitalize truncate text-sm ${isSelected ? 'text-accent-700 dark:text-accent-400' : 'text-slate-800 dark:text-slate-200'}`}>
                      {displayName}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-505 shrink-0">
                      {lastMsgTime}
                    </span>
                  </div>
                  <p className={`text-xs truncate pr-2 ${isSelected ? 'text-accent-600 dark:text-accent-500' : 'text-slate-400 dark:text-slate-400'}`}>
                    {chat.lastMessage?.sender?.username ? (
                      <span className="capitalize">{chat.lastMessage.sender.username === currentUser?.username ? 'You' : chat.lastMessage.sender.username}: </span>
                    ) : ''}
                    {lastMsgContent}
                  </p>
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* New Chat Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800/80 rounded-2xl shadow-2xl overflow-hidden animate-message">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-100 dark:border-zinc-800 flex justify-between items-center bg-slate-50 dark:bg-zinc-900/50">
              <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                {isGroupCreate ? <Users size={18} className="text-accent-500" /> : <MessageSquare size={18} className="text-accent-500" />}
                {isGroupCreate ? 'Create Group Chat' : 'Start New Chat'}
              </h3>
              <button 
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-slate-650 dark:hover:text-slate-200"
              >
                <X size={18} />
              </button>
            </div>

            {/* Inline validation errors */}
            {modalError && (
              <div className="mx-4 mt-3 p-2.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-xl text-red-650 dark:text-red-400 text-xs flex items-center gap-1.5 animate-message">
                <ShieldAlert size={14} className="shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            {/* Modal Actions Switch */}
            {!isGroupCreate && (
              <div className="p-4 bg-accent-50 dark:bg-accent-dark-bg border-b border-accent-100/50 dark:border-accent-ring flex items-center justify-between">
                <span className="text-xs text-accent-700 dark:text-accent-300 font-medium">Want to chat with multiple people?</span>
                <button
                  onClick={() => setIsGroupCreate(true)}
                  className="px-2.5 py-1 bg-accent-600 hover:bg-accent-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 active:scale-98 transition-all cursor-pointer"
                >
                  <Users size={12} />
                  Create Group
                </button>
              </div>
            )}

            {/* Group Setup Panel */}
            {isGroupCreate && (
              <div className="p-4 border-b border-slate-100 dark:border-zinc-800 space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    Group Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter group chat name"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg text-slate-800 dark:text-slate-100 placeholder-slate-400 text-xs focus:outline-hidden focus:ring-1 focus:ring-accent-500"
                  />
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-505">Selected: {selectedUsers.length} users</span>
                  <button
                    onClick={() => setIsGroupCreate(false)}
                    className="text-slate-505 dark:text-slate-400 hover:underline"
                  >
                    Back to Single Chat
                  </button>
                </div>
              </div>
            )}

            {/* User Search & Selection List */}
            <div className="p-4 max-h-60 overflow-y-auto space-y-2">
              <div className="relative mb-3">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Search size={14} />
                </span>
                <input
                  type="text"
                  placeholder="Search user by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-4 py-1.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg text-slate-800 dark:text-slate-200 placeholder-slate-400 text-xs focus:outline-hidden focus:ring-1 focus:ring-accent-500"
                />
              </div>

              {filteredUsers.length === 0 ? (
                <div className="text-center text-slate-400 dark:text-slate-550 py-6 text-xs">
                  No users found
                </div>
              ) : (
                filteredUsers.map(user => {
                  const isChecked = selectedUsers.includes(user._id);
                  const presenceColors = {
                    online: 'bg-emerald-500',
                    away: 'bg-amber-500',
                    offline: 'bg-slate-400'
                  };

                  return (
                    <div
                      key={user._id}
                      onClick={() => {
                        if (isGroupCreate) {
                          handleUserToggle(user._id);
                        } else {
                          handleStartChat(user);
                        }
                      }}
                      className="flex items-center justify-between p-2 hover:bg-slate-50 dark:hover:bg-zinc-900 rounded-xl cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative shrink-0">
                          {renderInitials(user.username, user.avatarColor)}
                          <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-zinc-950 ${presenceColors[user.status || 'offline']}`}></div>
                        </div>
                        <div>
                          <span className="font-medium text-slate-800 dark:text-slate-200 text-sm capitalize">
                            {user.username}
                          </span>
                          <span className="text-[10px] text-slate-400 block capitalize">
                            {user.status || 'offline'}
                          </span>
                        </div>
                      </div>

                      {isGroupCreate && (
                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                          isChecked 
                            ? 'bg-accent-600 border-accent-600 text-white' 
                            : 'border-slate-300 dark:border-zinc-700 bg-transparent'
                        }`}>
                          {isChecked && <Check size={12} strokeWidth={3} />}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

             {/* Modal Action Buttons */}
            {isGroupCreate && (
              <div className="px-5 py-4 border-t border-slate-105 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/50 flex justify-end gap-2">
                <button
                  onClick={handleCloseModal}
                  className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-zinc-800 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStartGroup}
                  className="px-4 py-1.5 text-xs bg-accent-600 hover:bg-accent-700 text-white rounded-lg font-semibold shadow-md active:scale-98 transition-all cursor-pointer"
                >
                  Create Group ({selectedUsers.length})
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
