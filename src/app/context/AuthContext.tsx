import { createContext, useContext, useState, type ReactNode } from 'react';
import type { User, UserRole } from '../types';

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('cc_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const login = async (email: string, password: string, role: UserRole) => {
    if (!email || !password || !role) {
      throw new Error('Email, password, and role are required.');
    }
    // Mock auth — replace with real API call in production
    const displayName = email
      .split('@')[0]
      .replace(/[._]/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());

    const newUser: User = {
      id: Math.random().toString(36).slice(2, 11),
      name: displayName,
      email,
      role,
    };
    setUser(newUser);
    localStorage.setItem('cc_user', JSON.stringify(newUser));
  };

  const register = async (data: RegisterData) => {
    if (!data.name || !data.email || !data.password || !data.role) {
      throw new Error('All fields are required.');
    }
    const newUser: User = {
      id: Math.random().toString(36).slice(2, 11),
      name: data.name,
      email: data.email,
      role: data.role,
    };
    setUser(newUser);
    localStorage.setItem('cc_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('cc_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
