import db from './database.js';
import crypto from 'crypto';

// 输入校验上限
const MAX_IMAGE_PREVIEW_BYTES = 2_000_000; // 单条预览图最大 2MB
const MAX_STRING_LENGTH = 5_000;
const MAX_RECORDS_PER_PAGE = 100;

// 生成 ID（使用 randomUUID 避免碰撞）
function generateId() {
  return crypto.randomUUID();
}

// 安全清理字符串
function safeStr(v, max = MAX_STRING_LENGTH) {
  if (typeof v !== 'string') return '';
  return v.slice(0, max);
}

// 校验预览图大小并返回标准化字符串
function safeImagePreview(v) {
  if (typeof v !== 'string') return null;
  if (v.length > MAX_IMAGE_PREVIEW_BYTES) {
    const err = new Error('预览图过大');
    err.statusCode = 400;
    throw err;
  }
  return v;
}

// 限定数值字段
function safeInt(v, fallback = 0, max = Number.MAX_SAFE_INTEGER) {
  const n = Number(v);
  if (!Number.isFinite(n)) return fallback;
  if (n < 0) return fallback;
  return Math.min(n, max);
}

// 分页参数解析（带最大值约束）
function parsePagination(query) {
  const pageNum = Math.max(1, parseInt(query.page, 10) || 1);
  const limitNum = Math.min(Math.max(1, parseInt(query.limit, 10) || 20), MAX_RECORDS_PER_PAGE);
  const offset = (pageNum - 1) * limitNum;
  return { pageNum, limitNum, offset };
}

// 预编译 SQL 语句
const stmts = {
  // 分析记录
  insertAnalysis: db.prepare(`
    INSERT INTO analysis_records (id, user_id, image_preview, score, summary, issues, radar, suggestions)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `),
  getAnalysisByUser: db.prepare(`
    SELECT * FROM analysis_records WHERE user_id = ? ORDER BY created_at DESC
  `),
  getAnalysisByUserPaginated: db.prepare(`
    SELECT * FROM analysis_records WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?
  `),
  countAnalysisByUser: db.prepare(`
    SELECT COUNT(*) as total FROM analysis_records WHERE user_id = ?
  `),
  getAnalysisById: db.prepare(`
    SELECT * FROM analysis_records WHERE id = ? AND user_id = ?
  `),
  deleteAnalysis: db.prepare(`
    DELETE FROM analysis_records WHERE id = ? AND user_id = ?
  `),
  deleteAllAnalysis: db.prepare(`
    DELETE FROM analysis_records WHERE user_id = ?
  `),

  // 训练方案
  insertPlan: db.prepare(`
    INSERT INTO training_plans (id, user_id, name, goal, experience, equipment, days_per_week, session_duration, schedule, nutrition, notes, duration_weeks)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `),
  getPlansByUser: db.prepare(`
    SELECT * FROM training_plans WHERE user_id = ? ORDER BY created_at DESC
  `),
  getPlansByUserPaginated: db.prepare(`
    SELECT * FROM training_plans WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?
  `),
  countPlansByUser: db.prepare(`
    SELECT COUNT(*) as total FROM training_plans WHERE user_id = ?
  `),
  deletePlan: db.prepare(`
    DELETE FROM training_plans WHERE id = ? AND user_id = ?
  `),
  deleteAllPlans: db.prepare(`
    DELETE FROM training_plans WHERE user_id = ?
  `),

  // 训练记录
  insertWorkout: db.prepare(`
    INSERT INTO workout_records (id, user_id, plan_id, plan_name, day_number, day_name, start_time, end_time, duration, exercises, rating, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `),
  getWorkoutsByUser: db.prepare(`
    SELECT * FROM workout_records WHERE user_id = ? ORDER BY created_at DESC
  `),
  getWorkoutsByUserPaginated: db.prepare(`
    SELECT * FROM workout_records WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?
  `),
  countWorkoutsByUser: db.prepare(`
    SELECT COUNT(*) as total FROM workout_records WHERE user_id = ?
  `),
  deleteWorkout: db.prepare(`
    DELETE FROM workout_records WHERE id = ? AND user_id = ?
  `),
  deleteAllWorkouts: db.prepare(`
    DELETE FROM workout_records WHERE user_id = ?
  `),

  // 饮食记录
  insertNutrition: db.prepare(`
    INSERT INTO nutrition_records (id, user_id, image_preview, meal_type, foods, total_calories, total_protein, total_carbs, total_fat, tips, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `),
  getNutritionByUser: db.prepare(`
    SELECT * FROM nutrition_records WHERE user_id = ? ORDER BY created_at DESC
  `),
  getNutritionByUserPaginated: db.prepare(`
    SELECT * FROM nutrition_records WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?
  `),
  countNutritionByUser: db.prepare(`
    SELECT COUNT(*) as total FROM nutrition_records WHERE user_id = ?
  `),
  deleteNutrition: db.prepare(`
    DELETE FROM nutrition_records WHERE id = ? AND user_id = ?
  `),
  deleteAllNutrition: db.prepare(`
    DELETE FROM nutrition_records WHERE user_id = ?
  `),

  // 聊天历史
  insertChat: db.prepare(`
    INSERT INTO chat_history (user_id, role, content) VALUES (?, ?, ?)
  `),
  getChatByUser: db.prepare(`
    SELECT role, content, created_at FROM chat_history WHERE user_id = ? ORDER BY created_at DESC LIMIT 50
  `),
  deleteAllChat: db.prepare(`
    DELETE FROM chat_history WHERE user_id = ?
  `),
};

