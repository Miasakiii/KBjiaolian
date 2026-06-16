import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { analyzePhoto } from './analyze.js';
import { generatePlan } from './plan.js';
import { analyzeFood } from './nutrition.js';
import { sendMessage, sendMessageStream } from './chat.js';
import { register, login, getProfile, authMiddleware } from './auth.js';
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

  app.use(cors({ origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'] }));
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
    keyGenerator: (req) => req.userId || req.ip,
  });

  app.use(generalLimiter);

  // === 公开端点 ===

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.post('/api/auth/register', authLimiter, register);
  app.post('/api/auth/login', authLimiter, login);

  // === 需要认证的端点 ===

  app.get('/api/auth/profile', authMiddleware, getProfile);

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
      console.error('分析失败:', err.message);
      res.status(500).json({ error: '分析失败，请稍后重试' });
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

      const plan = await generatePlan(params, analysisResult);
      res.json(plan);
    } catch (err) {
      console.error('生成训练方案失败:', err.message);
      res.status(500).json({ error: '生成训练方案失败，请稍后重试' });
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
      saveChatMessage(req.userId, 'user', message);

      const reply = await sendMessage(message, history || []);

      // 保存 AI 回复到数据库
      saveChatMessage(req.userId, 'assistant', reply);

      res.json({ reply });
    } catch (err) {
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
      }

      res.end();
    } catch (err) {
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
