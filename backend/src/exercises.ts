/**
 * 动作库 API 路由处理
 *
 * 提供静态动作数据的查询、筛选、搜索。
 * 数据来源：hasaneyldrm/exercises-dataset（1,324 条，含中文说明）
 *
 * 所有端点公开访问（无需认证），因为动作库是静态数据。
 */

import type { Request, Response } from 'express';
import db from './database.js';
import logger from './logger.js';

// === 类型定义 ===

interface ExerciseRow {
  id: string;
  name: string;
  category: string | null;
  body_part: string | null;
  equipment: string | null;
  target: string | null;
  muscle_group: string | null;
  secondary_muscles: string | null;
  instructions_zh: string | null;
  instructions_en: string | null;
  media_id: string | null;
  created_at: number | null;
}

interface ExerciseListRow {
  id: string;
  name: string;
  body_part: string | null;
  equipment: string | null;
  target: string | null;
  muscle_group: string | null;
}

// === 预编译 SQL ===

const stmts = {
  count: db.prepare<unknown[], { count: number }>(`
    SELECT COUNT(*) as count FROM exercises
    WHERE (:bodyPart IS NULL OR body_part = :bodyPart)
      AND (:equipment IS NULL OR equipment = :equipment)
      AND (:target IS NULL OR target = :target)
  `),
  list: db.prepare<unknown[], ExerciseListRow>(`
    SELECT id, name, body_part, equipment, target, muscle_group
    FROM exercises
    WHERE (:bodyPart IS NULL OR body_part = :bodyPart)
      AND (:equipment IS NULL OR equipment = :equipment)
      AND (:target IS NULL OR target = :target)
    ORDER BY name ASC
    LIMIT :limit OFFSET :offset
  `),
  getById: db.prepare<unknown[], ExerciseRow>('SELECT * FROM exercises WHERE id = ?'),
  search: db.prepare<unknown[], ExerciseListRow>(`
    SELECT id, name, body_part, equipment, target, muscle_group
    FROM exercises
    WHERE name LIKE :keyword
       OR target LIKE :keyword
       OR muscle_group LIKE :keyword
    ORDER BY
      CASE WHEN name LIKE :prefix THEN 0 ELSE 1 END,
      name ASC
    LIMIT :limit OFFSET :offset
  `),
  searchCount: db.prepare<unknown[], { count: number }>(`
    SELECT COUNT(*) as count FROM exercises
    WHERE name LIKE :keyword
       OR target LIKE :keyword
       OR muscle_group LIKE :keyword
  `),
  metaBodyParts: db.prepare<unknown[], { body_part: string; count: number }>(
    'SELECT body_part, COUNT(*) as count FROM exercises WHERE body_part IS NOT NULL GROUP BY body_part ORDER BY count DESC',
  ),
  metaEquipment: db.prepare<unknown[], { equipment: string; count: number }>(
    'SELECT equipment, COUNT(*) as count FROM exercises WHERE equipment IS NOT NULL GROUP BY equipment ORDER BY count DESC',
  ),
  metaTargets: db.prepare<unknown[], { target: string; count: number }>(
    'SELECT target, COUNT(*) as count FROM exercises WHERE target IS NOT NULL GROUP BY target ORDER BY count DESC',
  ),
};

// === 工具函数 ===

const MAX_PAGE_SIZE = 100;
const DEFAULT_PAGE_SIZE = 20;

function parsePaging(req: Request): { limit: number; offset: number; page: number } {
  const page = Math.max(1, Number(req.query.page) || 1);
  const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, Number(req.query.pageSize) || DEFAULT_PAGE_SIZE));
  return { limit: pageSize, offset: (page - 1) * pageSize, page };
}

function parseOptionalString(v: unknown): string | null {
  if (typeof v !== 'string' || v.trim() === '') return null;
  return v.trim();
}

function formatListRow(r: ExerciseListRow) {
  return {
    id: r.id,
    name: r.name,
    bodyPart: r.body_part,
    equipment: r.equipment,
    target: r.target,
    muscleGroup: r.muscle_group,
  };
}

function formatDetailRow(r: ExerciseRow) {
  let secondaryMuscles: string[] = [];
  try {
    const parsed = JSON.parse(r.secondary_muscles ?? '[]');
    if (Array.isArray(parsed)) secondaryMuscles = parsed.map((s) => String(s));
  } catch {
    // 损坏数据返回空数组
  }

  return {
    id: r.id,
    name: r.name,
    category: r.category,
    bodyPart: r.body_part,
    equipment: r.equipment,
    target: r.target,
    muscleGroup: r.muscle_group,
    secondaryMuscles,
    instructions: {
      zh: r.instructions_zh,
      en: r.instructions_en,
    },
    mediaId: r.media_id,
    createdAt: r.created_at,
  };
}

// === 路由处理器 ===

/** GET /api/exercises — 分页列表，支持 bodyPart/equipment/target 筛选 */
export function listExercises(req: Request, res: Response) {
  try {
    const { limit, offset, page } = parsePaging(req);
    const bodyPart = parseOptionalString(req.query.bodyPart);
    const equipment = parseOptionalString(req.query.equipment);
    const target = parseOptionalString(req.query.target);

    const { count } = stmts.count.get({
      bodyPart,
      equipment,
      target,
    }) as { count: number };

    const rows = stmts.list.all({
      bodyPart,
      equipment,
      target,
      limit,
      offset,
    }) as ExerciseListRow[];

    res.json({
      page,
      pageSize: limit,
      total: count,
      totalPages: Math.ceil(count / limit),
      items: rows.map(formatListRow),
    });
  } catch (err) {
    logger.error({ err }, '查询动作列表失败');
    res.status(500).json({ error: '查询动作列表失败' });
  }
}

