# KB教练项目部署指南

## 目录
1. [环境要求](#环境要求)
2. [后端部署](#后端部署)
3. [Web 前端部署](#web-前端部署)
4. [Flutter 构建](#flutter-构建)
5. [生产环境配置](#生产环境配置)
6. [监控和日志](#监控和日志)
7. [CI/CD 配置](#cicd-配置)

---

## 环境要求

### 后端
- Node.js >= 18.0.0
- npm >= 9.0.0
- SQLite 3

### Web 前端
- Node.js >= 18.0.0
- npm >= 9.0.0

### Flutter
- Flutter SDK >= 3.44.2
- Dart SDK >= 3.2.0
- Android SDK 36 (Android 构建)
- Xcode 15+ (iOS 构建，仅 macOS)

---

## 后端部署

### 1. 环境变量配置

创建 `.env` 文件：

```bash
# 必需配置
JWT_SECRET=your-super-secret-jwt-key-change-this
MIMO_API_KEY=your-mimo-api-key
MIMO_API_URL=https://api.xiaomimimo.com/v1/chat/completions

# 可选配置
PORT=3001
NODE_ENV=production
CORS_ORIGIN=https://your-frontend-domain.com

# 数据库配置
DB_PATH=./data/kb-coach.db

# 速率限制
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 2. 安装依赖

```bash
cd backend
npm install --production
```

### 3. 启动服务

```bash
# 生产模式启动
npm start

# 或使用 PM2（推荐）
npm install -g pm2
pm2 start src/index.js --name kb-coach-backend
pm2 save
pm2 startup
```

### 4. Nginx 配置（反向代理）

```nginx
server {
    listen 80;
    server_name api.your-domain.com;

    # 重定向到 HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.your-domain.com;

    # SSL 证书
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # 代理设置
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Web 前端部署

### 1. 环境变量配置

创建 `.env.production` 文件：

```bash
NEXT_PUBLIC_API_URL=https://api.your-domain.com
NEXT_PUBLIC_APP_NAME=KB教练
```

### 2. 构建

```bash
cd web
npm install
npm run build
```

### 3. 部署选项

#### 选项 A：Vercel（推荐）

1. 安装 Vercel CLI：
```bash
npm install -g vercel
```

2. 部署：
```bash
vercel --prod
```

#### 选项 B：Netlify

1. 安装 Netlify CLI：
```bash
npm install -g netlify-cli
```

2. 部署：
```bash
netlify deploy --prod
```

#### 选项 C：自托管

1. 构建后上传 `.next` 目录到服务器
2. 使用 PM2 启动：
```bash
pm2 start npm --name kb-coach-web -- start
```

### 4. Nginx 配置

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    root /path/to/web/.next;
    index index.html;

    # 静态资源缓存
    location /_next/static {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # 图片优化
    location /images {
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }

    # API 代理
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # SPA 路由
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

## Flutter 构建

### Android 构建

```bash
cd mobile

# 获取依赖
flutter pub get

# 构建 APK
flutter build apk --release

# 构建 App Bundle（推荐用于 Google Play）
flutter build appbundle --release
```

**输出路径：**
- APK: `build/app/outputs/flutter-apk/app-release.apk`
- AAB: `build/app/outputs/bundle/release/app-release.aab`

### iOS 构建（仅 macOS）

```bash
cd mobile

# 获取依赖
flutter pub get

# 构建 iOS
flutter build ios --release
```

然后使用 Xcode 打开 `ios/Runner.xcworkspace` 进行签名和发布。

### Windows 构建

```bash
cd mobile

# 获取依赖
flutter pub get

# 构建 Windows
flutter build windows --release
```

**输出路径：** `build/windows/runner/Release/`

---

## 生产环境配置

### 1. 安全配置

#### 后端安全清单

- [ ] 使用强 JWT_SECRET（至少 32 位随机字符串）
- [ ] 启用 HTTPS
- [ ] 配置 CORS 白名单
- [ ] 设置速率限制
- [ ] 启用 Helmet 安全头
- [ ] 定期更新依赖

#### 前端安全清单

- [ ] 使用 HTTPS
- [ ] 配置 CSP 头
- [ ] 敏感信息不存储在 localStorage
- [ ] 使用 httpOnly cookie（如果适用）

### 2. 性能优化

#### 后端性能

```javascript
// 启用 gzip 压缩
const compression = require('compression');
app.use(compression());

// 启用缓存
app.use(express.static('public', {
  maxAge: '1d',
  etag: true,
}));
```

#### 前端性能

- 使用 Next.js Image 组件进行图片优化
- 启用代码分割
- 使用 CDN 加速静态资源
- 配置 Service Worker 缓存

### 3. 数据库备份

创建备份脚本 `backup.sh`：

```bash
#!/bin/bash

BACKUP_DIR="/path/to/backups"
DB_PATH="/path/to/backend/data/kb-coach.db"
DATE=$(date +%Y%m%d_%H%M%S)

# 创建备份目录
mkdir -p $BACKUP_DIR

# 备份数据库
cp $DB_PATH "$BACKUP_DIR/kb-coach_$DATE.db"

# 压缩备份
gzip "$BACKUP_DIR/kb-coach_$DATE.db"

# 删除 30 天前的备份
find $BACKUP_DIR -name "*.gz" -mtime +30 -delete

echo "Backup completed: kb-coach_$DATE.db.gz"
```

添加到 crontab：

```bash
# 每天凌晨 2 点备份
0 2 * * * /path/to/backup.sh
```

---

## 监控和日志

### 1. 后端日志

使用 Winston 进行日志管理：

```bash
npm install winston
```

创建 `logger.js`：

```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

module.exports = logger;
```

### 2. 性能监控

使用 PM2 监控：

```bash
# 查看状态
pm2 status

# 查看日志
pm2 logs

# 监控 CPU 和内存
pm2 monit

# 重启应用
pm2 restart kb-coach-backend
```

### 3. 健康检查

后端已提供健康检查端点：

```bash
curl https://api.your-domain.com/api/health
```

响应示例：

```json
{
  "status": "ok",
  "timestamp": "2026-06-15T12:00:00.000Z",
  "uptime": 3600
}
```

---

## CI/CD 配置

### GitHub Actions 示例

创建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install Backend Dependencies
        run: |
          cd backend
          npm install

      - name: Run Backend Tests
        run: |
          cd backend
          npm test

      - name: Install Web Dependencies
        run: |
          cd web
          npm install

      - name: Run Web Tests
        run: |
          cd web
          npm test

      - name: Build Web
        run: |
          cd web
          npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - uses: actions/checkout@v4

      - name: Deploy to Server
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SERVER_SSH_KEY }}
          script: |
            cd /path/to/project
            git pull
            cd backend
            npm install --production
            pm2 restart kb-coach-backend
            cd ../web
            npm install
            npm run build
            pm2 restart kb-coach-web
```

---

## 故障排查

### 常见问题

#### 1. 后端无法启动

**症状：** `npm start` 报错

**解决方案：**
```bash
# 检查端口是否被占用
lsof -i :3001

# 检查环境变量
echo $JWT_SECRET

# 查看详细错误日志
NODE_DEBUG=* npm start
```

#### 2. 数据库锁定

**症状：** `SQLITE_BUSY` 错误

**解决方案：**
```bash
# 检查数据库文件权限
ls -la backend/data/kb-coach.db

# 重启后端服务
pm2 restart kb-coach-backend
```

#### 3. CORS 错误

**症状：** 前端无法调用 API

**解决方案：**
- 检查后端 CORS 配置
- 确保前端请求的域名在白名单中
- 检查 HTTPS 证书是否有效

#### 4. 内存泄漏

**症状：** PM2 显示内存持续增长

**解决方案：**
```bash
# 查看内存使用
pm2 show kb-coach-backend

# 设置内存限制重启
pm2 start src/index.js --name kb-coach-backend --max-memory-restart 500M
```

---

## 回滚策略

### 后端回滚

```bash
# 回滚到上一个版本
cd /path/to/project
git checkout HEAD~1
cd backend
npm install --production
pm2 restart kb-coach-backend
```

### 数据库回滚

```bash
# 恢复备份
gunzip -c /path/to/backup/kb-coach_YYYYMMDD_HHMMSS.db.gz > backend/data/kb-coach.db
pm2 restart kb-coach-backend
```

---

## 联系支持

如有问题，请联系：
- 邮箱：support@kbcoach.com
- 文档：https://docs.kbcoach.com

---

*最后更新：2026年6月15日*
