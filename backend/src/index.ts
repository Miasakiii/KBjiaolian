import 'dotenv/config';
import { createApp } from './app.js';
import { closeDatabase } from './database.js';
import logger from './logger.js';
import './backup.js';

const PORT: number = Number(process.env.PORT) || 3001;
const app = createApp();

const server = app.listen(PORT, '0.0.0.0', () => {
  logger.info({ port: PORT }, '后端服务启动');
});

// 优雅关闭：收到 SIGTERM/SIGINT 时停止接收新连接，等待在途请求完成后关闭数据库
let shuttingDown = false;
function shutdown(signal: string): void {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info({ signal }, '收到信号，开始优雅关闭');

  // 给在途请求 10 秒时间完成；超时后强制退出
  const forceExitTimer = setTimeout(() => {
    logger.error('优雅关闭超时，强制退出');
    process.exit(1);
  }, 10000);
  forceExitTimer.unref();

  server.close((err) => {
    if (err) logger.error({ err }, '关闭 HTTP 服务出错');
    closeDatabase();
    clearTimeout(forceExitTimer);
    process.exit(err ? 1 : 0);
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
