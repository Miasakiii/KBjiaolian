import { jest, describe, it, expect, beforeAll, beforeEach } from '@jest/globals';
import jwt from 'jsonwebtoken';

// 设置测试环境变量
process.env.JWT_SECRET = 'test-secret-key-for-auth-comprehensive';

// 模拟数据库
const mockUsers = new Map();
const mockCodeRecord = {
  id: 1,
  email: 'test@example.com',
  code: '123456',
  type: 'register',
  used: 0,
  expires_at: Date.now() + 300000,
  attempts: 0,
};
const mockStmts = {
  findUserByEmail: {
    get: jest.fn((email) => mockUsers.get(email)),
  },
  findUserById: {
    get: jest.fn((id) => {
      for (const user of mockUsers.values()) {
        if (user.id === id) return user;
      }
      return null;
    }),
  },
  createUser: {
    run: jest.fn((id, email, password, nickname) => {
      mockUsers.set(email, { id, email, password, nickname, created_at: Date.now() });
    }),
  },
  findActiveCode: {
    get: jest.fn(() => ({ ...mockCodeRecord })),
  },
  markCodeUsed: {
    run: jest.fn(),
  },
};

jest.unstable_mockModule('../src/database.js', () => ({
  default: {
    prepare: jest.fn((sql) => {
      // 验证码相关查询
      if (sql.includes('verification_codes') && sql.includes('SELECT')) return mockStmts.findActiveCode;
      if (sql.includes('verification_codes') && sql.includes('UPDATE')) return mockStmts.markCodeUsed;
      if (sql.includes('verification_codes') && sql.includes('DELETE')) return { run: jest.fn() };
      if (sql.includes('verification_codes') && sql.includes('INSERT')) return { run: jest.fn() };
      // 用户相关查询
      if (sql.includes('users') && sql.includes('WHERE email')) return mockStmts.findUserByEmail;
      if (sql.includes('users') && sql.includes('WHERE id')) return mockStmts.findUserById;
      if (sql.includes('users') && sql.includes('INSERT')) return mockStmts.createUser;
      return { get: jest.fn(), run: jest.fn() };
    }),
  },
}));

// 创建带 get 方法的 mock req（模拟 Express req.get）
function createMockReq(headers = {}) {
  return {
    headers,
    get: jest.fn((name) => headers[name.toLowerCase()] || headers[name]),
  };
}

// 动态导入模块
const authModule = await import('../src/auth.js');

describe('Auth Module - Comprehensive Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUsers.clear();
  });

  describe('authMiddleware', () => {
    it('应该拒绝没有 Authorization 头的请求', () => {
      const req = createMockReq({});
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      authModule.authMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('应该拒绝不以 Bearer 开头的 Authorization 头', () => {
      const req = createMockReq({ authorization: 'Basic token123' });
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      authModule.authMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('应该拒绝无效的 JWT token', () => {
      const req = createMockReq({ authorization: 'Bearer invalid-token' });
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      authModule.authMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('应该拒绝过期的 JWT token', (done) => {
      const expiredToken = jwt.sign(
        { userId: 'user123' },
        process.env.JWT_SECRET,
        { expiresIn: '0s' }
      );

      const req = createMockReq({ authorization: `Bearer ${expiredToken}` });
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      // 等待 token 过期
      setTimeout(() => {
        authModule.authMiddleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(next).not.toHaveBeenCalled();
        done();
      }, 100);
    });

    it('应该接受有效的 JWT token 并调用 next', () => {
      const validToken = jwt.sign(
        { userId: 'user123' },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      const req = createMockReq({ authorization: `Bearer ${validToken}` });
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      authModule.authMiddleware(req, res, next);

      expect(req.userId).toBe('user123');
      expect(next).toHaveBeenCalled();
    });
  });

  describe('register', () => {
    it('应该成功注册新用户', async () => {
      const req = {
        body: {
          email: 'test@example.com',
          password: 'password123',
          nickname: '测试用户',
          code: '123456',
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await authModule.register(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          token: expect.any(String),
          user: expect.objectContaining({
            email: 'test@example.com',
            nickname: '测试用户',
          }),
        })
      );
    });

    it('应该拒绝缺少邮箱的注册', async () => {
      const req = { body: { password: 'password123' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await authModule.register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('应该拒绝无效邮箱格式', async () => {
      const req = {
        body: { email: 'invalid-email', password: 'password123' },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await authModule.register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('应该拒绝短密码', async () => {
      const req = {
        body: { email: 'test@example.com', password: '12345' },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await authModule.register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('login', () => {
    it('应该拒绝缺少凭据的登录', async () => {
      const req = { body: {} };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await authModule.login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('应该拒绝不存在的用户', async () => {
      const req = {
        body: { email: 'nonexistent@example.com', password: 'password123' },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await authModule.login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
    });
  });

  describe('getProfile', () => {
    it('应该返回 404 对于不存在的用户', () => {
      const req = { userId: 'nonexistent' };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      authModule.getProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });
});
