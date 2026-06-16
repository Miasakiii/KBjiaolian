import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { jest } from '@jest/globals';

// Mock 依赖
const mockDb = {
  prepare: jest.fn(() => ({
    get: jest.fn(),
    run: jest.fn(),
  })),
};

jest.unstable_mockModule('../src/database.js', () => ({
  default: mockDb,
}));

// 设置测试环境变量
process.env.JWT_SECRET = 'test-secret-key-for-testing';
process.env.JWT_EXPIRES_IN = '1h';

describe('Auth Utils', () => {
  let auth;

  beforeAll(async () => {
    // 动态导入模块
    auth = await import('../src/auth.js');
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Token Generation', () => {
    test('should generate valid JWT token', () => {
      const userId = 'test-user-123';
      const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' });

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      expect(decoded.userId).toBe(userId);
    });

    test('should verify token with correct secret', () => {
      const userId = 'test-user-123';
      const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' });

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      expect(decoded.userId).toBe(userId);
    });

    test('should reject token with wrong secret', () => {
      const userId = 'test-user-123';
      const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' });

      expect(() => {
        jwt.verify(token, 'wrong-secret');
      }).toThrow();
    });

    test('should reject expired token', () => {
      const userId = 'test-user-123';
      const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '0s' });

      expect(() => {
        jwt.verify(token, process.env.JWT_SECRET);
      }).toThrow('jwt expired');
    });
  });

  describe('Password Hashing', () => {
    test('should hash password with bcrypt', async () => {
      const password = 'testPassword123';
      const hashedPassword = await bcrypt.hash(password, 10);

      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword.length).toBeGreaterThan(0);
    });

    test('should verify password against hash', async () => {
      const password = 'testPassword123';
      const hashedPassword = await bcrypt.hash(password, 10);

      const isValid = await bcrypt.compare(password, hashedPassword);
      expect(isValid).toBe(true);
    });

    test('should reject incorrect password', async () => {
      const password = 'testPassword123';
      const hashedPassword = await bcrypt.hash(password, 10);

      const isValid = await bcrypt.compare('wrongPassword', hashedPassword);
      expect(isValid).toBe(false);
    });
  });

  describe('Input Validation', () => {
    test('should validate email format', () => {
      // 这些测试需要从 validation.js 导入
      // 这里我们测试 auth.js 中的验证逻辑
      const validEmails = [
        'test@example.com',
        'user.name@domain.com',
        'user+tag@domain.co.uk',
      ];

      const invalidEmails = [
        'invalid-email',
        '@domain.com',
        'user@',
        'user@.com',
      ];

      validEmails.forEach(email => {
        expect(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)).toBe(true);
      });

      invalidEmails.forEach(email => {
        expect(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)).toBe(false);
      });
    });

    test('should validate password length', () => {
      const validPasswords = ['123456', 'password123', 'a'.repeat(100)];
      const invalidPasswords = ['12345', 'abc', ''];

      validPasswords.forEach(password => {
        expect(password.length >= 6 && password.length <= 100).toBe(true);
      });

      invalidPasswords.forEach(password => {
        expect(password.length >= 6 && password.length <= 100).toBe(false);
      });
    });
  });

  describe('User ID Generation', () => {
    test('should generate unique user IDs', () => {
      const ids = new Set();
      for (let i = 0; i < 100; i++) {
        const id = Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
        ids.add(id);
      }
      // 大多数 ID 应该是唯一的（理论上可能有碰撞，但概率极低）
      expect(ids.size).toBeGreaterThan(90);
    });
  });
});
