import { copyFileSync, mkdirSync, readdirSync, unlinkSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import logger from './logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DB_PATH = join(__dirname, '..', 'data', 'kb-coach.db');
const BACKUP_DIR = join(__dirname, '..', 'data', 'backups');
const BACKUP_RETENTION_DAYS = 7;
const BACKUP_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 小时

// 确保备份目录存在
mkdirSync(BACKUP_DIR, { recursive: true });

function getBackupFilename() {
  const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  return `kb-coach-${date}.db`;
}

function createBackup() {
  try {
    const filename = getBackupFilename();
    const backupPath = join(BACKUP_DIR, filename);
    copyFileSync(DB_PATH, backupPath);
    logger.info({ filename }, '数据库备份完成');
  } catch (err) {
    logger.error({ err }, '备份失败');
  }
}

function cleanOldBackups() {
  try {
    const files = readdirSync(BACKUP_DIR);
    const now = Date.now();
    const maxAge = BACKUP_RETENTION_DAYS * 24 * 60 * 60 * 1000;

    for (const file of files) {
      if (!file.startsWith('kb-coach-') || !file.endsWith('.db')) continue;
      const filePath = join(BACKUP_DIR, file);
      const stats = statSync(filePath);
      if (now - stats.mtimeMs > maxAge) {
        unlinkSync(filePath);
        logger.info({ file }, '清理旧备份');
      }
    }
  } catch (err) {
    logger.error({ err }, '清理旧备份失败');
  }
}

// 启动时备份一次
createBackup();
cleanOldBackups();

// 每日备份（不阻止进程退出）
const backupTimer = setInterval(() => {
  createBackup();
  cleanOldBackups();
}, BACKUP_INTERVAL_MS);
backupTimer.unref();

logger.info('备份服务已启动（每日备份，保留 7 天）');
