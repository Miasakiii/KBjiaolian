import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 数据库文件路径
const DB_PATH = join(__dirname, '..', 'data', 'kb-coach.db');

// 确保 data 目录存在
import { mkdirSync } from 'fs';
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

  -- 创建复合索引（优化 WHERE user_id = ? ORDER BY created_at DESC 查询）
  CREATE INDEX IF NOT EXISTS idx_analysis_user_created ON analysis_records(user_id, created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_workout_user_created ON workout_records(user_id, created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_nutrition_user_created ON nutrition_records(user_id, created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_chat_user_created ON chat_history(user_id, created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_plans_user_created ON training_plans(user_id, created_at DESC);
`);

console.log('数据库初始化完成');

export default db;
