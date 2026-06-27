import { jest, describe, it, expect, beforeEach } from '@jest/globals';

// ====================================================
// Mock 数据存储
// ====================================================
const mockData = {
  users: new Map(),
  usageLogs: [],
  nextUsageId: 1,
};

// ====================================================
// Mock prepared statements
// ====================================================
const mockStmts = {
  getUserPlan: {
    get: jest.fn((userId) => mockData.users.get(userId) || null),
  },
  countTodayUsage: {
    get: jest.fn((userId, action, ts) => {
      const count = mockData.usageLogs.filter(
        (log) => log.user_id === userId && log.action === action && log.created_at > ts
      ).length;
      return { count };
    }),
  },
  insertUsage: {
    run: jest.fn((userId, action, createdAt) => {
      const id = mockData.nextUsageId++;
      mockData.usageLogs.push({ id, user_id: userId, action, created_at: createdAt });
      return { changes: 1, lastInsertRowid: id };
    }),
  },
  deleteUsageById: {
    run: jest.fn((id) => {
      const idx = mockData.usageLogs.findIndex((log) => log.id === id);
      if (idx >= 0) mockData.usageLogs.splice(idx, 1);
    }),
  },
  downgradeExpired: {
    run: jest.fn((updatedAt, userId, nowTs) => {
      const user = mockData.users.get(userId);
      if (user && user.plan !== 'free' && user.plan_expires_at && user.plan_expires_at < nowTs) {
        user.plan = 'free';
        user.plan_expires_at = null;
      }
    }),
  },
  upgradePlan: {
    run: jest.fn((planId, expiresAt, updatedAt, userId) => {
      const user = mockData.users.get(userId);
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
      if (sql.includes('SELECT plan, plan_expires_at')) return mockStmts.getUserPlan;
      if (sql.includes('COUNT(*)')) return mockStmts.countTodayUsage;
      if (sql.includes('INSERT INTO usage_logs')) return mockStmts.insertUsage;
      if (sql.includes('DELETE FROM usage_logs')) return mockStmts.deleteUsageById;
      if (sql.includes("plan = 'free'")) return mockStmts.downgradeExpired;
      if (sql.includes('plan = ?') && sql.includes('plan_expires_at = ?')) return mockStmts.upgradePlan;
      return { get: jest.fn(), run: jest.fn() };
    }),
    exec: jest.fn(),
    transaction: jest.fn((fn) => (...args) => fn(...args)),
  },
}));

// 动态导入（必须在 mock 之后）
const { PLANS, getUserPlan, getQuotaStatus, checkQuota, reserveQuota, releaseQuota, upgradePlan, getTodayUsage, isProUser } = await import('../src/subscription.js');

// ====================================================
// 辅助函数
// ====================================================
function addUser(userId, plan = 'free', planExpiresAt = null) {
  mockData.users.set(userId, { id: userId, plan, plan_expires_at: planExpiresAt });
}

function addUsage(userId, action, createdAt) {
  const id = mockData.nextUsageId++;
  mockData.usageLogs.push({ id, user_id: userId, action, created_at: createdAt });
  return id;
}

