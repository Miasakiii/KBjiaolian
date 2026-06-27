import pino from 'pino';

const isTest = process.env.JEST_WORKER_ID !== undefined;
const isProd = process.env.NODE_ENV === 'production';

let logger;

if (isTest) {
  // 测试环境：静默，不启用 transport（规避 --detectOpenHandles 误报）
  logger = pino({ level: 'silent' });
} else if (isProd) {
  // 生产环境：NDJSON 到 stdout，无 transport（兼容 npm install --production）
  logger = pino({ level: process.env.LOG_LEVEL || 'info' });
} else {
  // 开发环境：pino-pretty 彩色可读输出
  logger = pino({
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:HH:MM:ss.l',
        ignore: 'pid,hostname',
      },
    },
  });
}

export default logger;
