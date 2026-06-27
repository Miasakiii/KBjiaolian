import express from 'express';
import type { Express } from 'express';
import logger from './logger.js';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { analyzePhoto, compareAnalysis } from './analyze.js';
import { generatePlan } from './plan.js';
import { extractExercisePerformance, calculateProgression, buildProgressionPrompt, getProgressionSummary } from './progression.js';
import { analyzeFood } from './nutrition.js';
import { sendMessage, sendMessageStream } from './chat.js';
import { register, login, wechatLogin, getProfile, forgotPassword, resetPassword, sendVerificationCode, authMiddleware } from './auth.js';
import {
  saveAnalysisRecord,
  getAnalysisRecords,
  deleteAnalysisRecord,
  deleteAllAnalysisRecords,
  savePlan,
  getPlans,
  deletePlanRecord,
  deleteAllPlanRecords,
  saveWorkoutRecord,
  getWorkoutRecords,
  deleteWorkoutRecord,
  deleteAllWorkoutRecords,
  saveNutritionRecord,
  getNutritionRecords,
  deleteNutritionRecord,
  deleteAllNutritionRecords,
  saveChatMessage,
  getChatHistory,
  deleteChatHistory,
  getAnalysisRecordById,
  getWorkoutRecordsRaw,
} from './data.js';
import { getQuotaStatus, checkQuota, logUsage, reserveQuota, releaseQuota, PLANS } from './subscription.js';
import { createOrder, getOrder, getUserOrders, completeOrder, generatePaymentParams, closeExpiredOrders } from './orders.js';
import { verifyCallbackSignature, decryptNotification } from './wechatpay.js';
import {
  isValidBase64Image,
  isValidGoal,
  isValidExperience,
  isValidEquipment,
  isValidDaysPerWeek,
  isValidSessionDuration,
  isValidChatMessage,
  isValidChatHistory,
  sanitizeString,
} from './validation.js';
import type { AppError, PlanConfig, PlanParams, AnalysisResult } from './types.js';

// 全局兜底未处理的 Promise rejection 与未捕获异常，避免进程崩溃
process.on('unhandledRejection', (reason) => {
  logger.error({ reason }, 'Unhandled Rejection');
});
process.on('uncaughtException', (err) => {
  logger.error({ err }, 'Uncaught Exception');
});

// 定时清理过期订单（每 5 分钟）
setInterval(() => {
  try { closeExpiredOrders(); } catch (err) { logger.error({ err }, '清理过期订单失败'); }
}, 5 * 60 * 1000).unref();

