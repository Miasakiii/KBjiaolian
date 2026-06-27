import { jest, describe, it, expect, beforeEach } from '@jest/globals';

// ====================================================
// Mock 数据存储
// ====================================================
const mockOrders = new Map();   // orderId -> order object
const mockUsers = new Map();    // userId -> { id, plan, plan_expires_at }

// ====================================================
// Mock prepared statements — orders.js
// ====================================================
const mockOrderStmts = {
  createOrder: {
    run: jest.fn((id, userId, plan, amount, createdAt) => {
      mockOrders.set(id, { id, user_id: userId, plan, amount, status: 'pending', created_at: createdAt });
    }),
  },
  getOrderById: {
    get: jest.fn((id) => mockOrders.get(id) || null),
  },
  getOrderByTradeNo: {
    get: jest.fn(() => null),
  },
  getUserOrders: {
    all: jest.fn((userId) => Array.from(mockOrders.values()).filter((o) => o.user_id === userId)),
  },
  updateOrderStatusIfPending: {
    run: jest.fn((status, tradeNo, paidAt, orderId) => {
      const order = mockOrders.get(orderId);
      if (order && order.status === 'pending') {
        order.status = status;
        order.trade_no = tradeNo;
        order.paid_at = paidAt;
        return { changes: 1 };
      }
      return { changes: 0 };
    }),
  },
  closeExpired: {
    run: jest.fn((threshold) => {
      for (const order of mockOrders.values()) {
        if (order.status === 'pending' && order.created_at < threshold) {
          order.status = 'failed';
        }
      }
    }),
  },
  getPendingOrder: {
    get: jest.fn((userId, sinceTs) => {
      for (const order of mockOrders.values()) {
        if (order.user_id === userId && order.status === 'pending' && order.created_at > sinceTs) {
          return order;
        }
      }
      return null;
    }),
  },
};

// ====================================================
// Mock prepared statements — subscription.js (orders.js imports it)
// ====================================================
const mockSubStmts = {
  getUserPlan: {
    get: jest.fn((userId) => mockUsers.get(userId) || null),
  },
  countTodayUsage: { get: jest.fn(() => ({ count: 0 })) },
  insertUsage: { run: jest.fn(() => ({ changes: 1, lastInsertRowid: 1 })) },
  deleteUsageById: { run: jest.fn() },
  downgradeExpired: { run: jest.fn() },
  upgradePlan: {
    run: jest.fn((planId, expiresAt, updatedAt, userId) => {
      const user = mockUsers.get(userId);
      if (user) {
        user.plan = planId;
        user.plan_expires_at = expiresAt;
      }
    }),
  },
};

// ====================================================
// Mock database module
// ====================================================
jest.unstable_mockModule('../src/database.js', () => ({
  default: {
    prepare: jest.fn((sql) => {
      // orders.js statements
      if (sql.includes('INSERT INTO orders')) return mockOrderStmts.createOrder;
      if (sql.includes('SELECT * FROM orders WHERE id')) return mockOrderStmts.getOrderById;
      if (sql.includes('SELECT * FROM orders WHERE trade_no')) return mockOrderStmts.getOrderByTradeNo;
      if (sql.includes('SELECT * FROM orders WHERE user_id') && sql.includes('ORDER BY')) return mockOrderStmts.getUserOrders;
      if (sql.includes('status = ?, trade_no = ?')) return mockOrderStmts.updateOrderStatusIfPending;
      if (sql.includes("status = 'failed'")) return mockOrderStmts.closeExpired;
      if (sql.includes("status = 'pending' AND created_at >")) return mockOrderStmts.getPendingOrder;
      // subscription.js statements
      if (sql.includes('SELECT plan, plan_expires_at')) return mockSubStmts.getUserPlan;
      if (sql.includes('COUNT(*)')) return mockSubStmts.countTodayUsage;
      if (sql.includes('INSERT INTO usage_logs')) return mockSubStmts.insertUsage;
      if (sql.includes('DELETE FROM usage_logs')) return mockSubStmts.deleteUsageById;
      if (sql.includes("plan = 'free'")) return mockSubStmts.downgradeExpired;
      if (sql.includes('plan = ?') && sql.includes('plan_expires_at = ?')) return mockSubStmts.upgradePlan;
      return { get: jest.fn(), run: jest.fn() };
    }),
    exec: jest.fn(),
    transaction: jest.fn((fn) => (...args) => fn(...args)),
  },
}));

// ====================================================
// Mock wechatpay module
// ====================================================
jest.unstable_mockModule('../src/wechatpay.js', () => ({
  isWechatPayConfigured: jest.fn(() => false),
  createJsapiOrder: jest.fn(),
  createAppOrder: jest.fn(),
}));

// 动态导入（必须在 mock 之后）
const orders = await import('../src/orders.js');