// === 分析记录 API ===

export function saveAnalysisRecord(req, res) {
  try {
    const { imagePreview, result } = req.body;
    const userId = req.userId;

    if (!result || typeof result !== 'object') {
      return res.status(400).json({ error: '请提供分析结果' });
    }

    const id = generateId();
    stmts.insertAnalysis.run(
      id,
      userId,
      safeImagePreview(imagePreview),
      safeInt(result.score),
      safeStr(result.summary, 2000),
      JSON.stringify(Array.isArray(result.issues) ? result.issues : []),
      JSON.stringify(result.radar && typeof result.radar === 'object' ? result.radar : {}),
      JSON.stringify(Array.isArray(result.suggestions) ? result.suggestions : [])
    );

    res.status(201).json({ id, message: '保存成功' });
  } catch (err) {
    if (err.statusCode) return res.status(err.statusCode).json({ error: err.message });
    console.error('保存分析记录失败:', err.message);
    res.status(500).json({ error: '保存失败' });
  }
}

export function getAnalysisRecords(req, res) {
  try {
    const userId = req.userId;
    const { page, limit } = req.query;

    // 如果提供了分页参数，使用分页查询
    if (page && limit) {
      const { pageNum, limitNum, offset } = parsePagination({ page, limit });

      const records = stmts.getAnalysisByUserPaginated.all(userId, limitNum, offset);
      const { total } = stmts.countAnalysisByUser.get(userId);

      const formatted = records.map(r => ({
        id: r.id,
        timestamp: r.created_at,
        imagePreview: r.image_preview,
        result: {
          score: r.score,
          summary: r.summary,
          issues: JSON.parse(r.issues || '[]'),
          radar: JSON.parse(r.radar || '{}'),
          suggestions: JSON.parse(r.suggestions || '[]'),
        },
      }));

      return res.json({
        data: formatted,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      });
    }

    // 不分页，返回所有数据（向后兼容）
    const records = stmts.getAnalysisByUser.all(userId);

    const formatted = records.map(r => ({
      id: r.id,
      timestamp: r.created_at,
      imagePreview: r.image_preview,
      result: {
        score: r.score,
        summary: r.summary,
        issues: JSON.parse(r.issues || '[]'),
        radar: JSON.parse(r.radar || '{}'),
        suggestions: JSON.parse(r.suggestions || '[]'),
      },
    }));

    res.json(formatted);
  } catch (err) {
    console.error('获取分析记录失败:', err.message);
    res.status(500).json({ error: '获取失败' });
  }
}

export function deleteAnalysisRecord(req, res) {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const result = stmts.deleteAnalysis.run(id, userId);
    if (result.changes === 0) {
      return res.status(404).json({ error: '记录不存在' });
    }
    res.json({ message: '删除成功' });
  } catch (err) {
    console.error('删除分析记录失败:', err.message);
    res.status(500).json({ error: '删除失败' });
  }
}

export function deleteAllAnalysisRecords(req, res) {
  try {
    const userId = req.userId;
    stmts.deleteAllAnalysis.run(userId);
    res.json({ message: '清空成功' });
  } catch (err) {
    console.error('清空分析记录失败:', err.message);
    res.status(500).json({ error: '清空失败' });
  }
}

