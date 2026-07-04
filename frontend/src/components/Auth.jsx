import React, { useState, useEffect } from 'react';
import { MessageSquare, ShieldAlert, Lock, User, RefreshCw, ArrowLeft } from 'lucide-react';

export default function Auth({ onAuthSuccess, onBackToLanding, defaultTab }) {
  const [isLogin, setIsLogin] = useState(defaultTab !== 'signup');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Update tab state if defaultTab changes
  useEffect(() => {
    setIsLogin(defaultTab !== 'signup');
  }, [defaultTab]);

  // Google Identity Services (GSI) Button Integration
  useEffect(() => {
    /* global google */
    if (typeof google !== 'undefined') {
      const isDark = document.documentElement.classList.contains('dark');
      
      google.accounts.id.initialize({
        client_id: "1032906371752-mockclientid.apps.googleusercontent.com", // Google Sign-In placeholder client ID
        callback: handleGoogleSignIn
      });

      google.accounts.id.renderButton(
        document.getElementById("googleBtn"),
        { 
          theme: isDark ? "filled_black" : "outline", 
          size: "large", 
          width: "382", 
          text: "continue_with",
          shape: "rectangular"
        }
      );
    }
  }, [isLogin]);

  const handleGoogleSignIn = async (response) => {
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ credential: response.credential }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Google authentication failed');
      }

      onAuthSuccess(data.token, data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validations
    if (!username.trim() || !password) {
      setError('All fields are required.');
      return;
    }

    if (username.length < 3) {
      setError('Username must be at least 3 characters.');
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      onAuthSuccess(data.token, data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-105 to-accent-50/20 dark:from-slate-955 dark:to-slate-900 px-4 transition-colors duration-300 relative">
      
      {/* Back to Home Button floating top-left */}
      <button 
        onClick={onBackToLanding}
        className="absolute top-6 left-6 flex items-center gap-2 px-3 py-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-805 rounded-xl text-slate-600 dark:text-slate-300 hover:text-accent-600 dark:hover:text-accent-505 font-medium text-xs hover:-translate-x-0.5 transition-all shadow-xs cursor-pointer"
      >
        <ArrowLeft size={14} />
        Back to Home
      </button>

      <div className="w-full max-w-md bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-2xl p-8 animate-message">
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-accent-500 text-white rounded-2xl shadow-lg shadow-accent-500/30 dark:shadow-accent-500/10 mb-4">
            <MessageSquare size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            {isLogin ? 'Sign in to access your chats' : 'Register to start real-time messaging'}
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm mb-6 animate-message">
            <ShieldAlert size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
              Username
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 dark:text-slate-505">
                <User size={18} />
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-55 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-accent-500/40 focus:border-accent-500 transition-all text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 dark:text-slate-550">
                <Lock size={18} />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-55 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-accent-500/40 focus:border-accent-500 transition-all text-sm"
              />
            </div>
          </div>

          {!isLogin && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 dark:text-slate-505">
                  <Lock size={18} />
                </span>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-55 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-accent-500/40 focus:border-accent-500 transition-all text-sm"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-accent-600 hover:bg-accent-700 text-white font-medium rounded-xl shadow-lg shadow-accent-600/20 dark:shadow-none hover:shadow-accent-600/30 active:scale-98 transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer mt-6"
          >
            {loading ? (
              <RefreshCw size={18} className="animate-spin" />
            ) : isLogin ? (
              'Sign In'
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* Or Divider */}
        <div className="relative my-6 flex items-center justify-center">
          <div className="absolute inset-x-0 border-t border-slate-200 dark:border-slate-800/80"></div>
          <span className="relative bg-white dark:bg-slate-900 px-3 text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">or</span>
        </div>

        {/* Google Sign-In Button */}
        <div id="googleBtnContainer" className="w-full flex justify-center">
          <div id="googleBtn" className="w-full"></div>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="text-accent-600 dark:text-accent-400 hover:underline text-sm font-medium focus:outline-hidden"
          >
            {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
          </button>
        </div>
      </div>
    </div>
  );
}
