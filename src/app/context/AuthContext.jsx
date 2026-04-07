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

  const login = async (email, password) => {
    if (!email || !password) {
      throw new Error('Email and password are required.');
    }
    const newUser = await api.auth.login({ email, password });
    setUser(newUser);
    localStorage.setItem('cc_user', JSON.stringify(newUser));
    return newUser;
  };

  const register = async (data) => {
    if (!data.name || !data.email || !data.password) {
      throw new Error('All fields are required.');
    }
    const newUser = await api.auth.register(data);
    setUser(newUser);
    localStorage.setItem('cc_user', JSON.stringify(newUser));
    return newUser;
  };

  const googleSignIn = async (idToken) => {
    if (!idToken) {
      throw new Error('Google token is required.');
    }
    const newUser = await api.auth.google({ idToken });
    setUser(newUser);
    localStorage.setItem('cc_user', JSON.stringify(newUser));
    return newUser;
  };

  const completeOnboarding = async (data) => {
    if (!data?.email || !data?.name || !data?.role) {
      throw new Error('Email, name, and role are required.');
    }
    const newUser = await api.auth.completeOnboarding(data);
    setUser(newUser);
    localStorage.setItem('cc_user', JSON.stringify(newUser));
    return newUser;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('cc_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, googleSignIn, completeOnboarding, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