// 按 ID 获取单条分析记录（供对比分析使用）
export function getAnalysisRecordById(userId, recordId) {
  return stmts.getAnalysisById.get(recordId, userId);
}

// 获取原始训练记录（供渐进式算法使用）
export function getWorkoutRecordsRaw(userId, limit = 20) {
  return stmts.getWorkoutsByUserPaginated.all(userId, limit, 0).map(r => ({
    id: r.id,
    planId: r.plan_id,
    planName: r.plan_name,
    dayNumber: r.day_number,
    dayName: r.day_name,
    startTime: r.start_time,
    endTime: r.end_time,
    duration: r.duration,
    exercises: JSON.parse(r.exercises || '[]'),
    rating: r.rating,
    notes: r.notes,
    created_at: r.created_at,
  }));
}

// === 训练方案 API ===

export function savePlan(req, res) {
  try {
    const plan = req.body;
    const userId = req.userId;

    if (!plan || typeof plan !== 'object') {
      return res.status(400).json({ error: '请提供训练方案' });
    }

    // 校验 plan.id 长度避免过长主键
    const planId = (typeof plan.id === 'string' && plan.id.length <= 64) ? plan.id : generateId();
    // 校验 schedule/nutrition 大小，避免 JSON 序列化超大对象
    const scheduleSafe = Array.isArray(plan.schedule) ? plan.schedule.slice(0, 100) : [];
    const nutritionSafe = plan.nutrition && typeof plan.nutrition === 'object' ? plan.nutrition : {};

    stmts.insertPlan.run(
      planId,
      userId,
      safeStr(plan.name, 200),
      safeStr(plan.goal, 50),
      safeStr(plan.experience, 50),
      safeStr(plan.equipment, 50),
      safeInt(plan.daysPerWeek, 4, 7),
      safeInt(plan.sessionDuration, 60, 180),
      JSON.stringify(scheduleSafe),
      JSON.stringify(nutritionSafe),
      safeStr(plan.notes, 2000),
      safeInt(plan.durationWeeks, 8, 52)
    );

    res.status(201).json({ id: planId, message: '保存成功' });
  } catch (err) {
    console.error('保存训练方案失败:', err.message);
    res.status(500).json({ error: '保存失败' });
  }
}

export function getPlans(req, res) {
  try {
    const userId = req.userId;
    const { page, limit } = req.query;

    // 如果提供了分页参数，使用分页查询
    if (page && limit) {
      const pageNum = parseInt(page, 10) || 1;
      const limitNum = parseInt(limit, 10) || 20;
      const offset = (pageNum - 1) * limitNum;

      const plans = stmts.getPlansByUserPaginated.all(userId, limitNum, offset);
      const { total } = stmts.countPlansByUser.get(userId);

      const formatted = plans.map(p => ({
        id: p.id,
        name: p.name,
        goal: p.goal,
        experience: p.experience,
        equipment: p.equipment,
        daysPerWeek: p.days_per_week,
        sessionDuration: p.session_duration,
        schedule: JSON.parse(p.schedule || '[]'),
        nutrition: JSON.parse(p.nutrition || '{}'),
        notes: p.notes,
        durationWeeks: p.duration_weeks,
        createdAt: p.created_at,
      }));

      return res.json({
        data: formatted,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      });
    }

    // 不分页，返回所有数据（向后兼容）
    const plans = stmts.getPlansByUser.all(userId);

    const formatted = plans.map(p => ({
      id: p.id,
      name: p.name,
      goal: p.goal,
      experience: p.experience,
      equipment: p.equipment,
      daysPerWeek: p.days_per_week,
      sessionDuration: p.session_duration,
      schedule: JSON.parse(p.schedule || '[]'),
      nutrition: JSON.parse(p.nutrition || '{}'),
      notes: p.notes,
      durationWeeks: p.duration_weeks,
      createdAt: p.created_at,
    }));

    res.json(formatted);
  } catch (err) {
    console.error('获取训练方案失败:', err.message);
    res.status(500).json({ error: '获取失败' });
  }
}

export function deletePlanRecord(req, res) {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const result = stmts.deletePlan.run(id, userId);
    if (result.changes === 0) {
      return res.status(404).json({ error: '记录不存在' });
    }
    res.json({ message: '删除成功' });
  } catch (err) {
    console.error('删除训练方案失败:', err.message);
    res.status(500).json({ error: '删除失败' });
  }
}

