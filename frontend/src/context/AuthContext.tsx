import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

export interface UserResponse {
  id: number;
  email: string;
  full_name: string;
  role: 'Admin' | 'Recruiter' | 'Candidate';
}

export interface AppNotification {
  id: string;
  type: string;
  message: string;
  timestamp: Date;
}

interface AuthContextType {
  user: UserResponse | null;
  token: string | null;
  isAuthenticated: boolean;
  mockMode: boolean;
  notifications: AppNotification[];
  login: (token: string, userData: UserResponse) => void;
  logout: () => void;
  toggleMockMode: () => void;
  addNotification: (type: string, message: string) => void;
  clearNotifications: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// API base configuration
export const API_BASE = "http://127.0.0.1:8000/api/v1";
export const WS_BASE = "ws://127.0.0.1:8000/ws";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserResponse | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('token');
  });

  const [mockMode, setMockMode] = useState<boolean>(() => {
    return localStorage.getItem('mockMode') === 'true';
  });

  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // Setup Axios Auth Header
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // WebSocket Connection
  useEffect(() => {
    if (!user || mockMode) return;

    let ws: WebSocket;
    const connectWs = () => {
      ws = new WebSocket(`${WS_BASE}/${user.id}`);
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data && data.message) {
            addNotification(data.type || "INFO", data.message);
          }
        } catch {
          // Plain text message fallback
          addNotification("WS_RAW", event.data);
        }
      };

      ws.onerror = (err) => {
        console.error("WebSocket connection error:", err);
      };

      ws.onclose = () => {
        // Try to reconnect in 5 seconds
        setTimeout(() => {
          if (user && !mockMode) {
            connectWs();
          }
        }, 5000);
      };
    };

    connectWs();
    return () => {
      if (ws) ws.close();
    };
  }, [user, mockMode]);

  const addNotification = (type: string, message: string) => {
    const newNotif: AppNotification = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      message,
      timestamp: new Date()
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const login = (jwtToken: string, userData: UserResponse) => {
    setToken(jwtToken);
    setUser(userData);
    localStorage.setItem('token', jwtToken);
    localStorage.setItem('user', JSON.stringify(userData));
    addNotification("SYSTEM", `Successfully logged in as ${userData.full_name}`);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setNotifications([]);
  };

  const toggleMockMode = () => {
    logout();
    setMockMode(prev => {
      const next = !prev;
      localStorage.setItem('mockMode', next.toString());
      return next;
    });
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated: !!user,
      mockMode,
      notifications,
      login,
      logout,
      toggleMockMode,
      addNotification,
      clearNotifications
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
