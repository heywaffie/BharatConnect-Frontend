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

  const persistUser = (newUser) => {
    const withLoginTime = {
      ...newUser,
      lastLoginAt: newUser?.lastLoginAt || new Date().toISOString(),
    };
    setUser(withLoginTime);
    localStorage.setItem('cc_user', JSON.stringify(withLoginTime));
    return withLoginTime;
  };

  const login = async (email, password) => {
    if (!email || !password) {
      throw new Error('Email and password are required.');
    }
    const newUser = await api.auth.login({ email, password });
    return persistUser(newUser);
  };

  const register = async (data) => {
    if (!data.name || !data.email || !data.password) {
      throw new Error('All fields are required.');
    }
    const newUser = await api.auth.register(data);
    return persistUser(newUser);
  };

  const googleSignIn = async (idToken) => {
    if (!idToken) {
      throw new Error('Google token is required.');
    }
    const newUser = await api.auth.google({ idToken });
    return persistUser(newUser);
  };

  const completeOnboarding = async (data) => {
    if (!data?.email || !data?.name || !data?.phoneNumber) {
      throw new Error('Email, name, and phone number are required.');
    }
    const newUser = await api.auth.completeOnboarding(data);
    return persistUser(newUser);
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