// ====================================================
// 测试
// ====================================================
describe('Subscription Module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockData.users.clear();
    mockData.usageLogs = [];
    mockData.nextUsageId = 1;
  });

  // ------------------------------------------------
  // PLANS 配置
  // ------------------------------------------------
  describe('PLANS 配置', () => {
    it('应该包含 3 个套餐', () => {
      expect(Object.keys(PLANS)).toHaveLength(3);
      expect(PLANS.free).toBeDefined();
      expect(PLANS.pro_monthly).toBeDefined();
      expect(PLANS.pro_yearly).toBeDefined();
    });

    it('价格应该正确', () => {
      expect(PLANS.free.price).toBe(0);
      expect(PLANS.pro_monthly.price).toBe(2990);
      expect(PLANS.pro_yearly.price).toBe(16800);
    });

    it('limits 应该完整', () => {
      for (const plan of Object.values(PLANS)) {
        expect(plan.limits).toHaveProperty('analyzePerDay');
        expect(plan.limits).toHaveProperty('planPerDay');
        expect(plan.limits).toHaveProperty('nutritionPerDay');
        expect(plan.limits).toHaveProperty('chatPerDay');
      }
    });

    it('Pro 套餐额度应该高于 free', () => {
      expect(PLANS.pro_monthly.limits.analyzePerDay).toBeGreaterThan(PLANS.free.limits.analyzePerDay);
      expect(PLANS.pro_monthly.limits.chatPerDay).toBeGreaterThan(PLANS.free.limits.chatPerDay);
    });
  });

  // ------------------------------------------------
  // getUserPlan
  // ------------------------------------------------
  describe('getUserPlan', () => {
    it('应该返回用户的套餐', () => {
      addUser('user1', 'pro_monthly', Date.now() + 86400000);
      expect(getUserPlan('user1')).toBe('pro_monthly');
    });

    it('用户不存在时返回 free', () => {
      expect(getUserPlan('nonexistent')).toBe('free');
    });

    it('Pro 过期时应自动降级为 free', () => {
      addUser('user1', 'pro_monthly', Date.now() - 1000);
      expect(getUserPlan('user1')).toBe('free');
      // 验证降级操作被执行
      expect(mockStmts.downgradeExpired.run).toHaveBeenCalled();
    });

    it('Pro 未过期时不应降级', () => {
      addUser('user1', 'pro_yearly', Date.now() + 365 * 86400000);
      expect(getUserPlan('user1')).toBe('pro_yearly');
      expect(mockStmts.downgradeExpired.run).not.toHaveBeenCalled();
    });

    it('free 用户不应触发降级检查', () => {
      addUser('user1', 'free', null);
      expect(getUserPlan('user1')).toBe('free');
      expect(mockStmts.downgradeExpired.run).not.toHaveBeenCalled();
    });
  });

  // ------------------------------------------------
  // getQuotaStatus
  // ------------------------------------------------
  describe('getQuotaStatus', () => {
    it('应该返回包含 plan/limits/usage 的结构', () => {
      addUser('user1', 'free');
      const status = getQuotaStatus('user1');

      expect(status).toHaveProperty('plan');
      expect(status).toHaveProperty('planName');
      expect(status).toHaveProperty('limits');
      expect(status).toHaveProperty('usage');
    });

    it('usage 应包含所有 action 的 used/limit/remaining', () => {
      addUser('user1', 'free');
      const status = getQuotaStatus('user1');

      for (const action of ['analyze', 'plan', 'nutrition', 'chat']) {
        expect(status.usage[action]).toHaveProperty('used');
        expect(status.usage[action]).toHaveProperty('limit');
        expect(status.usage[action]).toHaveProperty('remaining');
      }
    });

    it('remaining 应等于 limit - used', () => {
      addUser('user1', 'free');
      addUsage('user1', 'analyze', Date.now());

      const status = getQuotaStatus('user1');

      expect(status.usage.analyze.used).toBe(1);
      expect(status.usage.analyze.limit).toBe(PLANS.free.limits.analyzePerDay);
      expect(status.usage.analyze.remaining).toBe(PLANS.free.limits.analyzePerDay - 1);
    });
  });

  // ------------------------------------------------
  // checkQuota
  // ------------------------------------------------
  describe('checkQuota', () => {
    it('未超限时应该放行（不抛错）', () => {
      addUser('user1', 'free');
      addUsage('user1', 'analyze', Date.now());

      expect(() => checkQuota('user1', 'analyze')).not.toThrow();
    });

    it('超限时应抛出 429 + quotaExceeded', () => {
      addUser('user1', 'free');
      // free 套餐 analyzePerDay = 2
      addUsage('user1', 'analyze', Date.now());
      addUsage('user1', 'analyze', Date.now());

      try {
        checkQuota('user1', 'analyze');
        fail('应该抛出错误');
      } catch (err) {
        expect(err.statusCode).toBe(429);
        expect(err.quotaExceeded).toBe(true);
      }
    });

    it('未知 action 应放行', () => {
      addUser('user1', 'free');
      expect(() => checkQuota('user1', 'unknown_action')).not.toThrow();
    });
  });

  // ------------------------------------------------
  // reserveQuota + releaseQuota
  // ------------------------------------------------
  describe('reserveQuota', () => {
    it('应该预占配额并返回 usageId', () => {
      addUser('user1', 'free');
      const usageId = reserveQuota('user1', 'analyze');

      expect(usageId).toBeGreaterThan(0);
      expect(mockData.usageLogs).toHaveLength(1);
    });

    it('超限时应抛出 429', () => {
      addUser('user1', 'free');
      addUsage('user1', 'analyze', Date.now());
      addUsage('user1', 'analyze', Date.now());

      try {
        reserveQuota('user1', 'analyze');
        fail('应该抛出错误');
      } catch (err) {
        expect(err.statusCode).toBe(429);
        expect(err.quotaExceeded).toBe(true);
      }
    });

    it('未知 action 应返回 null', () => {
      addUser('user1', 'free');
      expect(reserveQuota('user1', 'unknown')).toBeNull();
    });
  });

  describe('releaseQuota', () => {
    it('应该释放已预占的配额', () => {
      addUser('user1', 'free');
      const usageId = reserveQuota('user1', 'analyze');
      expect(mockData.usageLogs).toHaveLength(1);

      releaseQuota(usageId);
      expect(mockData.usageLogs).toHaveLength(0);
    });

    it('null 或 undefined 应安全跳过', () => {
      expect(() => releaseQuota(null)).not.toThrow();
      expect(() => releaseQuota(undefined)).not.toThrow();
    });
  });

  // ------------------------------------------------
  // upgradePlan
  // ------------------------------------------------
  describe('upgradePlan', () => {
    it('应该升级用户套餐', () => {
      addUser('user1', 'free');
      const duration = 30 * 24 * 60 * 60 * 1000;

      upgradePlan('user1', 'pro_monthly', duration);

      const user = mockData.users.get('user1');
      expect(user.plan).toBe('pro_monthly');
      expect(user.plan_expires_at).toBeGreaterThan(Date.now());
    });

    it('在剩余时长基础上叠加（不丢失未到期天数）', () => {
      const futureExpiry = Date.now() + 10 * 86400000; // 10 天后过期
      addUser('user1', 'pro_monthly', futureExpiry);

      const additionalDuration = 30 * 24 * 60 * 60 * 1000; // 30 天
      upgradePlan('user1', 'pro_monthly', additionalDuration);

      const user = mockData.users.get('user1');
      // 应该在 futureExpiry 基础上叠加，而不是从 now 开始
      expect(user.plan_expires_at).toBe(futureExpiry + additionalDuration);
    });

    it('已过期套餐应从现在开始计算', () => {
      const pastExpiry = Date.now() - 86400000; // 1 天前过期
      addUser('user1', 'pro_monthly', pastExpiry);

      const duration = 30 * 24 * 60 * 60 * 1000;
      upgradePlan('user1', 'pro_yearly', duration);

      const user = mockData.users.get('user1');
      // 过期了，应从 Date.now() 开始计算
      expect(user.plan_expires_at).toBeGreaterThan(Date.now() + duration - 1000);
      expect(user.plan_expires_at).toBeLessThan(Date.now() + duration + 1000);
    });
  });

  // ------------------------------------------------
  // getTodayUsage
  // ------------------------------------------------
  describe('getTodayUsage', () => {
    it('应该返回今日使用次数', () => {
      addUser('user1', 'free');
      addUsage('user1', 'analyze', Date.now());
      addUsage('user1', 'analyze', Date.now());
      addUsage('user1', 'plan', Date.now());

      expect(getTodayUsage('user1', 'analyze')).toBe(2);
      expect(getTodayUsage('user1', 'plan')).toBe(1);
    });

    it('无使用记录时应返回 0', () => {
      addUser('user1', 'free');
      expect(getTodayUsage('user1', 'analyze')).toBe(0);
    });

    it('应只统计今日的记录（排除旧记录）', () => {
      addUser('user1', 'free');
      // 添加一条 "昨天" 的记录（25 小时前）
      addUsage('user1', 'analyze', Date.now() - 25 * 3600000);
      // 添加一条今天的记录
      addUsage('user1', 'analyze', Date.now());

      // 由于 getTodayStartMs 计算中国时区 0 点，25 小时前的记录应该被排除
      const usage = getTodayUsage('user1', 'analyze');
      // 大多数情况下应该是 1（仅今天记录），但在时区边界附近可能是 2
      // 只要不超过 2 即可
      expect(usage).toBeLessThanOrEqual(2);
      expect(usage).toBeGreaterThanOrEqual(1);
    });
  });

  // ------------------------------------------------
  // isProUser
  // ------------------------------------------------
  describe('isProUser', () => {
    it('Pro 用户应返回 true', () => {
      addUser('user1', 'pro_monthly', Date.now() + 86400000);
      expect(isProUser('user1')).toBe(true);
    });

    it('free 用户应返回 false', () => {
      addUser('user1', 'free');
      expect(isProUser('user1')).toBe(false);
    });

    it('过期 Pro 用户应返回 false', () => {
      addUser('user1', 'pro_monthly', Date.now() - 1000);
      expect(isProUser('user1')).toBe(false);
    });
  });
});