export function deleteAllPlanRecords(req, res) {
  try {
    const userId = req.userId;
    stmts.deleteAllPlans.run(userId);
    res.json({ message: '清空成功' });
  } catch (err) {
    console.error('清空训练方案失败:', err.message);
    res.status(500).json({ error: '清空失败' });
  }
}

// === 训练记录 API ===

export function saveWorkoutRecord(req, res) {
  try {
    const workout = req.body;
    const userId = req.userId;

    if (!workout || typeof workout !== 'object') {
      return res.status(400).json({ error: '请提供训练记录' });
    }

    const id = (typeof workout.id === 'string' && workout.id.length <= 64) ? workout.id : generateId();
    const exercisesSafe = Array.isArray(workout.exercises) ? workout.exercises.slice(0, 100) : [];

    stmts.insertWorkout.run(
      id,
      userId,
      safeStr(workout.planId, 64) || null,
      safeStr(workout.planName, 200),
      safeInt(workout.dayNumber, 1, 99),
      safeStr(workout.dayName, 200),
      safeInt(workout.startTime),
      safeInt(workout.endTime),
      safeInt(workout.duration, 0, 24 * 60),
      JSON.stringify(exercisesSafe),
      safeInt(workout.rating, 0, 5),
      safeStr(workout.notes, 2000)
    );

    res.status(201).json({ id, message: '保存成功' });
  } catch (err) {
    console.error('保存训练记录失败:', err.message);
    res.status(500).json({ error: '保存失败' });
  }
}

export function getWorkoutRecords(req, res) {
  try {
    const userId = req.userId;
    const { page, limit } = req.query;

    // 如果提供了分页参数，使用分页查询
    if (page && limit) {
      const pageNum = parseInt(page, 10) || 1;
      const limitNum = parseInt(limit, 10) || 20;
      const offset = (pageNum - 1) * limitNum;

      const records = stmts.getWorkoutsByUserPaginated.all(userId, limitNum, offset);
      const { total } = stmts.countWorkoutsByUser.get(userId);

      const formatted = records.map(r => ({
        id: r.id,
        planId: r.plan_id,
        planName: r.plan_name,
        dayNumber: r.day_number,
        dayName: r.day_name,
        startTime: r.start_time,
        endTime: r.end_time,
        duration: r.duration,
        exercises: JSON.parse(r.exercises || '[]'),
        rating: r.rating,
        notes: r.notes,
        createdAt: r.created_at,
      }));

      return res.json({
        data: formatted,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      });
    }

    // 不分页，返回所有数据（向后兼容）
    const records = stmts.getWorkoutsByUser.all(userId);

    const formatted = records.map(r => ({
      id: r.id,
      planId: r.plan_id,
      planName: r.plan_name,
      dayNumber: r.day_number,
      dayName: r.day_name,
      startTime: r.start_time,
      endTime: r.end_time,
      duration: r.duration,
      exercises: JSON.parse(r.exercises || '[]'),
      rating: r.rating,
      notes: r.notes,
      createdAt: r.created_at,
    }));

    res.json(formatted);
  } catch (err) {
    console.error('获取训练记录失败:', err.message);
    res.status(500).json({ error: '获取失败' });
  }
}

export function deleteWorkoutRecord(req, res) {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const result = stmts.deleteWorkout.run(id, userId);
    if (result.changes === 0) {
      return res.status(404).json({ error: '记录不存在' });
    }
    res.json({ message: '删除成功' });
  } catch (err) {
    console.error('删除训练记录失败:', err.message);
    res.status(500).json({ error: '删除失败' });
  }
}

export function deleteAllWorkoutRecords(req, res) {
  try {
    const userId = req.userId;
    stmts.deleteAllWorkouts.run(userId);
    res.json({ message: '清空成功' });
  } catch (err) {
    console.error('清空训练记录失败:', err.message);
    res.status(500).json({ error: '清空失败' });
  }
}

// === 饮食记录 API ===

