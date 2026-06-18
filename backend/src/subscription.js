import db from './database.js';

// === 套餐配置 ===
export const PLANS = {
  free: {
    id: 'free',
    name: '免费版',
    price: 0,
    limits: {
      analyzePerDay: 2,      // 体态分析
      planPerDay: 1,          // 训练方案生成
      nutritionPerDay: 2,     // 饮食识别
      chatPerDay: 5,          // AI 对话
    },
    features: [
      '每日 2 次体态分析',
      '每日 1 次训练方案',
      '每日 2 次饮食识别',
      '每日 5 次 AI 对话',
    ],
  },
  pro_monthly: {
    id: 'pro_monthly',
    name: 'Pro 月度',
    price: 2990,  // ¥29.90/月（诱饵价格，让年度显得划算）
    limits: {
      analyzePerDay: 25,
      planPerDay: 10,
      nutritionPerDay: 25,
      chatPerDay: 100,
    },
    features: [
      '每日 25 次体态分析',
      '每日 10 次训练方案',
      '每日 25 次饮食识别',
      '每日 100 次 AI 对话',
      '渐进式超负荷训练',
      '前后对比分析',
      '详细恢复追踪',
      '数据导出 (PDF/CSV)',
      '优先响应',
    ],
  },
  pro_yearly: {
    id: 'pro_yearly',
    name: 'Pro 年度',
    price: 16800,  // ¥168.00/年（¥14/月，省 53%）
    limits: {
      analyzePerDay: 25,
      planPerDay: 10,
      nutritionPerDay: 25,
      chatPerDay: 100,
    },
    features: [
      '每日 25 次体态分析',
      '每日 10 次训练方案',
      '每日 25 次饮食识别',
      '每日 100 次 AI 对话',
      '渐进式超负荷训练',
      '前后对比分析',
      '详细恢复追踪',
      '数据导出 (PDF/CSV)',
      '优先响应',
    ],
  },
};

// AI 调用类型到限额 key 的映射
const ACTION_TO_LIMIT_KEY = {
  analyze: 'analyzePerDay',
  plan: 'planPerDay',
  nutrition: 'nutritionPerDay',
  chat: 'chatPerDay',
};

// 确保 usage_logs 表存在（必须在 prepared statements 之前）
db.exec(`
  CREATE TABLE IF NOT EXISTS usage_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    action TEXT NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );
  CREATE INDEX IF NOT EXISTS idx_usage_user_action ON usage_logs(user_id, action, created_at DESC);
`);

// === 预编译 SQL ===
const stmts = {
  getUserPlan: db.prepare('SELECT plan, plan_expires_at FROM users WHERE id = ?'),
  countTodayUsage: db.prepare(`
    SELECT COUNT(*) as count FROM usage_logs
    WHERE user_id = ? AND action = ? AND created_at > ?
  `),
  insertUsage: db.prepare(`
    INSERT INTO usage_logs (user_id, action, created_at) VALUES (?, ?, ?)
  `),
};

/**
 * 获取用户当前套餐
 * 如果 Pro 已过期，自动降级为 free
 */
export function getUserPlan(userId) {
  const row = stmts.getUserPlan.get(userId);
  if (!row) return 'free';

  const { plan, plan_expires_at } = row;

  // Pro 套餐过期检查
  if (plan !== 'free' && plan_expires_at && Date.now() > plan_expires_at) {
    db.prepare('UPDATE users SET plan = ?, plan_expires_at = NULL, updated_at = ? WHERE id = ?')
      .run('free', Date.now(), userId);
    return 'free';
  }

  return plan || 'free';
}

/**
 * 获取用户今日已用次数
 */
export function getTodayUsage(userId, action) {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const ts = todayStart.getTime();

  const row = stmts.countTodayUsage.get(userId, action, ts);
  return row?.count || 0;
}

/**
 * 获取用户配额状态
 * @returns {{ plan, limits, used, remaining }}
 */
export function getQuotaStatus(userId) {
  const plan = getUserPlan(userId);
  const planConfig = PLANS[plan] || PLANS.free;

  const usage = {};
  for (const [action, limitKey] of Object.entries(ACTION_TO_LIMIT_KEY)) {
    const used = getTodayUsage(userId, action);
    const limit = planConfig.limits[limitKey];
    usage[action] = {
      used,
      limit,
      remaining: Math.max(0, limit - used),
    };
  }

  return {
    plan,
    planName: planConfig.name,
    limits: planConfig.limits,
    usage,
  };
}

/**
 * 记录一次使用量
 */
export function logUsage(userId, action) {
  stmts.insertUsage.run(userId, action, Date.now());
}

/**
 * 检查是否还有剩余配额，没有则抛出错误
 */
export function checkQuota(userId, action) {
  const limitKey = ACTION_TO_LIMIT_KEY[action];
  if (!limitKey) return; // 未知 action，放行

  const plan = getUserPlan(userId);
  const planConfig = PLANS[plan] || PLANS.free;
  const limit = planConfig.limits[limitKey];
  const used = getTodayUsage(userId, action);

  if (used >= limit) {
    const err = new Error(`今日${getActionLabel(action)}次数已用完，升级 Pro 解锁更多`);
    err.statusCode = 429;
    err.quotaExceeded = true;
    err.action = action;
    throw err;
  }
}

/**
 * 检查 Pro 订阅是否有效
 */
export function isProUser(userId) {
  const plan = getUserPlan(userId);
  return plan !== 'free';
}

/**
 * 升级用户套餐
 */
export function upgradePlan(userId, planId, durationMs) {
  const expiresAt = Date.now() + durationMs;
  db.prepare('UPDATE users SET plan = ?, plan_expires_at = ?, updated_at = ? WHERE id = ?')
    .run(planId, expiresAt, Date.now(), userId);
}

function getActionLabel(action) {
  const labels = {
    analyze: '体态分析',
    plan: '训练方案生成',
    nutrition: '饮食识别',
    chat: 'AI 对话',
  };
  return labels[action] || action;
}
