import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import logger from './logger.js';

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
    plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro_monthly', 'pro_yearly')),
    plan_expires_at INTEGER,
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

  -- 订单表
  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    plan TEXT NOT NULL CHECK (plan IN ('pro_monthly', 'pro_yearly')),
    amount INTEGER NOT NULL,  -- 金额（分）
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'refunded')),
    payment_method TEXT DEFAULT 'wechat',
    trade_no TEXT,  -- 微信支付交易号
    paid_at INTEGER,
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

  -- 创建复合索引（优化 WHERE user_id = ? ORDER BY created_at DESC 查询）
  CREATE INDEX IF NOT EXISTS idx_analysis_user_created ON analysis_records(user_id, created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_workout_user_created ON workout_records(user_id, created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_nutrition_user_created ON nutrition_records(user_id, created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_chat_user_created ON chat_history(user_id, created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_plans_user_created ON training_plans(user_id, created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_orders_user_created ON orders(user_id, created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_orders_trade_no ON orders(trade_no);
`);

// === 数据库迁移 ===
// 为已有数据库添加新列（IF NOT EXISTS 不适用于 ALTER TABLE）
function safeAddColumn(table, column, type) {
  try {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`);
    logger.info({ table, column }, '迁移列已添加');
  } catch (err) {
    // 列已存在，忽略
    if (!err.message.includes('duplicate column')) {
      logger.error({ err, table, column }, '迁移失败');
    }
  }
}

safeAddColumn('users', 'plan', "TEXT NOT NULL DEFAULT 'free'");
safeAddColumn('users', 'plan_expires_at', 'INTEGER');
safeAddColumn('users', 'open_id', 'TEXT');

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
export function closeDatabase() {
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