export function createApp(): Express {
  const app = express();

  // 信任反向代理（Nginx / Docker 网络），以便正确获取客户端 IP
  app.set('trust proxy', 1);

  // CORS：从环境变量读取，支持逗号分隔多域名；生产环境未配置则禁用跨域
  let corsOrigin: string[] | boolean;
  if (process.env.CORS_ORIGIN) {
    corsOrigin = process.env.CORS_ORIGIN.split(',').map(s => s.trim());
  } else if (process.env.NODE_ENV === 'production') {
    corsOrigin = false; // 生产环境默认不允许跨域
  } else {
    corsOrigin = ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'];
  }
  app.use(cors({
    origin: corsOrigin,
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  }));
  app.use(express.json({ limit: '10mb' }));

  // === 速率限制 ===

  const generalLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 60,
    message: { error: '请求过于频繁，请稍后再试' },
    standardHeaders: true,
    legacyHeaders: false,
  });

  const authLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    message: { error: '登录尝试过于频繁，请稍后再试' },
    standardHeaders: true,
    legacyHeaders: false,
  });

  const aiLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 20,
    message: { error: 'AI 请求过于频繁，请稍后再试' },
    standardHeaders: true,
    legacyHeaders: false,
    // 使用 userId 限流，避免 IPv6 警告
    validate: { keyGeneratorIpFallback: false },
    keyGenerator: (req) => req.userId || req.ip || '',
  });

  app.use(generalLimiter);

  // === 公开端点 ===

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.post('/api/auth/register', authLimiter, register);
  app.post('/api/auth/login', authLimiter, login);
  app.post('/api/auth/send-code', authLimiter, sendVerificationCode);
  app.post('/api/auth/wechat-login', authLimiter, wechatLogin);

  // === 需要认证的端点 ===

  app.get('/api/auth/profile', authMiddleware, getProfile);
  app.post('/api/auth/forgot-password', authLimiter, forgotPassword);
  app.post('/api/auth/reset-password', authLimiter, resetPassword);

  // 配额查询
  app.get('/api/quota', authMiddleware, (req, res) => {
    try {
      const quota = getQuotaStatus(req.userId!);
      res.json(quota);
    } catch (err) {
      logger.error({ err }, '查询配额失败');
      res.status(500).json({ error: '查询配额失败' });
    }
  });

  // 套餐信息（公开）
  app.get('/api/plans', (_req, res) => {
    res.json(PLANS);
  });

  // 创建订单（仅创建，不生成支付参数）
  app.post('/api/orders', authMiddleware, (req, res) => {
    try {
      const { plan } = req.body;
      if (!plan || !(PLANS as Record<string, PlanConfig>)[plan] || plan === 'free') {
        return res.status(400).json({ error: '请选择有效的套餐' });
      }

      const order = createOrder(req.userId!, plan);

      res.json({
        order: {
          id: order.id,
          plan: order.plan,
          amount: order.amount,
          amountYuan: (order.amount / 100).toFixed(2),
          planName: (PLANS as Record<string, PlanConfig>)[order.plan]?.name,
          status: order.status,
        },
      });
    } catch (err) {
      logger.error({ err }, '创建订单失败');
      if ((err as AppError).statusCode) {
        return res.status((err as AppError).statusCode ?? 500).json({ error: (err as AppError).message });
      }
      res.status(500).json({ error: '创建订单失败' });
    }
  });

  // 获取支付参数（创建订单后调用，需指定平台）
  app.post('/api/orders/:id/pay', authMiddleware, async (req, res) => {
    try {
      const { platform, openid } = req.body;
      const order = getOrder(req.params.id as string);

      if (!order || order.user_id !== req.userId!) {
        return res.status(404).json({ error: '订单不存在' });
      }
      if (order.status !== 'pending') {
        return res.status(400).json({ error: '订单已支付或已关闭' });
      }
      if (!platform || !['miniapp', 'app'].includes(platform)) {
        return res.status(400).json({ error: '请指定支付平台: miniapp 或 app' });
      }

      const paymentParams = await generatePaymentParams(order, platform, openid);
      res.json({ payment: paymentParams });
    } catch (err) {
      logger.error({ err }, '获取支付参数失败');
      if ((err as AppError).statusCode) {
        return res.status((err as AppError).statusCode ?? 500).json({ error: (err as AppError).message });
      }
      res.status(500).json({ error: '获取支付参数失败' });
    }
  });

  // 查询订单状态
  app.get('/api/orders/:id', authMiddleware, (req, res) => {
    try {
      const order = getOrder(req.params.id as string);
      if (!order || order.user_id !== req.userId!) {
        return res.status(404).json({ error: '订单不存在' });
      }
      res.json({
        id: order.id,
        plan: order.plan,
        amount: order.amount,
        amountYuan: (order.amount / 100).toFixed(2),
        planName: (PLANS as Record<string, PlanConfig>)[order.plan]?.name,
        status: order.status,
        paid_at: order.paid_at,
        created_at: order.created_at,
      });
    } catch (err) {
      logger.error({ err }, '查询订单失败');
      res.status(500).json({ error: '查询订单失败' });
    }
  });

  // 用户订单列表
  app.get('/api/orders', authMiddleware, (req, res) => {
    try {
      const orders = getUserOrders(req.userId!);
      res.json(orders.map(o => ({
        id: o.id,
        plan: o.plan,
        amount: o.amount,
        amountYuan: (o.amount / 100).toFixed(2),
        planName: (PLANS as Record<string, PlanConfig>)[o.plan]?.name,
        status: o.status,
        paid_at: o.paid_at,
        created_at: o.created_at,
      })));
    } catch (err) {
      logger.error({ err }, '查询订单列表失败');
      res.status(500).json({ error: '查询订单列表失败' });
    }
  });

  // 模拟支付（仅开发/测试环境，生产环境必须使用真实支付回调）
  if (process.env.NODE_ENV !== 'production') {
    app.post('/api/payment/mock-pay/:orderId', authMiddleware, (req, res) => {
      try {
        const order = getOrder(req.params.orderId as string);
        if (!order || order.user_id !== req.userId!) {
          return res.status(404).json({ error: '订单不存在' });
        }
        if (order.status !== 'pending') {
          return res.status(400).json({ error: '订单状态异常' });
        }

        const result = completeOrder(order.id, `MOCK_${Date.now()}`);
        res.json({
          message: '支付成功',
          order: {
            id: result.id,
            plan: result.plan,
            status: result.status,
            paid_at: result.paid_at,
          },
        });
      } catch (err) {
        logger.error({ err }, '模拟支付失败');
        if ((err as AppError).statusCode) {
          return res.status((err as AppError).statusCode ?? 500).json({ error: (err as AppError).message });
        }
        res.status(500).json({ error: '支付失败' });
      }
    });
  }

  // 微信支付回调（生产环境）
  app.post('/api/payment/wechat/notify', express.raw({ type: 'application/json' }), (req, res) => {
    try {
      const bodyStr = req.body.toString('utf8');

      // 验证签名
      if (!verifyCallbackSignature(req.headers as Record<string, string | undefined>, bodyStr)) {
        logger.error('微信支付回调签名验证失败');
        return res.status(401).json({ code: 'FAIL', message: '签名验证失败' });
      }

      // 解析通知体
      const notification = JSON.parse(bodyStr);

      if (notification.event_type === 'TRANSACTION.SUCCESS') {
        // 解密支付结果
        const result = decryptNotification(notification.resource);
        const { out_trade_no, transaction_id, trade_state, amount } = result as { out_trade_no: string; transaction_id: string; trade_state: string; amount?: { total?: number } };

        logger.info({ out_trade_no, transaction_id, trade_state }, '微信支付通知');

        if (trade_state === 'SUCCESS') {
          // 校验金额（防止篡改）
          const order = getOrder(out_trade_no);
          if (order && amount && amount.total !== order.amount) {
            logger.error({ order_amount: order.amount, callback_amount: amount.total }, '微信支付金额不匹配');
            return res.status(400).json({ code: 'FAIL', message: '金额不匹配' });
          }

          // 完成订单（幂等）
          completeOrder(out_trade_no, transaction_id);
          logger.info({ out_trade_no }, '订单支付成功，套餐已升级');
        }
      }

      // 必须返回 200 + SUCCESS，否则微信会重复通知
      res.json({ code: 'SUCCESS', message: '成功' });
    } catch (err) {
      logger.error({ err }, '微信支付回调处理失败');
      res.status(500).json({ code: 'FAIL', message: '处理失败' });
    }
  });

  // 体态分析
  app.post('/api/analyze', authMiddleware, aiLimiter, async (req, res) => {
    try {
      const { image } = req.body;

      if (!image) {
        return res.status(400).json({ error: '请提供图片数据' });
      }
      if (!isValidBase64Image(image)) {
        return res.status(400).json({ error: '图片格式不正确，请上传 JPG 或 PNG 格式' });
      }

      // 预占配额，避免并发请求绕过配额（TOCTOU）
      let usageId: number | null = null;
      try {
        usageId = reserveQuota(req.userId!, 'analyze');
      } catch (err) {
        if ((err as AppError).quotaExceeded) {
          return res.status(429).json({ error: (err as AppError).message, quotaExceeded: true });
        }
        throw err;
      }

      try {
        const result = await analyzePhoto(image);
        res.json(result);
      } catch (err) {
        releaseQuota(usageId); // AI 调用失败，补偿释放
        throw err;
      }
    } catch (err) {
      logger.error({ err }, '分析失败');
      res.status(500).json({ error: '分析失败，请稍后重试' });
    }
  });

  // 前后对比分析
  app.post('/api/analyze/compare', authMiddleware, aiLimiter, async (req, res) => {
    try {
      const { beforeId, afterId } = req.body;

      if (!beforeId || !afterId) {
        return res.status(400).json({ error: '请提供两次分析记录的 ID' });
      }

      const beforeRecord = getAnalysisRecordById(req.userId!, beforeId);
      const afterRecord = getAnalysisRecordById(req.userId!, afterId);

      if (!beforeRecord || !afterRecord) {
        return res.status(404).json({ error: '分析记录不存在' });
      }

      const safeParse = (s: string | null, fallback: unknown) => {
        try { return JSON.parse(s ?? JSON.stringify(fallback)); } catch { return fallback; }
      };

      const beforeResult = {
        score: Number(beforeRecord.score) || 0,
        issues: Array.isArray(safeParse(beforeRecord.issues, [])) ? safeParse(beforeRecord.issues, []) : [],
        radar: safeParse(beforeRecord.radar, {}),
      };
      const afterResult = {
        score: Number(afterRecord.score) || 0,
        issues: Array.isArray(safeParse(afterRecord.issues, [])) ? safeParse(afterRecord.issues, []) : [],
        radar: safeParse(afterRecord.radar, {}),
      };

      const comparison = await compareAnalysis(beforeResult as AnalysisResult, afterResult as AnalysisResult);
      res.json({
        ...comparison,
        beforeDate: beforeRecord.created_at,
        afterDate: afterRecord.created_at
      });
    } catch (err) {
      logger.error({ err }, '对比分析失败');
      res.status(500).json({ error: '对比分析失败，请稍后重试' });
    }
  });

  // 训练方案生成
  app.post('/api/plan/generate', authMiddleware, aiLimiter, async (req, res) => {
    try {
      const { goal, experience, equipment, daysPerWeek, sessionDuration, analysisResult } = req.body;

      if (!analysisResult) {
        return res.status(400).json({ error: '请提供体态分析结果' });
      }

      const params: PlanParams = {
        goal: isValidGoal(goal) ? goal : 'posture_fix',
        experience: isValidExperience(experience) ? experience : 'beginner',
        equipment: isValidEquipment(equipment) ? equipment : 'bodyweight',
        daysPerWeek: isValidDaysPerWeek(daysPerWeek) ? Number(daysPerWeek) : 4,
        sessionDuration: isValidSessionDuration(sessionDuration) ? Number(sessionDuration) : 60,
      };

      let usageId;
      try {
        usageId = reserveQuota(req.userId!, 'plan');
      } catch (err) {
        if ((err as AppError).quotaExceeded) {
          return res.status(429).json({ error: (err as AppError).message, quotaExceeded: true });
        }
        throw err;
      }

      try {
        const plan = await generatePlan(params, analysisResult);
        res.json(plan);
      } catch (err) {
        releaseQuota(usageId);
        throw err;
      }
    } catch (err) {
      logger.error({ err }, '生成训练方案失败');
      res.status(500).json({ error: '生成训练方案失败，请稍后重试' });
    }
  });

  // 渐进式训练方案（基于历史数据）
  app.post('/api/plan/progressive', authMiddleware, aiLimiter, async (req, res) => {
    try {
      const { goal, experience, equipment, daysPerWeek, sessionDuration, analysisResult } = req.body;

      if (!analysisResult) {
        return res.status(400).json({ error: '请提供体态分析结果' });
      }

      const workoutHistory = getWorkoutRecordsRaw(req.userId!, 20);

      const performance = extractExercisePerformance(workoutHistory);
      const progression = calculateProgression(performance, { experience });
      const progressionPrompt = buildProgressionPrompt(progression);
      const progressionSummary = getProgressionSummary(progression);

      const params: PlanParams = {
        goal: isValidGoal(goal) ? goal : 'posture_fix',
        experience: isValidExperience(experience) ? experience : 'beginner',
        equipment: isValidEquipment(equipment) ? equipment : 'bodyweight',
        daysPerWeek: isValidDaysPerWeek(daysPerWeek) ? Number(daysPerWeek) : 4,
        sessionDuration: isValidSessionDuration(sessionDuration) ? Number(sessionDuration) : 60,
      };

      let usageId;
      try {
        usageId = reserveQuota(req.userId!, 'plan');
      } catch (err) {
        if ((err as AppError).quotaExceeded) {
          return res.status(429).json({ error: (err as AppError).message, quotaExceeded: true });
        }
        throw err;
      }

      try {
        const plan = await generatePlan(params, analysisResult, progressionPrompt);
        res.json({
          ...plan,
          progression: progressionSummary,
          hasHistory: workoutHistory.length > 0,
          historyCount: workoutHistory.length,
        });
      } catch (err) {
        releaseQuota(usageId);
        throw err;
      }
    } catch (err) {
      logger.error({ err }, '渐进式方案生成失败');
      res.status(500).json({ error: '生成训练方案失败，请稍后重试' });
    }
  });

  // 获取训练建议（不生成方案，只看渐进式建议）
  app.get('/api/plan/progression', authMiddleware, (req, res) => {
    try {
      const experience = isValidExperience(req.query.experience) ? String(req.query.experience) : 'beginner';
      const workoutHistory = getWorkoutRecordsRaw(req.userId!, 20);

      const performance = extractExercisePerformance(workoutHistory);
      const progression = calculateProgression(performance, { experience });
      const summary = getProgressionSummary(progression);

      res.json({
        summary,
        exerciseCount: Object.keys(performance).length,
        totalSessions: workoutHistory.length,
      });
    } catch (err) {
      logger.error({ err }, '获取训练建议失败');
      res.status(500).json({ error: '获取训练建议失败' });
    }
  });

  // 饮食识别
  app.post('/api/nutrition/analyze', authMiddleware, aiLimiter, async (req, res) => {
    try {
      const { image } = req.body;

      if (!image) {
        return res.status(400).json({ error: '请提供食物图片数据' });
      }
      if (!isValidBase64Image(image)) {
        return res.status(400).json({ error: '图片格式不正确，请上传 JPG 或 PNG 格式' });
      }

      let usageId;
      try {
        usageId = reserveQuota(req.userId!, 'nutrition');
      } catch (err) {
        if ((err as AppError).quotaExceeded) {
          return res.status(429).json({ error: (err as AppError).message, quotaExceeded: true });
        }
        throw err;
      }

      try {
        const result = await analyzeFood(image);
        res.json(result);
      } catch (err) {
        releaseQuota(usageId);
        throw err;
      }
    } catch (err) {
      logger.error({ err }, '食物识别失败');
      res.status(500).json({ error: '食物识别失败，请稍后重试' });
    }
  });

  // AI 对话
  app.post('/api/chat', authMiddleware, aiLimiter, async (req, res) => {
    try {
      const { message, history } = req.body;

      if (!message) {
        return res.status(400).json({ error: '请提供消息内容' });
      }
      if (!isValidChatMessage(message)) {
        return res.status(400).json({ error: '消息内容不合法或过长' });
      }
      if (history && !isValidChatHistory(history)) {
        return res.status(400).json({ error: '聊天历史格式不正确' });
      }

      // 保存用户消息
      let usageId;
      try {
        usageId = reserveQuota(req.userId!, 'chat');
      } catch (err) {
        if ((err as AppError).quotaExceeded) {
          return res.status(429).json({ error: (err as AppError).message, quotaExceeded: true });
        }
        throw err;
      }

      saveChatMessage(req.userId!, 'user', message);

      try {
        const reply = await sendMessage(message, history || []);
        saveChatMessage(req.userId!, 'assistant', reply);
        res.json({ reply });
      } catch (err) {
        releaseQuota(usageId);
        throw err;
      }
    } catch (err) {
      logger.error({ err }, 'AI 对话失败');
      res.status(500).json({ error: 'AI 对话失败，请稍后重试' });
    }
  });

  // 流式响应端点
  app.post('/api/chat/stream', authMiddleware, aiLimiter, async (req, res) => {
    let headersSent = false;
    let usageId;
    const abortController = new AbortController();

    // 客户端断开时取消上游 AI 请求，避免连接泄漏
    const onAbort = () => abortController.abort();
    req.on('close', onAbort);

    try {
      const { message, history } = req.body;

      if (!message || !isValidChatMessage(message)) {
        return res.status(400).json({ error: '消息内容不合法或过长' });
      }

      // 预占配额
      try {
        usageId = reserveQuota(req.userId!, 'chat');
      } catch (err) {
        if ((err as AppError).quotaExceeded) {
          return res.status(429).json({ error: (err as AppError).message, quotaExceeded: true });
        }
        throw err;
      }

      saveChatMessage(req.userId!, 'user', message);

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      headersSent = true;

      const stream = await sendMessageStream(message, history || [], abortController.signal);
      let fullReply = '';

      if (stream) {
        const reader = stream.getReader();
        const decoder = new TextDecoder();

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value!);
            const lines = chunk.split('\n').filter(line => line.trim() !== '');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') {
                  res.write('data: [DONE]\n\n');
                } else {
                  try {
                    const parsed = JSON.parse(data);
                    const content = parsed.choices?.[0]?.delta?.content;
                    if (content) {
                      fullReply += content;
                      res.write(`data: ${JSON.stringify({ content })}\n\n`);
                    }
                  } catch (e) {
                    // 忽略解析错误
                  }
                }
              }
            }
          }
        } finally {
          reader.releaseLock?.();
        }
      }

      // 保存完整的 AI 回复
      if (fullReply) {
        saveChatMessage(req.userId!, 'assistant', fullReply);
      }

      res.end();
    } catch (err) {
      // AI 流式失败：补偿释放配额
      if (usageId) releaseQuota(usageId);
      logger.error({ err }, '流式对话失败');
      if (headersSent) {
        // 响应头已发送，无法改 status，仅能写入错误事件后结束
        try {
          res.write(`data: ${JSON.stringify({ error: '对话失败' })}\n\n`);
        } catch (_) { /* socket 已关闭 */ }
        res.end();
      } else {
        res.status(500).json({ error: '对话失败' });
      }
    } finally {
      req.off('close', onAbort);
      // 兜底取消上游
      abortController.abort();
    }
  });

  // === 数据持久化 API ===

  // 分析记录
  app.post('/api/data/analysis', authMiddleware, saveAnalysisRecord);
  app.get('/api/data/analysis', authMiddleware, getAnalysisRecords);
  app.delete('/api/data/analysis/:id', authMiddleware, deleteAnalysisRecord);
  app.delete('/api/data/analysis', authMiddleware, deleteAllAnalysisRecords);

  // 训练方案
  app.post('/api/data/plans', authMiddleware, savePlan);
  app.get('/api/data/plans', authMiddleware, getPlans);
  app.delete('/api/data/plans/:id', authMiddleware, deletePlanRecord);
  app.delete('/api/data/plans', authMiddleware, deleteAllPlanRecords);

  // 训练记录
  app.post('/api/data/workouts', authMiddleware, saveWorkoutRecord);
  app.get('/api/data/workouts', authMiddleware, getWorkoutRecords);
  app.delete('/api/data/workouts/:id', authMiddleware, deleteWorkoutRecord);
  app.delete('/api/data/workouts', authMiddleware, deleteAllWorkoutRecords);

  // 饮食记录
  app.post('/api/data/nutrition', authMiddleware, saveNutritionRecord);
  app.get('/api/data/nutrition', authMiddleware, getNutritionRecords);
  app.delete('/api/data/nutrition/:id', authMiddleware, deleteNutritionRecord);
  app.delete('/api/data/nutrition', authMiddleware, deleteAllNutritionRecords);

  // 聊天历史
  app.get('/api/data/chat', authMiddleware, getChatHistory);
  app.delete('/api/data/chat', authMiddleware, deleteChatHistory);

  return app;
}
