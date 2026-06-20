'use client';

import { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import {
  User, getToken, getUser, saveAuth, clearAuth,
  isAuthenticated as checkIsAuthenticated,
  isGuest as checkIsGuest, setGuest, clearGuest,
} from './auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  enterGuestMode: () => void;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
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
        } else {
          // 未登录时检查游客状态
          setIsGuest(checkIsGuest());
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
    clearGuest(); // 登录后清除游客状态
    setUser(userData);
    setIsAuthenticated(true);
    setIsGuest(false);
  }, []);

  // 登出
  const logout = useCallback(() => {
    clearAuth();
    clearGuest();
    setUser(null);
    setIsAuthenticated(false);
    setIsGuest(false);
  }, []);

  // 进入游客模式
  const enterGuestMode = useCallback(() => {
    setGuest();
    setIsGuest(true);
  }, []);

  // 刷新用户信息
  const refreshUser = useCallback(() => {
    try {
      const currentUser = getUser();
      setUser(currentUser);
      setIsAuthenticated(checkIsAuthenticated());
      if (!checkIsAuthenticated()) {
        setIsGuest(checkIsGuest());
      }
    } catch (error) {
      console.error('刷新用户信息失败:', error);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated,
      isGuest,
      isLoading,
      login,
      logout,
      enterGuestMode,
      refreshUser,
    }),
    [user, isAuthenticated, isGuest, isLoading, login, logout, enterGuestMode, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
