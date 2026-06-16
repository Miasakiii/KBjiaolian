import { jest, describe, it, expect, beforeAll } from '@jest/globals';
import request from 'supertest';

// 模拟 AI API
global.fetch = jest.fn();

describe('API 路由测试', () => {
  let app;

  beforeAll(async () => {
    // 设置测试环境
    process.env.JWT_SECRET = 'test-secret-key-for-routes';
    process.env.MIMO_API_KEY = 'test-api-key';

    // 动态导入应用
    const { createApp } = await import('../src/app.js');
    app = createApp();
  });

  describe('健康检查', () => {
    it('GET /api/health 应该返回 200', async () => {
      const res = await request(app).get('/api/health');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status', 'ok');
      expect(res.body).toHaveProperty('timestamp');
    });
  });

  describe('未认证请求', () => {
    it('应该拒绝未认证的 AI 分析请求', async () => {
      const res = await request(app)
        .post('/api/analyze')
        .send({
          image: 'data:image/jpeg;base64,validbase64data',
        });

      expect(res.status).toBe(401);
    });

    it('应该拒绝未认证的数据请求', async () => {
      const res = await request(app).get('/api/data/analysis');

      expect(res.status).toBe(401);
    });

    it('应该拒绝未认证的训练方案请求', async () => {
      const res = await request(app).get('/api/data/plans');

      expect(res.status).toBe(401);
    });

    it('应该拒绝未认证的训练记录请求', async () => {
      const res = await request(app).get('/api/data/workouts');

      expect(res.status).toBe(401);
    });

    it('应该拒绝未认证的营养记录请求', async () => {
      const res = await request(app).get('/api/data/nutrition');

      expect(res.status).toBe(401);
    });

    it('应该拒绝未认证的聊天历史请求', async () => {
      const res = await request(app).get('/api/data/chat');

      expect(res.status).toBe(401);
    });
  });

  describe('无效令牌', () => {
    it('应该拒绝无效的 JWT 令牌', async () => {
      const res = await request(app)
        .get('/api/data/analysis')
        .set('Authorization', 'Bearer invalid-token');

      expect(res.status).toBe(401);
    });

    it('应该拒绝过期的 JWT 令牌', async () => {
      const res = await request(app)
        .get('/api/data/analysis')
        .set('Authorization', 'Bearer expired.token.here');

      expect(res.status).toBe(401);
    });
  });
});
