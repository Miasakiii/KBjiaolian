import crypto from 'crypto';
import db from './database.js';
import { PLANS, upgradePlan } from './subscription.js';
import {
  isWechatPayConfigured,
  createJsapiOrder,
  createAppOrder,
} from './wechatpay.js';

// === 订单管理 ===

const stmts = {
  createOrder: db.prepare(`
    INSERT INTO orders (id, user_id, plan, amount, status, created_at)
    VALUES (?, ?, ?, ?, 'pending', ?)
  `),
  getOrderById: db.prepare('SELECT * FROM orders WHERE id = ?'),
  getOrderByTradeNo: db.prepare('SELECT * FROM orders WHERE trade_no = ?'),
  getUserOrders: db.prepare(`
    SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC LIMIT 20
  `),
  // 带 WHERE status='pending' 的更新：避免并发重复支付，依赖 SQLite 行锁
  updateOrderStatusIfPending: db.prepare(`
    UPDATE orders SET status = ?, trade_no = ?, paid_at = ? WHERE id = ? AND status = 'pending'
  `),
  closeExpired: db.prepare(`
    UPDATE orders SET status = 'failed' WHERE status = 'pending' AND created_at < ?
  `),
  getPendingOrder: db.prepare(`
    SELECT * FROM orders WHERE user_id = ? AND status = 'pending' AND created_at > ?
  `),
};

/**
 * 生成订单 ID（KB 前缀 + 时间戳 + 短随机，便于人眼识别；内部熵由 crypto 提供）
 */
function generateOrderId() {
  const now = Date.now().toString(36).toUpperCase();
  const rand = crypto.randomBytes(4).toString('hex').toUpperCase().substring(0, 4);
  return `KB${now}${rand}`;
}

/**
 * 创建订单
 */
export function createOrder(userId, planId) {
  const plan = PLANS[planId];
  if (!plan || planId === 'free') {
    const err = new Error('无效的套餐');
    err.statusCode = 400;
    throw err;
  }

  // 检查是否有未完成的同类型订单（5 分钟内）
  const fiveMinAgo = Date.now() - 5 * 60 * 1000;
  const pending = stmts.getPendingOrder.get(userId, fiveMinAgo);
  if (pending && pending.plan === planId) {
    return pending; // 复用未完成订单
  }

  const orderId = generateOrderId();
  const now = Date.now();

  stmts.createOrder.run(orderId, userId, planId, plan.price, now);

  return {
    id: orderId,
    userId,
    plan: planId,
    amount: plan.price,
    status: 'pending',
    created_at: now,
  };
}

/**
 * 获取订单详情
 */
export function getOrder(orderId) {
  return stmts.getOrderById.get(orderId);
}

/**
 * 获取用户订单列表
 */
export function getUserOrders(userId) {
  return stmts.getUserOrders.all(userId);
}

/**
 * 完成订单（支付成功后调用）—— 使用事务保证原子性，并通过 WHERE status='pending' 防止并发重复支付
 */
export function completeOrder(orderId, tradeNo) {
  return db.transaction(() => {
    const order = stmts.getOrderById.get(orderId);
    if (!order) {
      const err = new Error('订单不存在');
      err.statusCode = 404;
      throw err;
    }

    if (order.status === 'paid') {
      return order; // 已处理，幂等返回
    }

    if (order.status !== 'pending') {
      const err = new Error('订单状态异常');
      err.statusCode = 400;
      throw err;
    }

    const now = Date.now();
    const result = stmts.updateOrderStatusIfPending.run('paid', tradeNo, now, orderId);

    // 并发场景：另一个事务已更新了状态
    if (result.changes === 0) {
      const fresh = stmts.getOrderById.get(orderId);
      if (fresh && fresh.status === 'paid') return fresh;
      const err = new Error('订单状态异常');
      err.statusCode = 400;
      throw err;
    }

    // 升级用户套餐
    const durationMs = order.plan === 'pro_monthly'
      ? 30 * 24 * 60 * 60 * 1000   // 30 天
      : 365 * 24 * 60 * 60 * 1000;  // 365 天

    upgradePlan(order.user_id, order.plan, durationMs);

    return { ...order, status: 'paid', trade_no: tradeNo, paid_at: now };
  })();
}

/**
 * 关闭过期订单（超过 30 分钟未支付）
 */
export function closeExpiredOrders() {
  const thirtyMinAgo = Date.now() - 30 * 60 * 1000;
  stmts.closeExpired.run(thirtyMinAgo);
}

/**
 * 获取订单支付参数（异步 — 真实微信支付或 mock）
 *
 * @param {object} order - 订单对象
 * @param {string} platform - 支付平台: 'miniapp'（小程序）| 'app'（App）
 * @param {string} [openid] - 用户 openid（JSAPI 支付必填）
 * @returns {Promise<object>} 支付参数
 */
export async function generatePaymentParams(order, platform = 'miniapp', openid) {
  const planName = PLANS[order.plan]?.name || order.plan;
  const description = `KB教练 ${planName}`;

  // Mock 模式（开发环境）
  if (!isWechatPayConfigured()) {
    return {
      orderId: order.id,
      amount: order.amount,
      amountYuan: (order.amount / 100).toFixed(2),
      planName,
      platform,
      // 开发环境返回 mock 支付地址
      ...(process.env.NODE_ENV !== 'production' && {
        mockPayUrl: `/api/payment/mock-pay/${order.id}`,
      }),
    };
  }

  // 真实微信支付
  try {
    if (platform === 'miniapp') {
      if (!openid) {
        throw new Error('小程序支付需要 openid');
      }
      const paymentParams = await createJsapiOrder({
        orderId: order.id,
        amount: order.amount,
        description,
        openid,
      });
      return {
        orderId: order.id,
        amount: order.amount,
        amountYuan: (order.amount / 100).toFixed(2),
        planName,
        platform: 'miniapp',
        ...paymentParams,
      };
    }

    if (platform === 'app') {
      const paymentParams = await createAppOrder({
        orderId: order.id,
        amount: order.amount,
        description,
      });
      return {
        orderId: order.id,
        amount: order.amount,
        amountYuan: (order.amount / 100).toFixed(2),
        planName,
        platform: 'app',
        ...paymentParams,
      };
    }

    throw new Error(`不支持的支付平台: ${platform}`);
  } catch (err) {
    console.error('生成支付参数失败:', err.message);
    throw err;
  }
}