// ====================================================
// 辅助函数
// ====================================================
function addOrder(id, userId, plan, amount, status, createdAt) {
  const order = { id, user_id: userId, plan, amount, status, created_at: createdAt };
  mockOrders.set(id, order);
  return order;
}

function addUser(userId, plan = 'free', expiresAt = null) {
  mockUsers.set(userId, { id: userId, plan, plan_expires_at: expiresAt });
}

// ====================================================
// 测试
// ====================================================
describe('Orders Module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockOrders.clear();
    mockUsers.clear();
  });

  // ------------------------------------------------
  // generateOrderId (通过 createOrder 间接测试)
  // ------------------------------------------------
  describe('generateOrderId (间接测试)', () => {
    it('订单 ID 应以 KB 前缀开头', () => {
      addUser('user1');
      const order = orders.createOrder('user1', 'pro_monthly');

      expect(order.id).toMatch(/^KB/);
    });

    it('两次调用应生成不同的订单 ID', () => {
      addUser('user1');
      const order1 = orders.createOrder('user1', 'pro_monthly');
      const order2 = orders.createOrder('user1', 'pro_yearly');

      expect(order1.id).not.toBe(order2.id);
    });
  });

  // ------------------------------------------------
  // createOrder
  // ------------------------------------------------
  describe('createOrder', () => {
    it('应该正常创建订单', () => {
      addUser('user1');
      const order = orders.createOrder('user1', 'pro_monthly');

      expect(order.id).toMatch(/^KB/);
      expect(order.userId).toBe('user1');
      expect(order.plan).toBe('pro_monthly');
      expect(order.amount).toBe(2990);
      expect(order.status).toBe('pending');
      expect(mockOrderStmts.createOrder.run).toHaveBeenCalled();
    });

    it('应该复用 5 分钟内同类型的 pending 订单', () => {
      addUser('user1');
      const now = Date.now();
      const existing = addOrder('KB-existing', 'user1', 'pro_monthly', 2990, 'pending', now);

      const order = orders.createOrder('user1', 'pro_monthly');

      // 应返回已有订单，不创建新订单
      expect(order.id).toBe('KB-existing');
      expect(mockOrderStmts.createOrder.run).not.toHaveBeenCalled();
    });

    it('应该拒绝 free 套餐', () => {
      addUser('user1');

      expect(() => orders.createOrder('user1', 'free')).toThrow('无效的套餐');
      try {
        orders.createOrder('user1', 'free');
      } catch (err) {
        expect(err.statusCode).toBe(400);
      }
    });

    it('应该拒绝无效的 planId', () => {
      addUser('user1');

      expect(() => orders.createOrder('user1', 'invalid_plan')).toThrow('无效的套餐');
      try {
        orders.createOrder('user1', 'invalid_plan');
      } catch (err) {
        expect(err.statusCode).toBe(400);
      }
    });

    it('不同套餐不应复用 pending 订单', () => {
      addUser('user1');
      const now = Date.now();
      addOrder('KB-existing', 'user1', 'pro_monthly', 2990, 'pending', now);

      // 请求 pro_yearly，不应复用 pro_monthly 的 pending 订单
      const order = orders.createOrder('user1', 'pro_yearly');

      expect(order.id).not.toBe('KB-existing');
      expect(order.plan).toBe('pro_yearly');
      expect(mockOrderStmts.createOrder.run).toHaveBeenCalled();
    });
  });

  // ------------------------------------------------
  // completeOrder
  // ------------------------------------------------
  describe('completeOrder', () => {
    it('pending 订单应该成功完成 (→ paid)', () => {
      addUser('user1', 'free');
      addOrder('KB-test1', 'user1', 'pro_monthly', 2990, 'pending', Date.now());

      const result = orders.completeOrder('KB-test1', 'trade-001');

      expect(result.status).toBe('paid');
      expect(result.trade_no).toBe('trade-001');
      expect(result.paid_at).toBeDefined();
    });

    it('已 paid 的订单应幂等返回', () => {
      addUser('user1', 'free');
      addOrder('KB-test2', 'user1', 'pro_monthly', 2990, 'paid', Date.now());

      const result = orders.completeOrder('KB-test2', 'trade-002');

      expect(result.status).toBe('paid');
      // 不应再次调用 updateOrderStatusIfPending
      expect(mockOrderStmts.updateOrderStatusIfPending.run).not.toHaveBeenCalled();
    });

    it('非 pending 状态应抛出 400', () => {
      addOrder('KB-test3', 'user1', 'pro_monthly', 2990, 'failed', Date.now());

      expect(() => orders.completeOrder('KB-test3', 'trade-003')).toThrow();
      try {
        orders.completeOrder('KB-test3', 'trade-003');
      } catch (err) {
        expect(err.statusCode).toBe(400);
      }
    });

    it('不存在的订单应抛出 404', () => {
      expect(() => orders.completeOrder('KB-nonexistent', 'trade-004')).toThrow();
      try {
        orders.completeOrder('KB-nonexistent', 'trade-004');
      } catch (err) {
        expect(err.statusCode).toBe(404);
      }
    });

    it('完成订单后应升级用户套餐', () => {
      addUser('user1', 'free');
      addOrder('KB-test5', 'user1', 'pro_monthly', 2990, 'pending', Date.now());

      orders.completeOrder('KB-test5', 'trade-005');

      const user = mockUsers.get('user1');
      expect(user.plan).toBe('pro_monthly');
      expect(user.plan_expires_at).toBeGreaterThan(Date.now());
    });

    it('pro_yearly 完成后应升级为 365 天', () => {
      addUser('user1', 'free');
      addOrder('KB-test6', 'user1', 'pro_yearly', 16800, 'pending', Date.now());

      orders.completeOrder('KB-test6', 'trade-006');

      const user = mockUsers.get('user1');
      const duration = user.plan_expires_at - Date.now();
      // 应该接近 365 天（允许 10 秒误差）
      expect(duration).toBeGreaterThan(364 * 24 * 60 * 60 * 1000);
      expect(duration).toBeLessThan(365 * 24 * 60 * 60 * 1000 + 10000);
    });
  });

  // ------------------------------------------------
  // closeExpiredOrders
  // ------------------------------------------------
  describe('closeExpiredOrders', () => {
    it('应该关闭超过 30 分钟的 pending 订单', () => {
      const now = Date.now();
      // 35 分钟前创建的 pending 订单
      addOrder('KB-old', 'user1', 'pro_monthly', 2990, 'pending', now - 35 * 60 * 1000);
      // 10 分钟前创建的 pending 订单
      addOrder('KB-recent', 'user1', 'pro_monthly', 2990, 'pending', now - 10 * 60 * 1000);

      orders.closeExpiredOrders();

      expect(mockOrders.get('KB-old').status).toBe('failed');
      expect(mockOrders.get('KB-recent').status).toBe('pending');
    });

    it('没有过期订单时不应修改任何订单', () => {
      const now = Date.now();
      addOrder('KB-recent', 'user1', 'pro_monthly', 2990, 'pending', now - 10 * 60 * 1000);

      orders.closeExpiredOrders();

      expect(mockOrders.get('KB-recent').status).toBe('pending');
    });
  });

  // ------------------------------------------------
  // generatePaymentParams
  // ------------------------------------------------
  describe('generatePaymentParams', () => {
    it('mock 模式应返回包含 mockPayUrl 的对象', async () => {
      const order = { id: 'KB-test', plan: 'pro_monthly', amount: 2990 };

      const result = await orders.generatePaymentParams(order, 'miniapp');

      expect(result.orderId).toBe('KB-test');
      expect(result.amount).toBe(2990);
      expect(result.amountYuan).toBe('29.90');
      expect(result.planName).toBe('Pro 月度');
      expect(result.mockPayUrl).toContain('KB-test');
    });

    it('应该包含 platform 字段', async () => {
      const order = { id: 'KB-test', plan: 'pro_yearly', amount: 16800 };

      const result = await orders.generatePaymentParams(order, 'app');

      expect(result.platform).toBe('app');
      expect(result.amountYuan).toBe('168.00');
      expect(result.planName).toBe('Pro 年度');
    });

    it('生产环境不应返回 mockPayUrl', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const order = { id: 'KB-test', plan: 'pro_monthly', amount: 2990 };

      try {
        const result = await orders.generatePaymentParams(order, 'miniapp');
        // 在生产环境下，isWechatPayConfigured mock 返回 false
        // 但 mockPayUrl 只在非生产环境添加
        expect(result.mockPayUrl).toBeUndefined();
      } finally {
        process.env.NODE_ENV = originalEnv;
      }
    });
  });

  // ------------------------------------------------
  // getOrder / getUserOrders
  // ------------------------------------------------
  describe('getOrder', () => {
    it('应该返回订单详情', () => {
      addOrder('KB-get1', 'user1', 'pro_monthly', 2990, 'pending', Date.now());

      const order = orders.getOrder('KB-get1');

      expect(order).toBeDefined();
      expect(order.id).toBe('KB-get1');
    });

    it('不存在的订单应返回 null', () => {
      expect(orders.getOrder('KB-nonexistent')).toBeNull();
    });
  });

  describe('getUserOrders', () => {
    it('应该返回用户的订单列表', () => {
      addOrder('KB-1', 'user1', 'pro_monthly', 2990, 'paid', 1000);
      addOrder('KB-2', 'user1', 'pro_yearly', 16800, 'pending', 2000);
      addOrder('KB-3', 'user2', 'pro_monthly', 2990, 'paid', 3000);

      const userOrders = orders.getUserOrders('user1');

      expect(userOrders).toHaveLength(2);
      expect(userOrders.every((o) => o.user_id === 'user1')).toBe(true);
    });

    it('没有订单的用户应返回空数组', () => {
      expect(orders.getUserOrders('user-no-orders')).toEqual([]);
    });
  });
});
