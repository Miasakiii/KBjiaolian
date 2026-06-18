import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { analyzePhoto, compareAnalysis } from './analyze.js';
import { generatePlan } from './plan.js';
import { extractExercisePerformance, calculateProgression, buildProgressionPrompt, getProgressionSummary } from './progression.js';
import { analyzeFood } from './nutrition.js';
import { sendMessage, sendMessageStream } from './chat.js';
import { register, login, getProfile, forgotPassword, resetPassword, sendVerificationCode, authMiddleware } from './auth.js';
import {
  saveAnalysisRecord,
  getAnalysisRecords,
  deleteAnalysisRecord,
  deleteAllAnalysisRecords,
  savePlan,
  getPlans,
  deletePlanRecord,
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
} from './data.js';
import { getQuotaStatus, checkQuota, logUsage, PLANS } from './subscription.js';
import { createOrder, getOrder, getUserOrders, completeOrder, generatePaymentParams } from './orders.js';
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

export function createApp() {
  const app = express();

  // 信任反向代理（Nginx / Docker 网络），以便正确获取客户端 IP
  app.set('trust proxy', 1);

  // CORS：从环境变量读取，支持逗号分隔多域名，回退 localhost 开发环境
  const corsOrigin = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map(s => s.trim())
    : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'];
  app.use(cors({ origin: corsOrigin }));
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
    keyGenerator: (req) => req.userId || req.ip,
  });

  app.use(generalLimiter);

  // === 公开端点 ===

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.post('/api/auth/register', authLimiter, register);
  app.post('/api/auth/login', authLimiter, login);
  app.post('/api/auth/send-code', authLimiter, sendVerificationCode);

  // === 需要认证的端点 ===

  app.get('/api/auth/profile', authMiddleware, getProfile);
  app.post('/api/auth/forgot-password', authLimiter, forgotPassword);
  app.post('/api/auth/reset-password', authLimiter, resetPassword);

  // 配额查询
  app.get('/api/quota', authMiddleware, (req, res) => {
    try {
      const quota = getQuotaStatus(req.userId);
      res.json(quota);
    } catch (err) {
      console.error('查询配额失败:', err.message);
      res.status(500).json({ error: '查询配额失败' });
    }
  });

  // 套餐信息（公开）
  app.get('/api/plans', (_req, res) => {
    res.json(PLANS);
  });

  // 创建订单
  app.post('/api/orders', authMiddleware, (req, res) => {
    try {
      const { plan } = req.body;
      if (!plan || !PLANS[plan] || plan === 'free') {
        return res.status(400).json({ error: '请选择有效的套餐' });
      }

      const order = createOrder(req.userId, plan);
      const paymentParams = generatePaymentParams(order);

      res.json({
        order: {
          id: order.id,
          plan: order.plan,
          amount: order.amount,
          amountYuan: (order.amount / 100).toFixed(2),
          planName: PLANS[order.plan]?.name,
          status: order.status,
        },
        payment: paymentParams,
      });
    } catch (err) {
      console.error('创建订单失败:', err.message);
      res.status(err.statusCode || 500).json({ error: err.message || '创建订单失败' });
    }
  });

  // 查询订单状态
  app.get('/api/orders/:id', authMiddleware, (req, res) => {
    try {
      const order = getOrder(req.params.id);
      if (!order || order.user_id !== req.userId) {
        return res.status(404).json({ error: '订单不存在' });
      }
      res.json({
        id: order.id,
        plan: order.plan,
        amount: order.amount,
        amountYuan: (order.amount / 100).toFixed(2),
        planName: PLANS[order.plan]?.name,
        status: order.status,
        paid_at: order.paid_at,
        created_at: order.created_at,
      });
    } catch (err) {
      console.error('查询订单失败:', err.message);
      res.status(500).json({ error: '查询订单失败' });
    }
  });

  // 用户订单列表
  app.get('/api/orders', authMiddleware, (req, res) => {
    try {
      const orders = getUserOrders(req.userId);
      res.json(orders.map(o => ({
        id: o.id,
        plan: o.plan,
        amount: o.amount,
        amountYuan: (o.amount / 100).toFixed(2),
        planName: PLANS[o.plan]?.name,
        status: o.status,
        paid_at: o.paid_at,
        created_at: o.created_at,
      })));
    } catch (err) {
      console.error('查询订单列表失败:', err.message);
      res.status(500).json({ error: '查询订单列表失败' });
    }
  });

  // 模拟支付（开发/测试用，生产环境应替换为微信支付回调）
  app.post('/api/payment/mock-pay/:orderId', authMiddleware, (req, res) => {
    try {
      const order = getOrder(req.params.orderId);
      if (!order || order.user_id !== req.userId) {
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
      console.error('模拟支付失败:', err.message);
      res.status(err.statusCode || 500).json({ error: err.message || '支付失败' });
    }
  });

  // 微信支付回调（生产环境）
  app.post('/api/payment/wechat/notify', express.raw({ type: 'application/json' }), (req, res) => {
    try {
      // TODO: 验证微信支付签名，解析回调数据
      // const { out_trade_no, transaction_id } = verifyWechatNotification(req.body);
      // completeOrder(out_trade_no, transaction_id);
      res.json({ code: 'SUCCESS', message: '成功' });
    } catch (err) {
      console.error('微信支付回调处理失败:', err.message);
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

      checkQuota(req.userId, 'analyze');
      const result = await analyzePhoto(image);
      logUsage(req.userId, 'analyze');
      res.json(result);
    } catch (err) {
      if (err.quotaExceeded) {
        return res.status(429).json({ error: err.message, quotaExceeded: true });
      }
      console.error('分析失败:', err.message);
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

      // 从数据库获取两次分析记录
      const { getAnalysisRecordById } = await import('./data.js');
      const beforeRecord = getAnalysisRecordById(req.userId, beforeId);
      const afterRecord = getAnalysisRecordById(req.userId, afterId);

      if (!beforeRecord || !afterRecord) {
        return res.status(404).json({ error: '分析记录不存在' });
      }

      const beforeResult = {
        score: beforeRecord.score,
        issues: JSON.parse(beforeRecord.issues || '[]'),
        radar: JSON.parse(beforeRecord.radar || '{}')
      };
      const afterResult = {
        score: afterRecord.score,
        issues: JSON.parse(afterRecord.issues || '[]'),
        radar: JSON.parse(afterRecord.radar || '{}')
      };

      const comparison = await compareAnalysis(beforeResult, afterResult);
      res.json({
        ...comparison,
        beforeDate: beforeRecord.created_at,
        afterDate: afterRecord.created_at
      });
    } catch (err) {
      console.error('对比分析失败:', err.message);
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

      const params = {};
      params.goal = isValidGoal(goal) ? goal : 'posture_fix';
      params.experience = isValidExperience(experience) ? experience : 'beginner';
      params.equipment = isValidEquipment(equipment) ? equipment : 'bodyweight';
      params.daysPerWeek = isValidDaysPerWeek(daysPerWeek) ? Number(daysPerWeek) : 4;
      params.sessionDuration = isValidSessionDuration(sessionDuration) ? Number(sessionDuration) : 60;

      checkQuota(req.userId, 'plan');
      const plan = await generatePlan(params, analysisResult);
      logUsage(req.userId, 'plan');
      res.json(plan);
    } catch (err) {
      if (err.quotaExceeded) {
        return res.status(429).json({ error: err.message, quotaExceeded: true });
      }
      console.error('生成训练方案失败:', err.message);
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

      // 获取用户历史训练记录
      const { getWorkoutRecordsRaw } = await import('./data.js');
      const workoutHistory = getWorkoutRecordsRaw(req.userId, 20); // 最近 20 次

      // 分析历史表现
      const performance = extractExercisePerformance(workoutHistory);
      const progression = calculateProgression(performance, { experience });
      const progressionPrompt = buildProgressionPrompt(progression);
      const progressionSummary = getProgressionSummary(progression);

      const params = {};
      params.goal = isValidGoal(goal) ? goal : 'posture_fix';
      params.experience = isValidExperience(experience) ? experience : 'beginner';
      params.equipment = isValidEquipment(equipment) ? equipment : 'bodyweight';
      params.daysPerWeek = isValidDaysPerWeek(daysPerWeek) ? Number(daysPerWeek) : 4;
      params.sessionDuration = isValidSessionDuration(sessionDuration) ? Number(sessionDuration) : 60;

      // 注入渐进式数据到 plan 生成
      checkQuota(req.userId, 'plan');
      const plan = await generatePlan(params, analysisResult, progressionPrompt);
      logUsage(req.userId, 'plan');

      res.json({
        ...plan,
        progression: progressionSummary,
        hasHistory: workoutHistory.length > 0,
        historyCount: workoutHistory.length,
      });
    } catch (err) {
      if (err.quotaExceeded) {
        return res.status(429).json({ error: err.message, quotaExceeded: true });
      }
      console.error('渐进式方案生成失败:', err.message);
      res.status(500).json({ error: '生成训练方案失败，请稍后重试' });
    }
  });

  // 获取训练建议（不生成方案，只看渐进式建议）
  app.get('/api/plan/progression', authMiddleware, async (req, res) => {
    try {
      const { experience } = req.query;
      const { getWorkoutRecordsRaw } = await import('./data.js');
      const workoutHistory = getWorkoutRecordsRaw(req.userId, 20);

      const performance = extractExercisePerformance(workoutHistory);
      const progression = calculateProgression(performance, { experience });
      const summary = getProgressionSummary(progression);

      res.json({
        summary,
        exerciseCount: Object.keys(performance).length,
        totalSessions: workoutHistory.length,
      });
    } catch (err) {
      console.error('获取训练建议失败:', err.message);
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

      checkQuota(req.userId, 'nutrition');
      const result = await analyzeFood(image);
      logUsage(req.userId, 'nutrition');
      res.json(result);
    } catch (err) {
      if (err.quotaExceeded) {
        return res.status(429).json({ error: err.message, quotaExceeded: true });
      }
      console.error('食物识别失败:', err.message);
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

      // 保存用户消息到数据库
      checkQuota(req.userId, 'chat');
      saveChatMessage(req.userId, 'user', message);

      const reply = await sendMessage(message, history || []);

      // 保存 AI 回复到数据库
      saveChatMessage(req.userId, 'assistant', reply);
      logUsage(req.userId, 'chat');

      res.json({ reply });
    } catch (err) {
      if (err.quotaExceeded) {
        return res.status(429).json({ error: err.message, quotaExceeded: true });
      }
      console.error('AI 对话失败:', err.message);
      res.status(500).json({ error: 'AI 对话失败，请稍后重试' });
    }
  });

  // 流式响应端点
  app.post('/api/chat/stream', authMiddleware, aiLimiter, async (req, res) => {
    try {
      const { message, history } = req.body;

      if (!message || !isValidChatMessage(message)) {
        return res.status(400).json({ error: '消息内容不合法或过长' });
      }

      // 保存用户消息
      checkQuota(req.userId, 'chat');
      saveChatMessage(req.userId, 'user', message);

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const stream = await sendMessageStream(message, history || []);
      let fullReply = '';

      if (stream) {
        const reader = stream.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
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
      }

      // 保存完整的 AI 回复
      if (fullReply) {
        saveChatMessage(req.userId, 'assistant', fullReply);
        logUsage(req.userId, 'chat');
      }

      res.end();
    } catch (err) {
      if (err.quotaExceeded) {
        return res.status(429).json({ error: err.message, quotaExceeded: true });
      }
      console.error('流式对话失败:', err.message);
      res.status(500).json({ error: '对话失败' });
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
