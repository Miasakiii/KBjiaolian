'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User, getToken, getUser, saveAuth, clearAuth, isAuthenticated as checkIsAuthenticated } from './auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 初始化认证状态
  useEffect(() => {
    const initAuth = () => {
      try {
        const authenticated = checkIsAuthenticated();
        setIsAuthenticated(authenticated);

        if (authenticated) {
          const currentUser = getUser();
          setUser(currentUser);
        }
      } catch (error) {
        console.error('初始化认证状态失败:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // 登录
  const login = useCallback((token: string, userData: User) => {
    saveAuth({ token, user: userData });
    setUser(userData);
    setIsAuthenticated(true);
  }, []);

  // 登出
  const logout = useCallback(() => {
    clearAuth();
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  // 刷新用户信息
  const refreshUser = useCallback(() => {
    try {
      const currentUser = getUser();
      setUser(currentUser);
      setIsAuthenticated(checkIsAuthenticated());
    } catch (error) {
      console.error('刷新用户信息失败:', error);
    }
  }, []);

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
