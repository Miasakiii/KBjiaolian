/**
 * 动作库数据导入模块
 *
 * 数据来源：https://github.com/hasaneyldrm/exercises-dataset
 * 数据集：1,324 个训练动作，含 6 种语言逐步说明（含中文）
 *
 * 启动时自动检测：若 exercises 表为空且 data/exercises.json 存在，
 * 则批量导入。导入使用 INSERT OR IGNORE 保证幂等。
 */

import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import db from './database.js';
import logger from './logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DATASET_PATH = join(__dirname, '..', 'data', 'exercises.json');

interface RawExercise {
  id: string;
  name: string;
  category: string;
  body_part: string;
  equipment: string;
  target: string;
  muscle_group: string;
  secondary_muscles: string[];
  instructions: {
    en?: string;
    es?: string;
    it?: string;
    tr?: string;
    ru?: string;
    zh?: string;
  };
  media_id: string | null;
  image: null;
  gif_url: null;
  created_at: string;
}

const insertStmt = db.prepare(`
  INSERT OR IGNORE INTO exercises
    (id, name, category, body_part, equipment, target, muscle_group,
     secondary_muscles, instructions_zh, instructions_en, media_id, created_at)
  VALUES
    (@id, @name, @category, @body_part, @equipment, @target, @muscle_group,
     @secondary_muscles, @instructions_zh, @instructions_en, @media_id, @created_at)
`);

/**
 * 导入动作库数据集
 * @returns 导入的记录数（0 表示已是最新或无数据集文件）
 */
export function seedExercises(): number {
  // 检查是否已有数据
  const countRow = db.prepare('SELECT COUNT(*) as count FROM exercises').get() as { count: number };
  if (countRow.count > 0) {
    logger.info({ count: countRow.count }, '动作库已存在数据，跳过导入');
    return 0;
  }

  // 检查数据集文件
  if (!existsSync(DATASET_PATH)) {
    logger.warn(
      { path: DATASET_PATH },
      '动作库数据集文件不存在，请下载 exercises.json 到 backend/data/（来源：https://github.com/hasaneyldrm/exercises-dataset）',
    );
    return 0;
  }

  // 读取并解析 JSON
  let raw: RawExercise[];
  try {
    const content = readFileSync(DATASET_PATH, 'utf8');
    raw = JSON.parse(content);
  } catch (err) {
    logger.error({ err }, '解析 exercises.json 失败');
    return 0;
  }

  if (!Array.isArray(raw) || raw.length === 0) {
    logger.warn({ path: DATASET_PATH }, 'exercises.json 内容为空或格式异常');
    return 0;
  }

  // 批量导入（事务）
  const inserted = db.transaction((): number => {
    let n = 0;
    for (const ex of raw) {
      const result = insertStmt.run({
        id: ex.id,
        name: ex.name,
        category: ex.category ?? null,
        body_part: ex.body_part ?? ex.category ?? null,
        equipment: ex.equipment ?? null,
        target: ex.target ?? null,
        muscle_group: ex.muscle_group ?? null,
        secondary_muscles: JSON.stringify(ex.secondary_muscles ?? []),
        instructions_zh: ex.instructions?.zh ?? null,
        instructions_en: ex.instructions?.en ?? null,
        media_id: ex.media_id ?? null,
        created_at: ex.created_at ? Date.parse(ex.created_at) : null,
      });
      if (result.changes > 0) n++;
    }
    return n;
  })();

  logger.info({ total: raw.length, inserted }, '动作库数据集导入完成');
  return inserted;
}

/**
 * 获取动作库统计信息（用于健康检查/调试）
 */
export function getExercisesStats(): {
  total: number;
  byBodyPart: Record<string, number>;
  byEquipment: Record<string, number>;
} {
  const total = (db.prepare('SELECT COUNT(*) as count FROM exercises').get() as { count: number }).count;
  const byBodyPartRows = db.prepare('SELECT body_part, COUNT(*) as count FROM exercises GROUP BY body_part').all() as Array<{ body_part: string; count: number }>;
  const byEquipmentRows = db.prepare('SELECT equipment, COUNT(*) as count FROM exercises GROUP BY equipment').all() as Array<{ equipment: string; count: number }>;

  const byBodyPart: Record<string, number> = {};
  for (const r of byBodyPartRows) byBodyPart[r.body_part ?? 'unknown'] = r.count;
  const byEquipment: Record<string, number> = {};
  for (const r of byEquipmentRows) byEquipment[r.equipment ?? 'unknown'] = r.count;

  return { total, byBodyPart, byEquipment };
}
