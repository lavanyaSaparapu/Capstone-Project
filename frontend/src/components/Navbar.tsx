import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Bell, Sun, Moon, LogOut, Database, User as UserIcon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const { user, logout, mockMode, toggleMockMode, notifications, clearNotifications } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showNotif, setShowNotif] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 w-full px-6 py-4 backdrop-blur-md bg-white/70 dark:bg-dark-950/60 border-b border-slate-200/50 dark:border-slate-800/40 transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-violet-500 flex items-center justify-center text-white font-bold text-lg shadow-glow-violet">
            N
          </div>
          <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300">
            NextGen <span className="text-brand-500 font-extrabold">ATS</span>
          </span>
        </Link>

        {/* Right Menu */}
        <div className="flex items-center gap-4">
          
          {/* Mock Mode Toggle */}
          <button 
            onClick={toggleMockMode}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-300 ${
              mockMode 
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-500 shadow-md shadow-amber-500/5' 
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500 shadow-md shadow-emerald-500/5'
            }`}
            title="Toggle offline mock database mode"
          >
            <Database className="w-3.5 h-3.5" />
            <span>{mockMode ? "Mock Database Active" : "Live Backend"}</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-dark-800 transition-colors"
          >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>

          {/* User Specific Icons */}
          {user && (
            <div className="relative">
              {/* Notification Bell */}
              <button
                onClick={() => setShowNotif(!showNotif)}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-dark-800 relative transition-colors"
              >
                <Bell className="w-5 h-5" />
                {notifications.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotif && (
                <div className="absolute right-0 mt-3 w-80 glass-card p-4 flex flex-col gap-3 animate-fade-in max-h-96 overflow-y-auto">
                  <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800/40 pb-2">
                    <span className="font-semibold text-sm">Notifications ({notifications.length})</span>
                    {notifications.length > 0 && (
                      <button 
                        onClick={clearNotifications}
                        className="text-xs text-rose-500 hover:underline"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    {notifications.length === 0 ? (
                      <div className="text-center text-xs text-slate-400 py-6">No new notifications.</div>
                    ) : (
                      notifications.map((notif) => (
                        <div 
                          key={notif.id}
                          className="p-2.5 rounded-xl bg-slate-50 dark:bg-dark-800/50 border border-slate-200/30 dark:border-slate-800/30 text-xs flex flex-col gap-1"
                        >
                          <div className="flex justify-between font-medium">
                            <span className="text-brand-500 dark:text-brand-400">{notif.type}</span>
                            <span className="text-[10px] text-slate-400">
                              {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{notif.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User Profile / Logout */}
          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex flex-col text-right hidden sm:flex">
                <span className="text-sm font-semibold">{user.full_name}</span>
                <span className="text-[11px] text-brand-500 font-medium">{user.role}</span>
              </div>
              <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-dark-800 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400">
                <UserIcon className="w-5 h-5" />
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-colors"
                title="Log out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="btn-secondary px-4 py-2 text-sm">
                Sign In
              </Link>
              <Link to="/register" className="btn-primary px-4 py-2 text-sm">
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
