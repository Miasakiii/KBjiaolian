import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync } from 'fs';
import logger from './logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 数据库文件路径
const DB_PATH = join(__dirname, '..', 'data', 'kb-coach.db');

// 确保 data 目录存在
mkdirSync(join(__dirname, '..', 'data'), { recursive: true });

// 初始化数据库
const db = new Database(DB_PATH);

// 启用 WAL 模式（更好的并发性能）
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// === 创建表结构 ===

db.exec(`
  -- 用户表
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    nickname TEXT,
    created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
  );

  -- 体态分析记录
  CREATE TABLE IF NOT EXISTS analysis_records (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    image_preview TEXT,
    score INTEGER,
    summary TEXT,
    issues TEXT,  -- JSON array
    radar TEXT,   -- JSON object
    suggestions TEXT,  -- JSON array
    created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  -- 训练方案
  CREATE TABLE IF NOT EXISTS training_plans (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT,
    goal TEXT,
    experience TEXT,
    equipment TEXT,
    days_per_week INTEGER,
    session_duration INTEGER,
    schedule TEXT,  -- JSON array
    nutrition TEXT,  -- JSON object
    notes TEXT,
    duration_weeks INTEGER,
    created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  -- 训练记录
  CREATE TABLE IF NOT EXISTS workout_records (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    plan_id TEXT,
    plan_name TEXT,
    day_number INTEGER,
    day_name TEXT,
    start_time INTEGER,
    end_time INTEGER,
    duration INTEGER,
    exercises TEXT,  -- JSON array
    rating INTEGER,
    notes TEXT,
    created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  -- 饮食记录
  CREATE TABLE IF NOT EXISTS nutrition_records (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    image_preview TEXT,
    meal_type TEXT,
    foods TEXT,  -- JSON array
    total_calories INTEGER,
    total_protein INTEGER,
    total_carbs INTEGER,
    total_fat INTEGER,
    tips TEXT,
    notes TEXT,
    created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  -- 聊天历史
  CREATE TABLE IF NOT EXISTS chat_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  -- 验证码表
  CREATE TABLE IF NOT EXISTS verification_codes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    code TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'register' CHECK (type IN ('register', 'reset')),
    used INTEGER NOT NULL DEFAULT 0,
    expires_at INTEGER NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
  );

  -- 密码重置令牌
  CREATE TABLE IF NOT EXISTS password_resets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    token TEXT UNIQUE NOT NULL,
    expires_at INTEGER NOT NULL,
    used INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  -- 动作库（来自 hasaneyldrm/exercises-dataset，1324 条）
  CREATE TABLE IF NOT EXISTS exercises (
    id TEXT PRIMARY KEY,              -- "0001"
    name TEXT NOT NULL,               -- 动作名称
    category TEXT,                    -- 身体部位类别（upper arms/chest/back...）
    body_part TEXT,                   -- 同 category，目标身体部位
    equipment TEXT,                   -- 所需设备（dumbbell/body weight...）
    target TEXT,                      -- 主要目标肌肉（biceps/pectoralis major...）
    muscle_group TEXT,                -- 主要协同肌群
    secondary_muscles TEXT,           -- JSON array，附加参与肌肉
    instructions_zh TEXT,             -- 中文逐步说明
    instructions_en TEXT,             -- 英文逐步说明（备份）
    media_id TEXT,                    -- 原始 ExerciseDB 媒体参考 ID
    created_at INTEGER                -- 数据集记录创建时间戳
  );

  -- 创建复合索引（优化 WHERE user_id = ? ORDER BY created_at DESC 查询）
  CREATE INDEX IF NOT EXISTS idx_analysis_user_created ON analysis_records(user_id, created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_workout_user_created ON workout_records(user_id, created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_nutrition_user_created ON nutrition_records(user_id, created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_chat_user_created ON chat_history(user_id, created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_plans_user_created ON training_plans(user_id, created_at DESC);

  -- 动作库索引（支持按身体部位/设备/目标肌群筛选 + 名称搜索）
  CREATE INDEX IF NOT EXISTS idx_ex_body_part ON exercises(body_part);
  CREATE INDEX IF NOT EXISTS idx_ex_equipment ON exercises(equipment);
  CREATE INDEX IF NOT EXISTS idx_ex_target ON exercises(target);
  CREATE INDEX IF NOT EXISTS idx_ex_name ON exercises(name);
`);

// === 数据库迁移 ===
// 为已有数据库添加新列（IF NOT EXISTS 不适用于 ALTER TABLE）
function safeAddColumn(table: string, column: string, type: string): void {
  try {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`);
    logger.info({ table, column }, '迁移列已添加');
  } catch (err) {
    // 列已存在，忽略
    const e = err as Error;
    if (!e.message.includes('duplicate column')) {
      logger.error({ err: e, table, column }, '迁移失败');
    }
  }
}

// 验证码防爆破：添加尝试次数字段
safeAddColumn('verification_codes', 'attempts', 'INTEGER NOT NULL DEFAULT 0');

logger.info('数据库初始化完成');

// === WAL checkpoint 定时器（每 5 分钟） ===
// 将 WAL 日志合并回主数据库文件，防止 WAL 文件无限增长
const checkpointTimer = setInterval(() => {
  try {
    db.pragma('wal_checkpoint(TRUNCATE)');
  } catch (err) {
    logger.error({ err }, 'WAL checkpoint 失败');
  }
}, 5 * 60 * 1000);
checkpointTimer.unref();

// === 优雅关闭函数 ===
// 先执行 WAL checkpoint，再关闭数据库连接
let dbClosed = false;
export function closeDatabase(): void {
  if (dbClosed) return;
  dbClosed = true;
  try {
    db.pragma('wal_checkpoint(TRUNCATE)');
    logger.info('关闭前 WAL checkpoint 完成');
  } catch (err) {
    logger.error({ err }, '关闭前 WAL checkpoint 失败');
  }
  try {
    db.close();
    logger.info('数据库已关闭');
  } catch (err) {
    logger.error({ err }, '关闭数据库出错');
  }
}

export default db;
