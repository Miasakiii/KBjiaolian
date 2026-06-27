import crypto from 'crypto';
import db from './database.js';
import logger from './logger.js';
import { PLANS, upgradePlan } from './subscription.js';
import {
  isWechatPayConfigured,
  createJsapiOrder,
  createAppOrder,
} from './wechatpay.js';
import type { OrderRow, AppError, PlanConfig } from './types.js';

// === Order management ===

const stmts = {
  createOrder: db.prepare(`
    INSERT INTO orders (id, user_id, plan, amount, status, created_at)
    VALUES (?, ?, ?, ?, 'pending', ?)
  `),
  getOrderById: db.prepare<unknown[], OrderRow>('SELECT * FROM orders WHERE id = ?'),
  getOrderByTradeNo: db.prepare<unknown[], OrderRow>('SELECT * FROM orders WHERE trade_no = ?'),
  getUserOrders: db.prepare<unknown[], OrderRow>(`
    SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC LIMIT 20
  `),
  updateOrderStatusIfPending: db.prepare(`
    UPDATE orders SET status = ?, trade_no = ?, paid_at = ? WHERE id = ? AND status = 'pending'
  `),
  closeExpired: db.prepare(`
    UPDATE orders SET status = 'failed' WHERE status = 'pending' AND created_at < ?
  `),
  getPendingOrder: db.prepare<unknown[], OrderRow>(`
    SELECT * FROM orders WHERE user_id = ? AND status = 'pending' AND created_at > ?
  `),
};

function generateOrderId(): string {
  const now = Date.now().toString(36).toUpperCase();
  const rand = crypto.randomBytes(4).toString('hex').toUpperCase().substring(0, 4);
  return `KB${now}${rand}`;
}

type CreateOrderResult = OrderRow | { id: string; userId: string; plan: string; amount: number; status: string; created_at: number };

export function createOrder(userId: string, planId: string): CreateOrderResult {
  const plan = (PLANS as Record<string, PlanConfig>)[planId];
  if (!plan || planId === 'free') {
    const err = new Error('无效的套餐') as AppError;
    err.statusCode = 400;
    throw err;
  }
  const fiveMinAgo = Date.now() - 5 * 60 * 1000;
  const pending = stmts.getPendingOrder.get(userId, fiveMinAgo);
  if (pending && pending.plan === planId) {
    return pending;
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

export function getOrder(orderId: string): OrderRow | undefined {
  return stmts.getOrderById.get(orderId);
}

export function getUserOrders(userId: string): OrderRow[] {
  return stmts.getUserOrders.all(userId);
}

export function completeOrder(orderId: string, tradeNo: string): OrderRow {
  return db.transaction((): OrderRow => {
    const order = stmts.getOrderById.get(orderId);
    if (!order) {
      const err = new Error('订单不存在') as AppError;
      err.statusCode = 404;
      throw err;
    }
    if (order.status === 'paid') {
      return order;
    }
    if (order.status !== 'pending') {
      const err = new Error('订单状态异常') as AppError;
      err.statusCode = 400;
      throw err;
    }
    const now = Date.now();
    const result = stmts.updateOrderStatusIfPending.run('paid', tradeNo, now, orderId);
    if (result.changes === 0) {
      const fresh = stmts.getOrderById.get(orderId);
      if (fresh && fresh.status === 'paid') return fresh;
      const err = new Error('订单状态异常') as AppError;
      err.statusCode = 400;
      throw err;
    }
    const durationMs = order.plan === 'pro_monthly'
      ? 30 * 24 * 60 * 60 * 1000
      : 365 * 24 * 60 * 60 * 1000;
    upgradePlan(order.user_id, order.plan, durationMs);
    return { ...order, status: 'paid', trade_no: tradeNo, paid_at: now } as OrderRow;
  })();
}

export function closeExpiredOrders(): void {
  const thirtyMinAgo = Date.now() - 30 * 60 * 1000;
  stmts.closeExpired.run(thirtyMinAgo);
}

export async function generatePaymentParams(order: OrderRow, platform: string = 'miniapp', openid?: string): Promise<Record<string, unknown>> {
  const planName = (PLANS as Record<string, PlanConfig>)[order.plan]?.name || order.plan;
  const description = `KB教练 ${planName}`;
  if (!isWechatPayConfigured()) {
    return {
      orderId: order.id,
      amount: order.amount,
      amountYuan: (order.amount / 100).toFixed(2),
      planName,
      platform,
      ...(process.env.NODE_ENV !== 'production' && {
        mockPayUrl: `/api/payment/mock-pay/${order.id}`,
      }),
    };
  }
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
    const e = err as Error;
    logger.error({ err: e }, '生成支付参数失败');
    throw err;
  }
}