export function saveNutritionRecord(req, res) {
  try {
    const nutrition = req.body;
    const userId = req.userId;

    if (!nutrition || typeof nutrition !== 'object') {
      return res.status(400).json({ error: '请提供饮食记录' });
    }

    const id = (typeof nutrition.id === 'string' && nutrition.id.length <= 64) ? nutrition.id : generateId();
    const foodsSafe = Array.isArray(nutrition.foods) ? nutrition.foods.slice(0, 100) : [];
    const allowedMealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
    const mealType = allowedMealTypes.includes(nutrition.mealType) ? nutrition.mealType : 'lunch';

    stmts.insertNutrition.run(
      id,
      userId,
      safeImagePreview(nutrition.imagePreview),
      mealType,
      JSON.stringify(foodsSafe),
      safeInt(nutrition.totalCalories, 0, 100000),
      safeInt(nutrition.totalProtein, 0, 10000),
      safeInt(nutrition.totalCarbs, 0, 10000),
      safeInt(nutrition.totalFat, 0, 10000),
      safeStr(nutrition.tips, 500),
      safeStr(nutrition.notes, 2000)
    );

    res.status(201).json({ id, message: '保存成功' });
  } catch (err) {
    if (err.statusCode) return res.status(err.statusCode).json({ error: err.message });
    console.error('保存饮食记录失败:', err.message);
    res.status(500).json({ error: '保存失败' });
  }
}

export function getNutritionRecords(req, res) {
  try {
    const userId = req.userId;
    const { page, limit } = req.query;

    // 如果提供了分页参数，使用分页查询
    if (page && limit) {
      const pageNum = parseInt(page, 10) || 1;
      const limitNum = parseInt(limit, 10) || 20;
      const offset = (pageNum - 1) * limitNum;

      const records = stmts.getNutritionByUserPaginated.all(userId, limitNum, offset);
      const { total } = stmts.countNutritionByUser.get(userId);

      const formatted = records.map(r => ({
        id: r.id,
        imagePreview: r.image_preview,
        mealType: r.meal_type,
        foods: JSON.parse(r.foods || '[]'),
        totalCalories: r.total_calories,
        totalProtein: r.total_protein,
        totalCarbs: r.total_carbs,
        totalFat: r.total_fat,
        tips: r.tips,
        notes: r.notes,
        createdAt: r.created_at,
      }));

      return res.json({
        data: formatted,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      });
    }

    // 不分页，返回所有数据（向后兼容）
    const records = stmts.getNutritionByUser.all(userId);

    const formatted = records.map(r => ({
      id: r.id,
      imagePreview: r.image_preview,
      mealType: r.meal_type,
      foods: JSON.parse(r.foods || '[]'),
      totalCalories: r.total_calories,
      totalProtein: r.total_protein,
      totalCarbs: r.total_carbs,
      totalFat: r.total_fat,
      tips: r.tips,
      notes: r.notes,
      createdAt: r.created_at,
    }));

    res.json(formatted);
  } catch (err) {
    console.error('获取饮食记录失败:', err.message);
    res.status(500).json({ error: '获取失败' });
  }
}

export function deleteNutritionRecord(req, res) {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const result = stmts.deleteNutrition.run(id, userId);
    if (result.changes === 0) {
      return res.status(404).json({ error: '记录不存在' });
    }
    res.json({ message: '删除成功' });
  } catch (err) {
    console.error('删除饮食记录失败:', err.message);
    res.status(500).json({ error: '删除失败' });
  }
}

export function deleteAllNutritionRecords(req, res) {
  try {
    const userId = req.userId;
    stmts.deleteAllNutrition.run(userId);
    res.json({ message: '清空成功' });
  } catch (err) {
    console.error('清空饮食记录失败:', err.message);
    res.status(500).json({ error: '清空失败' });
  }
}

// === 聊天历史 API ===

export function saveChatMessage(userId, role, content) {
  stmts.insertChat.run(userId, role, content);
}

export function getChatHistory(req, res) {
  try {
    const userId = req.userId;
    const messages = stmts.getChatByUser.all(userId);

    // 反转顺序（从旧到新）
    const formatted = messages.reverse().map(m => ({
      role: m.role,
      content: m.content,
      timestamp: m.created_at,
    }));

    res.json(formatted);
  } catch (err) {
    console.error('获取聊天历史失败:', err.message);
    res.status(500).json({ error: '获取失败' });
  }
}

export function deleteChatHistory(req, res) {
  try {
    const userId = req.userId;
    stmts.deleteAllChat.run(userId);
    res.json({ message: '清空成功' });
  } catch (err) {
    console.error('清空聊天历史失败:', err.message);
    res.status(500).json({ error: '清空失败' });
  }
}
