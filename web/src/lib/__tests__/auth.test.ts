import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getToken,
  getUser,
  saveAuth,
  clearAuth,
  isAuthenticated,
  User,
  AuthResponse,
} from '../auth';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('Auth Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getToken', () => {
    it('should return token from localStorage', () => {
      const mockToken = 'test-token-123';
      localStorageMock.getItem.mockReturnValue(mockToken);

      const token = getToken();

      expect(token).toBe(mockToken);
      expect(localStorageMock.getItem).toHaveBeenCalledWith('kb-coach-token');
    });

    it('should return null when no token exists', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const token = getToken();

      expect(token).toBeNull();
    });

    it('should return null on server side', () => {
      // 模拟服务器环境
      const originalWindow = global.window;
      // @ts-ignore
      delete global.window;

      const token = getToken();

      expect(token).toBeNull();

      global.window = originalWindow;
    });
  });

  describe('getUser', () => {
    it('should return user from localStorage', () => {
      const mockUser: User = {
        id: '123',
        email: 'test@example.com',
        nickname: 'Test User',
      };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockUser));

      const user = getUser();

      expect(user).toEqual(mockUser);
      expect(localStorageMock.getItem).toHaveBeenCalledWith('kb-coach-user');
    });

    it('should return null when no user exists', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const user = getUser();

      expect(user).toBeNull();
    });

    it('should return null for invalid JSON', () => {
      localStorageMock.getItem.mockReturnValue('invalid-json');

      const user = getUser();

      expect(user).toBeNull();
    });

    it('should return null on server side', () => {
      const originalWindow = global.window;
      // @ts-ignore
      delete global.window;

      const user = getUser();

      expect(user).toBeNull();

      global.window = originalWindow;
    });
  });

  describe('saveAuth', () => {
    it('should save token and user to localStorage', () => {
      const mockAuth: AuthResponse = {
        token: 'test-token-123',
        user: {
          id: '123',
          email: 'test@example.com',
          nickname: 'Test User',
        },
      };

      saveAuth(mockAuth);

      expect(localStorageMock.setItem).toHaveBeenCalledWith('kb-coach-token', mockAuth.token);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'kb-coach-user',
        JSON.stringify(mockAuth.user)
      );
    });
  });

  describe('clearAuth', () => {
    it('should remove token and user from localStorage', () => {
      clearAuth();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('kb-coach-token');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('kb-coach-user');
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when token exists', () => {
      localStorageMock.getItem.mockReturnValue('test-token');

      const result = isAuthenticated();

      expect(result).toBe(true);
    });

    it('should return false when token does not exist', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const result = isAuthenticated();

      expect(result).toBe(false);
    });

    it('should return false for empty string token', () => {
      localStorageMock.getItem.mockReturnValue('');

      const result = isAuthenticated();

      expect(result).toBe(false);
    });
  });
});
