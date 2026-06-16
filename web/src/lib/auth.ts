// 认证工具模块

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
const TOKEN_KEY = 'kb-coach-token';
const USER_KEY = 'kb-coach-user';

export interface User {
  id: string;
  email: string;
  nickname: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// 获取存储的 token
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

// 获取存储的用户信息
export function getUser(): User | null {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(USER_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

// 保存认证信息
export function saveAuth(auth: AuthResponse): void {
  localStorage.setItem(TOKEN_KEY, auth.token);
  localStorage.setItem(USER_KEY, JSON.stringify(auth.user));
}

// 清除认证信息
export function clearAuth(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

// 检查是否已登录
export function isAuthenticated(): boolean {
  return !!getToken();
}

// 带认证的 fetch 请求
export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, { ...options, headers });

  // 如果 token 过期，清除认证信息
  if (response.status === 401) {
    clearAuth();
    window.location.href = '/login';
    throw new Error('登录已过期，请重新登录');
  }

  return response;
}

// 注册
export async function register(email: string, password: string, nickname?: string): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, nickname }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || '注册失败');
  }

  saveAuth(data);
  return data;
}

// 登录
export async function login(email: string, password: string): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || '登录失败');
  }

  saveAuth(data);
  return data;
}

// 登出
export function logout(): void {
  clearAuth();
  window.location.href = '/login';
}
