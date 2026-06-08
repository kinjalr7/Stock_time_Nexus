import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE = 'http://localhost:8000';

interface User {
  id: string;
  username: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('stn_user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem('stn_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (emailOrUsername: string, password: string) => {
    setIsLoading(true);
    try {
      // Try the real backend first
      await axios.post(`${API_BASE}/api/auth/login`, {
        username: emailOrUsername.includes('@')
          ? emailOrUsername.split('@')[0]  // derive username from email
          : emailOrUsername,
        password,
      });

      const loggedInUser: User = {
        id: emailOrUsername,
        username: emailOrUsername.includes('@') ? emailOrUsername.split('@')[0] : emailOrUsername,
        email: emailOrUsername.includes('@') ? emailOrUsername : `${emailOrUsername}@nexus.app`,
        name: emailOrUsername.includes('@')
          ? emailOrUsername.split('@')[0].replace(/\./g, ' ')
          : emailOrUsername,
      };

      setUser(loggedInUser);
      localStorage.setItem('stn_user', JSON.stringify(loggedInUser));
      toast.success(`Welcome back, ${loggedInUser.name}! 👋`);
    } catch (err: any) {
      // If backend is down or creds wrong, fall through to demo mode
      const status = err?.response?.status;
      if (status === 401) {
        toast.error('Invalid username or password');
        throw err;
      }

      // Backend unreachable → demo mode
      const demoUser: User = {
        id: '1',
        username: emailOrUsername.includes('@') ? emailOrUsername.split('@')[0] : emailOrUsername,
        email: emailOrUsername.includes('@') ? emailOrUsername : `${emailOrUsername}@nexus.app`,
        name: emailOrUsername.includes('@')
          ? emailOrUsername.split('@')[0].replace(/\./g, ' ')
          : emailOrUsername,
      };
      setUser(demoUser);
      localStorage.setItem('stn_user', JSON.stringify(demoUser));
      toast.success(`Demo mode — Welcome, ${demoUser.name}!`);
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    try {
      const username = email.includes('@') ? email.split('@')[0] : email;
      await axios.post(`${API_BASE}/api/auth/register`, {
        username,
        password,
        email,
      });

      const newUser: User = { id: username, username, email, name };
      setUser(newUser);
      localStorage.setItem('stn_user', JSON.stringify(newUser));
      toast.success(`Account created! Welcome, ${name}! 🎉`);
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 400) {
        const detail = err.response?.data?.detail || 'Username or email already exists';
        toast.error(detail);
        throw err;
      }

      // Backend unreachable → demo mode
      const username = email.includes('@') ? email.split('@')[0] : email;
      const demoUser: User = { id: username, username, email, name };
      setUser(demoUser);
      localStorage.setItem('stn_user', JSON.stringify(demoUser));
      toast.success(`Demo mode — Welcome, ${name}!`);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('stn_user');
    toast.success('Signed out successfully');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};