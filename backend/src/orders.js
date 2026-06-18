import db from './database.js';
import { PLANS, upgradePlan } from './subscription.js';

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
  updateOrderStatus: db.prepare(`
    UPDATE orders SET status = ?, trade_no = ?, paid_at = ? WHERE id = ?
  `),
  getPendingOrder: db.prepare(`
    SELECT * FROM orders WHERE user_id = ? AND status = 'pending' AND created_at > ?
  `),
};

/**
 * 生成订单 ID
 */
function generateOrderId() {
  const now = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
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
 * 完成订单（支付成功后调用）
 */
export function completeOrder(orderId, tradeNo) {
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
  stmts.updateOrderStatus.run('paid', tradeNo, now, orderId);

  // 升级用户套餐
  const durationMs = order.plan === 'pro_monthly'
    ? 30 * 24 * 60 * 60 * 1000   // 30 天
    : 365 * 24 * 60 * 60 * 1000;  // 365 天

  upgradePlan(order.user_id, order.plan, durationMs);

  return { ...order, status: 'paid', trade_no: tradeNo, paid_at: now };
}

/**
 * 关闭过期订单（超过 30 分钟未支付）
 */
export function closeExpiredOrders() {
  const thirtyMinAgo = Date.now() - 30 * 60 * 1000;
  db.prepare(`
    UPDATE orders SET status = 'failed'
    WHERE status = 'pending' AND created_at < ?
  `).run(thirtyMinAgo);
}

/**
 * 生成微信支付 Native 预下单参数
 * 实际对接时替换为真正的微信支付 API 调用
 */
export function generatePaymentParams(order) {
  // TODO: 替换为真实的微信支付 API 调用
  // 这里返回模拟数据，前端展示二维码用
  return {
    orderId: order.id,
    amount: order.amount,
    amountYuan: (order.amount / 100).toFixed(2),
    planName: PLANS[order.plan]?.name || order.plan,
    // 生产环境：调用微信支付 Native 下单 API，获取 code_url
    codeUrl: `weixin://wxpay/bizpayurl?pr=${order.id.toLowerCase()}`,
    // 模拟支付回调（开发用）
    mockPayUrl: `/api/payment/mock-pay/${order.id}`,
  };
}
