import 'dotenv/config';
import { createApp } from './app.js';
import db from './database.js';

const PORT = process.env.PORT || 3001;
const app = createApp();

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`后端服务运行在 http://0.0.0.0:${PORT}`);
});

// 优雅关闭：收到 SIGTERM/SIGINT 时停止接收新连接，等待在途请求完成后关闭数据库
let shuttingDown = false;
function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`收到 ${signal}，开始优雅关闭...`);

  // 给在途请求 10 秒时间完成；超时后强制退出
  const forceExitTimer = setTimeout(() => {
    console.error('优雅关闭超时，强制退出');
    process.exit(1);
  }, 10000);
  forceExitTimer.unref();

  server.close((err) => {
    if (err) console.error('关闭 HTTP 服务出错:', err.message);
    try {
      db.close();
      console.log('数据库已关闭');
    } catch (e) {
      console.error('关闭数据库出错:', e.message);
    }
    clearTimeout(forceExitTimer);
    process.exit(err ? 1 : 0);
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
