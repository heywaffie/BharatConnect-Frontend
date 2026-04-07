import { createContext, useContext, useState } from 'react';
import { api } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('cc_user');
        return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const login = async (email, password, role) => {
    if (!email || !password || !role) {
      throw new Error('Email, password, and role are required.');
    }
    const newUser = await api.auth.login({ email, password, role });
    setUser(newUser);
    localStorage.setItem('cc_user', JSON.stringify(newUser));
  };

  const register = async (data) => {
    if (!data.name || !data.email || !data.password || !data.role) {
      throw new Error('All fields are required.');
    }
    const newUser = await api.auth.register(data);
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
