# KB教练 — Web 营销落地页

Next.js 14 App Router + React 18 + TypeScript + Tailwind CSS 构建的营销落地页，用于展示 KB 教练产品功能并引导用户下载移动端。

> Web 端已精简为纯营销页面，应用核心功能（体态分析、训练方案、AI 对话等）请在移动端 / 桌面端（Flutter）中使用。

## 页面内容

落地页（`/`）为单页长滚动设计，包含以下区块：

1. **Hero** — 产品主视觉 + 下载引导
2. **功能展示** — AI 体态分析、训练方案、饮食识别等核心功能介绍
3. **使用步骤** — 三步上手流程
4. **用户评价** — 用户证言
5. **定价** — 订阅方案展示
6. **下载 CTA** — 引导下载移动端
7. **FAQ** — 常见问题
8. **Footer** — 底部信息

## 文件结构

```
web/
├── public/
│   ├── icons/                    # 应用图标
│   └── screenshots/              # 应用截图
├── src/
│   └── app/
│       ├── globals.css           # 全局样式（滚动动画等）
│       ├── layout.tsx            # 根布局（metadata、viewport）
│       └── page.tsx              # 营销落地页（单页完整内容）
├── next.config.js                # Next.js 配置 + 安全响应头
├── tailwind.config.js            # Tailwind 主题配置
├── tsconfig.json                 # TypeScript 配置
├── Dockerfile                    # Docker 镜像构建
├── railway.json                  # Railway 部署配置
└── package.json                  # 依赖与脚本
```

## 技术栈

| 层 | 技术 |
|----|------|
| 框架 | Next.js 14（App Router） |
| UI | React 18 + TypeScript |
| 样式 | Tailwind CSS |
| 图标 | lucide-react |
| 部署 | Docker / Railway |

## 开发

```bash
cd web
npm install
npm run dev          # http://localhost:3000
```

环境变量（`.env.local`）：

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## 脚本

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器（默认 3000 端口） |
| `npm run build` | 生产构建 |
| `npm run start` | 启动生产服务 |
| `npm test` | 运行 Vitest 单元/组件测试 |
| `npm run test:watch` | 测试 watch 模式 |
| `npm run test:coverage` | 测试覆盖率 |
| `npm run test:e2e` | 运行 Playwright E2E 测试 |

## 部署

### Railway

```bash
railway up
```

`railway.json` 已配置构建与启动命令。

### Docker

```bash
docker build -t kb-coach-web .
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=https://api.example.com/api \
  kb-coach-web
```

### Docker Compose（推荐）

项目根目录执行：

```bash
docker compose up -d
```

将同时启动后端、Web 前端和 Nginx 反向代理。

### 生产环境变量

- `NEXT_PUBLIC_API_URL` — 必填，后端 API 基址（HTTPS）
- `NEXT_PUBLIC_APP_NAME` — 应用名称（默认 `KB教练`）
- `NODE_ENV=production`

---

*Web 前端文档 — 随开发进度更新*