/** GET /api/exercises/:id — 动作详情 */
export function getExerciseById(req: Request, res: Response) {
  try {
    const row = stmts.getById.get(req.params.id) as ExerciseRow | undefined;
    if (!row) {
      return res.status(404).json({ error: '动作不存在' });
    }
    res.json(formatDetailRow(row));
  } catch (err) {
    logger.error({ err }, '查询动作详情失败');
    res.status(500).json({ error: '查询动作详情失败' });
  }
}

/** GET /api/exercises/meta — 筛选选项聚合（供前端筛选 UI） */
export function getExercisesMeta(_req: Request, res: Response) {
  try {
    const bodyParts = stmts.metaBodyParts.all() as Array<{ body_part: string; count: number }>;
    const equipment = stmts.metaEquipment.all() as Array<{ equipment: string; count: number }>;
    const targets = stmts.metaTargets.all() as Array<{ target: string; count: number }>;

    res.json({
      bodyParts: bodyParts.map((r) => ({ value: r.body_part, count: r.count })),
      equipment: equipment.map((r) => ({ value: r.equipment, count: r.count })),
      targets: targets.map((r) => ({ value: r.target, count: r.count })),
    });
  } catch (err) {
    logger.error({ err }, '查询动作库元数据失败');
    res.status(500).json({ error: '查询动作库元数据失败' });
  }
}

/** GET /api/exercises/search?q=keyword — 名称/肌群模糊搜索 */
export function searchExercises(req: Request, res: Response) {
  try {
    const q = parseOptionalString(req.query.q);
    if (!q) {
      return res.status(400).json({ error: '请提供搜索关键词（参数 q）' });
    }

    const { limit, offset, page } = parsePaging(req);
    const keyword = `%${q}%`;
    const prefix = `${q}%`;

    const { count } = stmts.searchCount.get({ keyword }) as { count: number };
    const rows = stmts.search.all({
      keyword,
      prefix,
      limit,
      offset,
    }) as ExerciseListRow[];

    res.json({
      q,
      page,
      pageSize: limit,
      total: count,
      totalPages: Math.ceil(count / limit),
      items: rows.map(formatListRow),
    });
  } catch (err) {
    logger.error({ err }, '搜索动作失败');
    res.status(500).json({ error: '搜索动作失败' });
  }
}

// === AI 方案生成辅助 ===

/** 个人版设备类型 → 数据集设备类型映射 */
const EQUIPMENT_MAP: Record<string, string[]> = {
  bodyweight: ['body weight'],
  dumbbell: ['dumbbell'],
  gym: ['dumbbell', 'barbell', 'cable', 'leverage machine', 'smith machine', 'ez barbell', 'kettlebell'],
};

/**
 * 查询匹配设备的动作清单，按身体部位分组（供 plan.ts AI 方案生成时注入候选动作）
 *
 * 为控制 prompt 长度，每个身体部位最多取 perBodyPart 个动作。
 *
 * @param equipment 用户输入的设备类型（bodyweight/dumbbell/gym）
 * @param perBodyPart 每个身体部位取多少个动作
 */
export function queryExercisesByEquipment(
  equipment: string,
  perBodyPart = 6,
): Array<{ id: string; name: string; bodyPart: string | null; target: string | null }> {
  const targets = EQUIPMENT_MAP[equipment] ?? EQUIPMENT_MAP.bodyweight;
  const placeholders = targets.map(() => '?').join(',');

  // 按身体部位分组，每组取前 perBodyPart 个（按名称排序保证稳定）
  // 使用 ROW_NUMBER() 窗口函数（SQLite 3.25+）
  const rows = db
    .prepare<unknown[], { id: string; name: string; body_part: string | null; target: string | null }>(
      `WITH ranked AS (
        SELECT id, name, body_part, target,
               ROW_NUMBER() OVER (PARTITION BY body_part ORDER BY name) AS rn
        FROM exercises
        WHERE equipment IN (${placeholders})
      )
      SELECT id, name, body_part, target FROM ranked WHERE rn <= ?`,
    )
    .all(...targets, perBodyPart) as Array<{ id: string; name: string; body_part: string | null; target: string | null }>;

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    bodyPart: r.body_part,
    target: r.target,
  }));
}

/**
 * 将动作清单格式化为 prompt 注入文本（按身体部位分组）
 */
export function formatExercisesForPrompt(
  exercises: Array<{ id: string; name: string; bodyPart: string | null; target: string | null }>,
): string {
  const groups: Record<string, Array<{ id: string; name: string; target: string | null }>> = {};
  for (const ex of exercises) {
    const key = ex.bodyPart ?? 'other';
    if (!groups[key]) groups[key] = [];
    groups[key].push({ id: ex.id, name: ex.name, target: ex.target });
  }

  const lines: string[] = [];
  for (const [part, items] of Object.entries(groups)) {
    lines.push(`【${part}】`);
    for (const it of items) {
      lines.push(`  - ${it.id} | ${it.name}（目标：${it.target ?? '未知'}）`);
    }
  }
  return lines.join('\n');
}
