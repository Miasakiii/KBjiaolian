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
import { register, login, getProfile, forgotPassword, resetPassword, sendVerificationCode, authMiddleware } from './auth.js';
import {
  listExercises,
  getExerciseById,
  getExercisesMeta,
  searchExercises,
} from './exercises.js';
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
import type { PlanParams, AnalysisResult } from './types.js';

// 全局兜底未处理的 Promise rejection 与未捕获异常，避免进程崩溃
process.on('unhandledRejection', (reason) => {
  logger.error({ reason }, 'Unhandled Rejection');
});
process.on('uncaughtException', (err) => {
  logger.error({ err }, 'Uncaught Exception');
});

export function createApp(): Express {
  const app = express();

  // 信任反向代理（本机开发可不用，保留兼容）
  app.set('trust proxy', 1);

  // CORS：从环境变量读取，支持逗号分隔多域名；默认允许本机调试
  let corsOrigin: string[] | boolean;
  if (process.env.CORS_ORIGIN) {
    corsOrigin = process.env.CORS_ORIGIN.split(',').map(s => s.trim());
  } else {
    corsOrigin = ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://10.0.2.2:3003'];
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

  // === 动作库（公开访问，静态数据）===

  app.get('/api/exercises/meta', getExercisesMeta);
  app.get('/api/exercises/search', searchExercises);
  app.get('/api/exercises', listExercises);
  app.get('/api/exercises/:id', getExerciseById);

  // === 需要认证的端点 ===

  app.get('/api/auth/profile', authMiddleware, getProfile);
  app.post('/api/auth/forgot-password', authLimiter, forgotPassword);
  app.post('/api/auth/reset-password', authLimiter, resetPassword);

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

      const result = await analyzePhoto(image);
      res.json(result);
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

      const plan = await generatePlan(params, analysisResult);
      res.json(plan);
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

      const plan = await generatePlan(params, analysisResult, progressionPrompt);
      res.json({
        ...plan,
        progression: progressionSummary,
        hasHistory: workoutHistory.length > 0,
        historyCount: workoutHistory.length,
      });
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

      const result = await analyzeFood(image);
      res.json(result);
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
      saveChatMessage(req.userId!, 'user', message);

      const reply = await sendMessage(message, history || []);
      saveChatMessage(req.userId!, 'assistant', reply);
      res.json({ reply });
    } catch (err) {
      logger.error({ err }, 'AI 对话失败');
      res.status(500).json({ error: 'AI 对话失败，请稍后重试' });
    }
  });

  // 流式响应端点
  app.post('/api/chat/stream', authMiddleware, aiLimiter, async (req, res) => {
    let headersSent = false;
    const abortController = new AbortController();

    // 客户端断开时取消上游 AI 请求，避免连接泄漏
    const onAbort = () => abortController.abort();
    req.on('close', onAbort);

    try {
      const { message, history } = req.body;

      if (!message || !isValidChatMessage(message)) {
        return res.status(400).json({ error: '消息内容不合法或过长' });
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
