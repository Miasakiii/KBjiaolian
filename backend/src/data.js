import db from './database.js';

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

// 生成 ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

// === 分析记录 API ===

export function saveAnalysisRecord(req, res) {
  try {
    const { imagePreview, result } = req.body;
    const userId = req.userId;

    if (!result) {
      return res.status(400).json({ error: '请提供分析结果' });
    }

    const id = generateId();
    stmts.insertAnalysis.run(
      id,
      userId,
      imagePreview || null,
      result.score || 0,
      result.summary || '',
      JSON.stringify(result.issues || []),
      JSON.stringify(result.radar || {}),
      JSON.stringify(result.suggestions || [])
    );

    res.status(201).json({ id, message: '保存成功' });
  } catch (err) {
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
      const pageNum = parseInt(page, 10) || 1;
      const limitNum = parseInt(limit, 10) || 20;
      const offset = (pageNum - 1) * limitNum;

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
    stmts.deleteAnalysis.run(id, userId);
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

// === 训练方案 API ===

export function savePlan(req, res) {
  try {
    const plan = req.body;
    const userId = req.userId;

    if (!plan) {
      return res.status(400).json({ error: '请提供训练方案' });
    }

    const id = plan.id || generateId();
    stmts.insertPlan.run(
      id,
      userId,
      plan.name || '',
      plan.goal || '',
      plan.experience || '',
      plan.equipment || '',
      plan.daysPerWeek || 4,
      plan.sessionDuration || 60,
      JSON.stringify(plan.schedule || []),
      JSON.stringify(plan.nutrition || {}),
      plan.notes || '',
      plan.durationWeeks || 8
    );

    res.status(201).json({ id, message: '保存成功' });
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
    stmts.deletePlan.run(id, userId);
    res.json({ message: '删除成功' });
  } catch (err) {
    console.error('删除训练方案失败:', err.message);
    res.status(500).json({ error: '删除失败' });
  }
}

// === 训练记录 API ===

export function saveWorkoutRecord(req, res) {
  try {
    const workout = req.body;
    const userId = req.userId;

    if (!workout) {
      return res.status(400).json({ error: '请提供训练记录' });
    }

    const id = workout.id || generateId();
    stmts.insertWorkout.run(
      id,
      userId,
      workout.planId || null,
      workout.planName || '',
      workout.dayNumber || 1,
      workout.dayName || '',
      workout.startTime || Date.now(),
      workout.endTime || Date.now(),
      workout.duration || 0,
      JSON.stringify(workout.exercises || []),
      workout.rating || 0,
      workout.notes || ''
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
    stmts.deleteWorkout.run(id, userId);
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

    if (!nutrition) {
      return res.status(400).json({ error: '请提供饮食记录' });
    }

    const id = nutrition.id || generateId();
    stmts.insertNutrition.run(
      id,
      userId,
      nutrition.imagePreview || null,
      nutrition.mealType || 'lunch',
      JSON.stringify(nutrition.foods || []),
      nutrition.totalCalories || 0,
      nutrition.totalProtein || 0,
      nutrition.totalCarbs || 0,
      nutrition.totalFat || 0,
      nutrition.tips || '',
      nutrition.notes || ''
    );

    res.status(201).json({ id, message: '保存成功' });
  } catch (err) {
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
    stmts.deleteNutrition.run(id, userId);
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
