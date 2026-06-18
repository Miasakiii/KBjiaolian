// 认证工具模块

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
const TOKEN_KEY = 'kb-coach-token';
const USER_KEY = 'kb-coach-user';
const GUEST_KEY = 'kb-coach-guest';
const REDIRECT_KEY = 'kb-coach-redirect';

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

// 游客模式
export function isGuest(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(GUEST_KEY) === 'true';
}

export function setGuest(): void {
  localStorage.setItem(GUEST_KEY, 'true');
}

export function clearGuest(): void {
  localStorage.removeItem(GUEST_KEY);
}

// 是否有访问权限（已登录 或 游客）
export function hasAccess(): boolean {
  return isAuthenticated() || isGuest();
}

// 登录回跳：保存/读取/清除目标路径
export function saveRedirectPath(path: string): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(REDIRECT_KEY, path);
}

export function getRedirectPath(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(REDIRECT_KEY);
}

export function clearRedirectPath(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(REDIRECT_KEY);
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
    if (isGuest()) {
      throw new Error('游客模式下无法使用此功能，请先登录');
    }
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
  clearGuest();
  window.location.href = '/login';
}

// 忘记密码
export async function forgotPassword(email: string): Promise<{ message: string; token?: string; resetUrl?: string }> {
  const response = await fetch(`${API_BASE}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || '操作失败');
  }

  return data;
}

// 重置密码
export async function resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, newPassword }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || '重置失败');
  }

  return data;
}
