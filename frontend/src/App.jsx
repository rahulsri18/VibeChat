import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import Auth from './components/Auth';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import ChatDetails from './components/ChatDetails';
import { connectSocket, disconnectSocket, socket } from './socket';

export const themePresets = {
  latte: {
    name: 'Warm Latte',
    colorHex: '#7f5539',
    colors: {
      '--color-accent-50': '#faf7f0',
      '--color-accent-100': '#f0ebd8',
      '--color-accent-505': '#a27b5c',
      '--color-accent-500': '#a27b5c',
      '--color-accent-600': '#7f5539',
      '--color-accent-700': '#5c3d2e',
      '--color-accent-gradient-from': '#a27b5c',
      '--color-accent-gradient-to': '#5c3d2e',
      '--color-accent-dark-bg': 'rgba(127, 85, 57, 0.15)',
      '--color-accent-ring': 'rgba(127, 85, 57, 0.3)',
      '--color-accent-light-bg': '#faf7f0'
    }
  },
  indigo: {
    name: 'Default Indigo',
    colorHex: '#4f46e5',
    colors: {
      '--color-accent-50': '#f5f3ff',
      '--color-accent-100': '#ede9fe',
      '--color-accent-505': '#8b5cf6',
      '--color-accent-500': '#8b5cf6',
      '--color-accent-600': '#4f46e5',
      '--color-accent-700': '#4338ca',
      '--color-accent-gradient-from': '#4f46e5',
      '--color-accent-gradient-to': '#a855f7',
      '--color-accent-dark-bg': 'rgba(79, 70, 229, 0.15)',
      '--color-accent-ring': 'rgba(79, 70, 229, 0.3)',
      '--color-accent-light-bg': '#f5f3ff'
    }
  },
  amber: {
    name: 'Slate Amber',
    colorHex: '#d97706',
    colors: {
      '--color-accent-50': '#fffbeb',
      '--color-accent-100': '#fef3c7',
      '--color-accent-505': '#f59e0b',
      '--color-accent-500': '#f59e0b',
      '--color-accent-600': '#d97706',
      '--color-accent-700': '#b45309',
      '--color-accent-gradient-from': '#f59e0b',
      '--color-accent-gradient-to': '#ea580c',
      '--color-accent-dark-bg': 'rgba(217, 119, 6, 0.15)',
      '--color-accent-ring': 'rgba(217, 119, 6, 0.3)',
      '--color-accent-light-bg': '#fffbeb'
    }
  },
  cyan: {
    name: 'Cyber Cyan',
    colorHex: '#0891b2',
    colors: {
      '--color-accent-50': '#ecfeff',
      '--color-accent-100': '#cffafe',
      '--color-accent-505': '#06b6d4',
      '--color-accent-500': '#06b6d4',
      '--color-accent-600': '#0891b2',
      '--color-accent-700': '#0e7490',
      '--color-accent-gradient-from': '#06b6d4',
      '--color-accent-gradient-to': '#3b82f6',
      '--color-accent-dark-bg': 'rgba(8, 145, 178, 0.15)',
      '--color-accent-ring': 'rgba(8, 145, 178, 0.3)',
      '--color-accent-light-bg': '#ecfeff'
    }
  },
  rose: {
    name: 'Sunset Rose',
    colorHex: '#e11d48',
    colors: {
      '--color-accent-50': '#fff1f2',
      '--color-accent-100': '#ffe4e6',
      '--color-accent-505': '#f43f5e',
      '--color-accent-500': '#f43f5e',
      '--color-accent-600': '#e11d48',
      '--color-accent-700': '#be123c',
      '--color-accent-gradient-from': '#e11d48',
      '--color-accent-gradient-to': '#8b5cf6',
      '--color-accent-dark-bg': 'rgba(225, 29, 72, 0.15)',
      '--color-accent-ring': 'rgba(225, 29, 72, 0.3)',
      '--color-accent-light-bg': '#fff1f2'
    }
  },
  emerald: {
    name: 'Forest Emerald',
    colorHex: '#059669',
    colors: {
      '--color-accent-50': '#f0fdf4',
      '--color-accent-100': '#d1fae5',
      '--color-accent-505': '#10b981',
      '--color-accent-500': '#10b981',
      '--color-accent-600': '#059669',
      '--color-accent-700': '#047857',
      '--color-accent-gradient-from': '#059669',
      '--color-accent-gradient-to': '#14b8a6',
      '--color-accent-dark-bg': 'rgba(5, 150, 105, 0.15)',
      '--color-accent-ring': 'rgba(5, 150, 105, 0.3)',
      '--color-accent-light-bg': '#f0fdf4'
    }
  }
};

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  
  // Navigation states (synchronized with URL hash)
  const [view, setView] = useState(() => {
    const hash = window.location.hash.substring(1);
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      return hash === 'landing' ? 'landing' : 'dashboard';
    }
    return hash === 'auth' ? 'auth' : 'landing';
  });
  const [authTab, setAuthTab] = useState('login'); // 'login' | 'signup'

  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [typingUsers, setTypingUsers] = useState({});
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || 
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  const [themeAccent, setThemeAccent] = useState(() => {
    return localStorage.getItem('themeAccent') || 'latte';
  });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Apply dark mode theme class to HTML element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Apply theme accent CSS variables dynamically
  useEffect(() => {
    const preset = themePresets[themeAccent] || themePresets.indigo;
    Object.entries(preset.colors).forEach(([cssVar, colorVal]) => {
      document.documentElement.style.setProperty(cssVar, colorVal);
    });
    localStorage.setItem('themeAccent', themeAccent);
  }, [themeAccent]);

  // Synchronize history state on mount and monitor pops
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const initialView = savedToken ? (window.location.hash === '#landing' ? 'landing' : 'dashboard') : (window.location.hash === '#auth' ? 'auth' : 'landing');
    window.history.replaceState({ view: initialView, authTab }, '', `#${initialView}`);
  }, []);

  useEffect(() => {
    const handlePopState = (e) => {
      const state = e.state;
      if (state && state.view) {
        setView(state.view);
        if (state.authTab) setAuthTab(state.authTab);
      } else {
        const hash = window.location.hash.substring(1);
        if (hash === 'auth') {
          setView('auth');
        } else if (hash === 'dashboard' && token) {
          setView('dashboard');
        } else {
          setView('landing');
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [token]);

  // Fetch initial chats and users lists
  const fetchData = async (userToken) => {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userToken}`
    };

    try {
      const [chatsRes, usersRes] = await Promise.all([
        fetch(`${API_URL}/api/chats`, { headers }),
        fetch(`${API_URL}/api/users`, { headers })
      ]);

      if (chatsRes.ok && usersRes.ok) {
        const chatsData = await chatsRes.json();
        const usersData = await usersRes.json();
        setChats(chatsData);
        setUsers(usersData);
      } else if (chatsRes.status === 401 || usersRes.status === 401) {
        handleLogout();
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  // Fetch message history for a chosen chat
  const fetchMessages = async (chatId, userToken) => {
    try {
      const response = await fetch(`${API_URL}/api/chats/${chatId}/messages`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken || token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };

  // On mount/load, if token is valid, retrieve current details and load data
  useEffect(() => {
    if (token) {
      const verifyToken = async () => {
        try {
          const res = await fetch(`${API_URL}/api/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const userData = await res.json();
            setCurrentUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
            fetchData(token);
            connectSocket(token);
            
            // Redirect to dashboard if logged in and currently in auth screen
            if (view === 'auth') {
              navigateTo('dashboard');
            }
          } else {
            handleLogout();
          }
        } catch (err) {
          console.error('Token verification error:', err);
          connectSocket(token);
        }
      };
      verifyToken();
    }
    return () => {
      disconnectSocket();
    };
  }, [token]);

  // Socket event listener setup
  useEffect(() => {
    if (!socket) return;

    // Handle new incoming messages
    const handleMessageReceived = (message) => {
      if (activeChat && activeChat._id === message.chatId) {
        setMessages(prev => [...prev, message]);
      }

      setChats(prevChats => {
        const updated = prevChats.map(c => {
          if (c._id === message.chatId) {
            return { ...c, lastMessage: message, updatedAt: new Date().toISOString() };
          }
          return c;
        });
        return [...updated].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      });
    };

    // Handle typing notification
    const handleTyping = ({ chatId, userId, username, isTyping }) => {
      setTypingUsers(prev => {
        const chatTypers = prev[chatId] || [];
        if (isTyping) {
          if (!chatTypers.some(t => t.userId === userId)) {
            return {
              ...prev,
              [chatId]: [...chatTypers, { userId, username }]
            };
          }
        } else {
          return {
            ...prev,
            [chatId]: chatTypers.filter(t => t.userId !== userId)
          };
        }
        return prev;
      });
    };

    // Handle online/away/offline presence updates
    const handleStatusChanged = ({ userId, status, lastActive }) => {
      setUsers(prevUsers => 
        prevUsers.map(u => u._id === userId ? { ...u, status, lastActive } : u)
      );

      setChats(prevChats => 
        prevChats.map(c => ({
          ...c,
          participants: c.participants.map(p => 
            p._id === userId ? { ...p, status, lastActive } : p
          )
        }))
      );

      if (activeChat && !activeChat.isGroup) {
        const recipient = activeChat.participants.find(p => p._id === userId);
        if (recipient) {
          setActiveChat(prev => {
            if (!prev) return null;
            return {
              ...prev,
              participants: prev.participants.map(p => 
                p._id === userId ? { ...p, status, lastActive } : p
              )
            };
          });
        }
      }
    };

    const handleNewRoomNotification = ({ chatId }) => {
      socket.emit('chat:join-room', { chatId });
      fetchData(token);
    };

    const handleReactionUpdated = ({ messageId, chatId, reactions }) => {
      if (activeChat && activeChat._id === chatId) {
        setMessages(prev => 
          prev.map(m => (m.id === messageId || m._id === messageId) ? { ...m, reactions } : m)
        );
      }
    };

    socket.on('message:received', handleMessageReceived);
    socket.on('chat:typing', handleTyping);
    socket.on('user:status-changed', handleStatusChanged);
    socket.on('chat:new-room-notification', handleNewRoomNotification);
    socket.on('message:reaction-updated', handleReactionUpdated);

    return () => {
      if (socket) {
        socket.off('message:received', handleMessageReceived);
        socket.off('chat:typing', handleTyping);
        socket.off('user:status-changed', handleStatusChanged);
        socket.off('chat:new-room-notification', handleNewRoomNotification);
        socket.off('message:reaction-updated', handleReactionUpdated);
      }
    };
  }, [socket, activeChat, token]);

  const navigateTo = (newView, tab, replace = false) => {
    setView(newView);
    if (tab) setAuthTab(tab);
    if (replace) {
      window.history.replaceState({ view: newView, authTab: tab }, '', `#${newView}`);
    } else {
      window.history.pushState({ view: newView, authTab: tab }, '', `#${newView}`);
    }
  };

  const handleAuthSuccess = (newToken, user) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(user));
    setToken(newToken);
    setCurrentUser(user);
    navigateTo('dashboard', null, true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken('');
    setCurrentUser(null);
    setChats([]);
    setActiveChat(null);
    setMessages([]);
    setUsers([]);
    setTypingUsers({});
    navigateTo('landing');
    disconnectSocket();
  };

  const handleSelectChat = (chat) => {
    setActiveChat(chat);
    setMessages([]);
    fetchMessages(chat._id, token);
  };

  const handleUpdateStatus = (status) => {
    if (socket && socket.connected) {
      socket.emit('user:update-status', { status });
      setCurrentUser(prev => {
        const updated = { ...prev, status };
        localStorage.setItem('user', JSON.stringify(updated));
        return updated;
      });
    }
  };

  const handleSendMessage = (content) => {
    if (socket && socket.connected && activeChat) {
      socket.emit('message:send', { chatId: activeChat._id, content });
    }
  };

  const handleTypingNotification = (isTyping) => {
    if (socket && socket.connected && activeChat) {
      socket.emit('chat:typing', { chatId: activeChat._id, isTyping });
    }
  };

  const handleSendReaction = (messageId, emoji) => {
    if (socket && socket.connected) {
      socket.emit('message:react', { messageId, emoji });
    }
  };

  const handleCreateChat = async ({ isGroup, name, participants }) => {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    try {
      const response = await fetch(`${API_URL}/api/chats`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ isGroup, name, participants })
      });

      if (response.ok) {
        const newChat = await response.json();
        
        if (socket && socket.connected) {
          socket.emit('chat:join-room', { chatId: newChat._id });
        }

        setChats(prev => {
          if (prev.some(c => c._id === newChat._id)) return prev;
          return [newChat, ...prev];
        });
        
        handleSelectChat(newChat);
      }
    } catch (err) {
      console.error('Failed to create chat:', err);
    }
  };

  // If token is missing, render Landing Page or Auth Page
  // Routing views
  if (view === 'landing') {
    return (
      <LandingPage 
        isLoggedIn={!!token}
        onNavigate={navigateTo}
        darkMode={darkMode}
        onToggleTheme={() => setDarkMode(!darkMode)}
        themeAccent={themeAccent}
        onChangeAccent={setThemeAccent}
      />
    );
  }

  if (view === 'auth') {
    if (token) {
      navigateTo('dashboard');
      return null;
    }
    return (
      <Auth 
        onAuthSuccess={handleAuthSuccess}
        onBackToLanding={() => navigateTo('landing')}
        defaultTab={authTab}
      />
    );
  }

  // Redirect to landing if not logged in but requesting dashboard
  if (!token) {
    navigateTo('landing');
    return null;
  }

  // Render main dashboard once logged in
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 dark:bg-[#121214] transition-colors duration-300 text-slate-800 dark:text-slate-100">
      <Sidebar
        currentUser={currentUser}
        onLogout={handleLogout}
        chats={chats}
        activeChat={activeChat}
        onSelectChat={handleSelectChat}
        users={users}
        onUpdateStatus={handleUpdateStatus}
        darkMode={darkMode}
        onToggleTheme={() => setDarkMode(!darkMode)}
        onCreateChat={handleCreateChat}
        onBackToHome={() => navigateTo('landing')}
        themeAccent={themeAccent}
        onChangeAccent={setThemeAccent}
      />
      <ChatArea
        activeChat={activeChat}
        currentUser={currentUser}
        messages={messages}
        typingUsers={typingUsers}
        onSendMessage={handleSendMessage}
        onTyping={handleTypingNotification}
        onReact={handleSendReaction}
        isDetailsOpen={isDetailsOpen}
        onToggleDetails={() => setIsDetailsOpen(!isDetailsOpen)}
      />
      {activeChat && isDetailsOpen && (
        <ChatDetails
          chat={activeChat}
          currentUser={currentUser}
          onClose={() => setIsDetailsOpen(false)}
        />
      )}
    </div>
  );
}
