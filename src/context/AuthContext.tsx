import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, setAuthToken, User } from '../services/api.ts';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: { identifier: string; password: string; expectedRole?: string }) => Promise<User>;
  register: (studentData: any) => Promise<User>;
  logout: () => void;
  updateUserContext: (updates: Partial<User>) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const token = localStorage.getItem('orbit_token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const data = await api.getMe();
        setUser(data.user);
      } catch (err) {
        // Token expired or invalid
        setAuthToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  const login = async (credentials: { identifier: string; password: string; expectedRole?: string }): Promise<User> => {
    const res = await api.login(credentials);
    setAuthToken(res.token);
    setUser(res.user);
    return res.user;
  };

  const register = async (studentData: any): Promise<User> => {
    const res = await api.register(studentData);
    setAuthToken(res.token);
    setUser(res.user);
    return res.user;
  };

  const logout = () => {
    setAuthToken(null);
    setUser(null);
  };

  const updateUserContext = (updates: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updates });
    }
  };

  const refreshUser = async () => {
    try {
      const data = await api.getMe();
      setUser(data.user);
    } catch {}
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateUserContext,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
