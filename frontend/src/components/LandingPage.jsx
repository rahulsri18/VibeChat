import React, { useState } from 'react';
import { 
  MessageSquare, Shield, Zap, Sparkles, Users, 
  ArrowRight, Globe, MessageCircle, Moon, Sun, Award, Palette
} from 'lucide-react';
import { themePresets } from '../App';

export default function LandingPage({ onNavigate, darkMode, onToggleTheme, isLoggedIn, themeAccent, onChangeAccent }) {
  const [showAccentPicker, setShowAccentPicker] = useState(false);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300 overflow-x-hidden relative">
      
      {/* Decorative Blur Background Blobs */}
      <div className="absolute top-20 left-1/4 w-72 h-72 bg-accent-500/10 dark:bg-accent-500/5 rounded-full blur-3xl animate-float-slow pointer-events-none"></div>
      <div className="absolute top-96 right-1/4 w-96 h-96 bg-accent-600/10 dark:bg-accent-600/5 rounded-full blur-3xl animate-float-medium pointer-events-none"></div>
      
      {/* Glass Sticky Navbar */}
      <header className="sticky top-0 w-full bg-white/60 dark:bg-slate-950/60 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-900/50 z-50 transition-colors">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl text-slate-900 dark:text-white">
            <div className="p-2 bg-accent-600 text-white rounded-xl shadow-md shadow-accent-600/20">
              <MessageSquare size={20} />
            </div>
            <span>VibeChat</span>
          </div>
  
          {/* Navigation Items */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-400">
            <button onClick={() => scrollToSection('home')} className="hover:text-accent-600 dark:hover:text-accent-500 transition-colors cursor-pointer">Home</button>
            <button onClick={() => scrollToSection('about')} className="hover:text-accent-600 dark:hover:text-accent-500 transition-colors cursor-pointer">About</button>
            <button onClick={() => scrollToSection('community')} className="hover:text-accent-600 dark:hover:text-accent-500 transition-colors cursor-pointer">Community</button>
            <button onClick={() => scrollToSection('contact')} className="hover:text-accent-600 dark:hover:text-accent-500 transition-colors cursor-pointer">Contact</button>
          </nav>

          {/* Theme & Auth CTA */}
          <div className="flex items-center gap-3">
            {/* Accent Color Theme Picker */}
            <div className="relative">
              <button 
                onClick={() => setShowAccentPicker(!showAccentPicker)}
                className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl transition-colors cursor-pointer"
                title="Change Color Theme"
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

            {/* Dark Mode switch */}
            <button 
              onClick={onToggleTheme}
              className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl transition-colors cursor-pointer mr-1"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            
            {isLoggedIn ? (
              <button 
                onClick={() => onNavigate('dashboard')}
                className="px-4 py-2 bg-accent-600 hover:bg-accent-700 text-white rounded-xl text-sm font-semibold shadow-lg active:scale-98 transition-all cursor-pointer"
              >
                Go to Dashboard
              </button>
            ) : (
              <>
                <button 
                  onClick={() => onNavigate('auth', 'login')} 
                  className="hidden sm:block text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-accent-600 dark:hover:text-accent-500 cursor-pointer"
                >
                  Sign In
                </button>
                
                <button 
                  onClick={() => onNavigate('auth', 'signup')}
                  className="px-4 py-2 bg-accent-600 hover:bg-accent-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-accent-600/10 active:scale-98 transition-all cursor-pointer"
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="home" className="max-w-7xl mx-auto px-6 py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center min-h-[calc(100vh-4rem)]">
        <div className="space-y-6 animate-message">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent-50 dark:bg-accent-dark-bg border border-accent-100 dark:border-accent-ring rounded-full text-accent-600 dark:text-accent-500 text-xs font-semibold">
            <Sparkles size={12} />
            <span>Introducing Real-Time WebSockets</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white leading-tight">
            Connect instantly with <span className="bg-linear-to-r from-accent-gradient-from to-accent-gradient-to bg-clip-text text-transparent">VibeChat</span>
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg max-w-lg leading-relaxed">
            Experience ultra-fast real-time direct and group messaging. Complete with active presence indicators, typing status, and an exquisite glassmorphic light/dark mode theme.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <button 
              onClick={() => onNavigate(isLoggedIn ? 'dashboard' : 'auth', 'signup')}
              className="px-6 py-3 bg-accent-600 hover:bg-accent-700 text-white font-semibold rounded-xl flex items-center gap-2 shadow-lg shadow-accent-600/20 hover:shadow-accent-600/30 active:scale-98 transition-all cursor-pointer"
            >
              {isLoggedIn ? 'Go to Dashboard' : 'Start Chatting Free'}
              <ArrowRight size={18} />
            </button>
            <button 
              onClick={() => scrollToSection('about')}
              className="px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-850 transition-all cursor-pointer"
            >
              Explore Features
            </button>
          </div>
        </div>

        {/* 3D Animated Illustration Pane */}
        <div className="flex justify-center items-center h-[350px] sm:h-[450px] perspective-1000">
          <div className="relative w-80 sm:w-96 animate-3d-scene preserve-3d">
            
            {/* Background Mesh Glow */}
            <div className="absolute -inset-4 bg-linear-to-tr from-accent-gradient-from to-accent-gradient-to rounded-3xl opacity-20 blur-2xl -z-10 transform translate-z-[-50px]"></div>
            
            {/* Back Card: Active Users */}
            <div className="absolute top-0 -left-6 w-56 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/80 p-4 rounded-2xl shadow-lg transform translate-z-[-20px] pointer-events-none">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Users Online</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 presence-pulse"></span>
              </div>
              <div className="space-y-2">
                {[
                  { name: 'Sarah Connor', color: '#10B981', status: 'online' },
                  { name: 'Bruce Wayne', color: '#F59E0B', status: 'away' },
                  { name: 'Clark Kent', color: '#3B82F6', status: 'online' }
                ].map((u, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full text-[10px] text-white flex items-center justify-center font-bold bg-accent-600">
                      {u.name.charAt(0)}
                    </div>
                    <span className="text-[10px] font-semibold text-slate-700 dark:text-slate-300">{u.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Front Card: Chat Screen (Floating Layer) */}
            <div className="w-full bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-4 sm:p-5 space-y-4 transform translate-z-[80px]">
              {/* Header */}
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                <span className="text-[11px] font-semibold text-slate-500 ml-2">Chat Room - Developers</span>
              </div>

              {/* Chat Thread */}
              <div className="space-y-2.5 py-1">
                <div className="bg-slate-100 dark:bg-slate-950 p-2.5 rounded-2xl rounded-bl-none text-[11px] max-w-[85%] border border-slate-200/20 dark:border-slate-800/40">
                  <p className="text-slate-700 dark:text-slate-300 font-medium">Wait, does Socket.io send indicators instantly?</p>
                </div>
                
                <div className="bg-accent-600 text-white p-2.5 rounded-2xl rounded-br-none text-[11px] max-w-[85%] ml-auto shadow-xs">
                  <p>Yes, presence updates and typing indicators take under 50ms!</p>
                </div>

                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 italic pt-1 animate-pulse">
                  <span>Emma Watson is typing</span>
                  <span className="flex gap-0.5">
                    <span className="w-0.5 h-0.5 bg-slate-400 rounded-full"></span>
                    <span className="w-0.5 h-0.5 bg-slate-400 rounded-full"></span>
                  </span>
                </div>
              </div>

              {/* Fake Input */}
              <div className="flex gap-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                <div className="flex-1 bg-slate-50 dark:bg-slate-950 h-7 rounded-lg"></div>
                <div className="w-7 h-7 bg-accent-600 rounded-lg flex items-center justify-center text-white">
                  <ArrowRight size={12} />
                </div>
              </div>
            </div>

            {/* Tiny Floating Element */}
            <div className="absolute -bottom-6 -right-6 bg-accent-500 text-white p-3 rounded-2xl shadow-xl transform translate-z-[120px] pointer-events-none hidden sm:block">
              <Award size={18} />
            </div>

          </div>
        </div>
      </section>

      {/* About / Features Section */}
      <section id="about" className="max-w-7xl mx-auto px-6 py-20 border-t border-slate-200/50 dark:border-slate-900/50">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            Designed for Instant Communication
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto text-sm sm:text-base">
            Powering chats with advanced socket capabilities and responsive visuals, packed into an optimized dark and light interface.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              icon: <Zap size={24} className="text-amber-500" />,
              title: 'Socket.io Engines',
              desc: 'High frequency data transfer. Message updates, uploads, and typing are delivered under 100ms.'
            },
            {
              icon: <Globe size={24} className="text-blue-500" />,
              title: 'Live Presence Dot',
              desc: 'Real-time status updates (Online, Away, Offline). Tracks user sessions across different devices.'
            },
            {
              icon: <Users size={24} className="text-emerald-500" />,
              title: 'Group Conversations',
              desc: 'Create group channels easily. Select multiple users, set group details, and converse together.'
            },
            {
              icon: <Shield size={24} className="text-accent-500" />,
              title: 'JWT Auth Security',
              desc: 'Restricts rooms and routes. Direct message threads and database entries are safeguarded by token headers.'
            }
          ].map((feat, idx) => (
            <div 
              key={idx}
              className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 p-6 rounded-2xl shadow-xs hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300 group cursor-pointer"
            >
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl w-fit mb-4 group-hover:bg-accent-50 dark:group-hover:bg-accent-dark-bg transition-colors">
                {feat.icon}
              </div>
              <h3 className="font-bold text-slate-800 dark:text-white text-base mb-2 group-hover:text-accent-600 dark:group-hover:text-accent-500 transition-colors">
                {feat.title}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm leading-relaxed">
                {feat.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Mock Community Section */}
      <section id="community" className="max-w-7xl mx-auto px-6 py-20 border-t border-slate-200/50 dark:border-slate-900/50 mb-10">
        <div className="bg-linear-to-br from-accent-600 to-accent-700 dark:from-slate-900 dark:to-accent-dark-bg rounded-3xl p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          
          {/* Subtle Grid Pattern Overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>

          <div className="space-y-4 max-w-lg z-10 text-center md:text-left">
            <h2 className="text-3xl font-extrabold tracking-tight">
              Ready to vibe with our community?
            </h2>
            <p className="text-accent-100 text-sm sm:text-base leading-relaxed">
              Connect with fellow developers, build private rooms, and exchange knowledge instantly. Register a free username in seconds.
            </p>
            
            {/* User Statistics Row */}
            <div className="flex flex-wrap justify-center md:justify-start gap-6 pt-4 text-xs font-semibold">
              <div>
                <span className="block text-xl font-bold">1.2k+</span>
                <span className="text-accent-100/90">Active Members</span>
              </div>
              <div className="w-px h-8 bg-accent-500/50 self-center"></div>
              <div>
                <span className="block text-xl font-bold">250k+</span>
                <span className="text-accent-100/90">Messages Sent</span>
              </div>
              <div className="w-px h-8 bg-accent-500/50 self-center"></div>
              <div>
                <span className="block text-xl font-bold">99.9%</span>
                <span className="text-accent-100/90">Socket Uptime</span>
              </div>
            </div>
          </div>

          <div className="z-10 shrink-0">
            <button 
              onClick={() => onNavigate(isLoggedIn ? 'dashboard' : 'auth', 'signup')}
              className="px-6 py-3.5 bg-white text-accent-600 hover:bg-slate-50 font-bold rounded-xl shadow-lg active:scale-98 transition-all cursor-pointer flex items-center gap-2 text-sm"
            >
              {isLoggedIn ? 'Open Dashboard' : 'Sign Up and Join'}
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* Contact Us Section */}
      <section id="contact" className="max-w-7xl mx-auto px-6 py-20 border-t border-slate-200/50 dark:border-slate-900/50">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Info Card */}
          <div className="space-y-6">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
              Get in Touch
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base leading-relaxed max-w-md">
              Have questions about our API, socket channels, or custom integration features? Drop us a message, and our developer support team will get back to you within 24 hours.
            </p>
            <div className="space-y-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-accent-50 dark:bg-accent-dark-bg text-accent-600 dark:text-accent-500 rounded-xl">
                  <Globe size={18} />
                </div>
                <span>support@vibechat.com</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-accent-50 dark:bg-accent-dark-bg text-accent-600 dark:text-accent-500 rounded-xl">
                  <MessageCircle size={18} />
                </div>
                <span>Developer Slack Workspace</span>
              </div>
            </div>
          </div>

          {/* Sleek Contact Form */}
          <form onSubmit={(e) => { e.preventDefault(); alert("Mock Message Sent! Thank you for contacting VibeChat."); }} className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 p-6 sm:p-8 rounded-3xl shadow-lg space-y-4 animate-message">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Your Email
              </label>
              <input
                type="email"
                required
                placeholder="dev@example.com"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 placeholder-slate-400 text-sm focus:outline-hidden focus:ring-2 focus:ring-accent-500/40 focus:border-accent-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Message
              </label>
              <textarea
                required
                rows={4}
                placeholder="Write your message here..."
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 placeholder-slate-400 text-sm focus:outline-hidden focus:ring-2 focus:ring-accent-500/40 focus:border-accent-500 transition-all resize-none"
              ></textarea>
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-accent-600 hover:bg-accent-700 text-white font-semibold rounded-xl shadow-md active:scale-98 transition-all cursor-pointer text-xs flex items-center justify-center gap-1.5"
            >
              Send Message
              <ArrowRight size={14} />
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-900 py-8 bg-white dark:bg-slate-950 text-center text-slate-400 dark:text-slate-600 text-xs transition-colors">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="font-semibold text-slate-600 dark:text-slate-400">
            VibeChat © 2026. All rights reserved.
          </div>
          <div className="flex gap-4">
            <button onClick={() => scrollToSection('home')} className="hover:underline cursor-pointer">Home</button>
            <button onClick={() => scrollToSection('contact')} className="hover:underline cursor-pointer">Contact</button>
            <a href="#" className="hover:underline">Privacy Policy</a>
            <a href="#" className="hover:underline">Terms of Service</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
