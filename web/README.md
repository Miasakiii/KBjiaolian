# KB教练 — Web 前端

Next.js 14 App Router + React 18 + TypeScript + Tailwind CSS 的 Web 端，支持 PWA 离线、游客模式、AI 体态分析等。

## 快速开始

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
| `npm run dev` | 开发服务器（默认 3000 端口） |
| `npm run build` | 生产构建 |
| `npm run start` | 启动生产服务 |
| `npm test` | 运行 Vitest 单元/组件测试 |
| `npm run test:watch` | 测试 watch 模式 |
| `npm run test:coverage` | 测试覆盖率 |
| `npx tsc --noEmit` | TypeScript 类型检查 |

## 目录结构

```
web/
├── public/                       # 静态资源
│   ├── icons/                    # PWA 图标
│   ├── screenshots/              # PWA 截图
│   ├── manifest.json             # PWA 清单
│   └── sw.js                     # Service Worker（缓存策略 + 推送）
├── src/
│   ├── app/                      # Next.js App Router 路由
│   │   ├── layout.tsx            # 根布局（AuthProvider + AuthGuard + Navbar/Footer）
│   │   ├── page.tsx              # 首页（未登录→Landing，已登录→Dashboard）
│   │   ├── login/                # 登录/注册页
│   │   ├── forgot-password/      # 忘记密码
│   │   ├── reset-password/       # 重置密码
│   │   ├── analyze/              # 体态分析（拍照 → AI 8 维度评估）
│   │   ├── compare/              # 前后对比分析
│   │   ├── plan/                 # 训练方案生成
│   │   ├── plans/                # 方案列表
│   │   ├── workout/              # 训练进行中
│   │   ├── workout/complete/     # 训练完成（评分 + 备注）
│   │   ├── workouts/             # 训练记录列表
│   │   ├── nutrition/            # 饮食识别
│   │   ├── nutrition/history/    # 饮食历史
│   │   ├── chat/                 # AI 教练对话
│   │   ├── exercises/            # 动作库
│   │   ├── recovery/             # 恢复追踪
│   │   ├── history/              # 体态分析历史
│   │   ├── progress/             # 进度追踪
│   │   ├── export/               # 数据导出
│   │   ├── profile/              # 个人中心（订阅 + 用量 + 订单）
│   │   ├── pricing/              # 定价页
│   │   ├── payment/              # 支付页
│   │   ├── settings/             # 用户设置
│   │   └── about/                # 关于
│   ├── components/               # 通用组件 (36 个)
│   │   ├── AuthProvider.tsx      # AuthGuard 路由守卫
│   │   ├── Navbar.tsx, Footer.tsx
│   │   ├── PhotoUpload.tsx       # 拍照/选图（blob URL 自动释放）
│   │   ├── ResultPanel.tsx       # 分析结果面板
│   │   ├── RadarChart.tsx        # 8 维度雷达图
│   │   ├── ScoreCard.tsx         # 评分卡
│   │   ├── QuotaBar.tsx          # 今日用量进度
│   │   ├── UpdatePrompt.tsx      # SW 更新提示
│   │   └── ...                   # 其它业务/通用组件
│   ├── lib/                      # 业务逻辑
│   │   ├── auth.ts               # JWT token / 用户存储 / authFetch
│   │   ├── AuthContext.tsx       # 全局 Auth Context
│   │   ├── cloudStorage.ts       # 云端同步封装
│   │   ├── storage.ts            # 体态分析本地存储（含云端合并）
│   │   ├── workoutStorage.ts     # 训练记录存储
│   │   ├── nutritionStorage.ts   # 饮食记录存储
│   │   ├── planStorage.ts        # 训练方案存储
│   │   ├── userStorage.ts        # 用户配置存储
│   │   ├── recovery.ts           # 恢复度计算 / 热力图
│   │   ├── dashboard.ts          # 仪表盘数据聚合
│   │   ├── exportData.ts         # CSV/JSON 导出（含 CSV 注入防御）
│   │   └── imageUtils.ts         # 图片压缩
│   ├── hooks/
│   │   └── useServiceWorker.ts   # SW 注册/更新/断网监听
│   ├── types/                    # TS 类型（analysis/nutrition/plan/user/workout）
│   ├── data/                     # 静态数据（动作库等）
│   └── test/                     # Vitest 配置/工具
├── next.config.js                # Next 配置 + 安全头
├── tailwind.config.js            # Tailwind 主题（primary 灰色色阶）
├── tsconfig.json                 # TS 配置（target: es2017）
├── vitest.config.ts              # Vitest 配置
├── Dockerfile                    # Docker 镜像
├── railway.json                  # Railway 部署配置
└── .env.local                    # 环境变量（不入 git）
```

## 路由表

| 路径 | 说明 | 认证 |
|------|------|------|
| `/` | 首页分流（未登录→Landing，登录/游客→Dashboard） | 公开 |
| `/login` | 登录/注册（带验证码） | 公开 |
| `/forgot-password` | 忘记密码 | 公开 |
| `/reset-password` | 重置密码 | 公开 |
| `/about` | 关于 | 公开 |
| `/pricing` | 定价 | 公开 |
| `/analyze` | 体态分析 | 已登录 |
| `/compare` | 前后对比 | 已登录 |
| `/plan` | 训练方案生成 | 已登录 |
| `/plans` | 方案列表 | 已登录 |
| `/workout` | 训练进行中 | 已登录 |
| `/workout/complete` | 训练完成 | 已登录 |
| `/workouts` | 训练记录 | 已登录 |
| `/nutrition` | 饮食识别 | 已登录 |
| `/nutrition/history` | 饮食历史 | 已登录 |
| `/chat` | AI 对话 | 已登录 |
| `/exercises` | 动作库 | 已登录 |
| `/recovery` | 恢复追踪 | 已登录 |
| `/history` | 体态分析历史 | 已登录 |
| `/progress` | 进度追踪 | 已登录 |
| `/export` | 数据导出 | 已登录 |
| `/profile` | 个人中心 | 已登录 |
| `/payment` | 支付 | 已登录 |
| `/settings` | 设置 | 已登录 |

## 状态管理与认证

### 三层结构
- `lib/auth.ts` — 最低层，操作 `localStorage` 的 token / user / guest 状态、提供 `authFetch` 封装（自动注入 Bearer、401 自动跳登录、清除游客态）
- `lib/AuthContext.tsx` — React Context，提供 `user / isAuthenticated / isGuest / isLoading` 与 `login / logout / enterGuestMode / refreshUser`
- `components/AuthProvider.tsx` — AuthGuard 守卫，未登录访问受保护路由自动跳 `/login` 并保存 redirectPath；已登录时首次进入触发 `syncLocalToCloud`（用 ref 防重复）

### 使用约定
- 登录/注册成功后必须调用 `useAuth().login(token, user)` 更新 Context，否则 AuthGuard 仍认为未登录
- 所有需要鉴权的 API 请求必须用 `authFetch`（自动处理 401 + token 注入），不要裸 `fetch` + `Authorization` 头
- 退出登录用 `logout()`（auth.ts），它会同时清 Context、清 localStorage、清 SW cache、跳 `/login`

## PWA / Service Worker

- `public/sw.js`：4 种缓存策略
  - 静态资源（`/_next/static/`）— Cache-First 长期缓存
  - 页面导航 — Network-First + 离线回退 `/offline.html`
  - API — Network-First 5 分钟短缓存（**敏感 API `/api/auth/*`、`/api/orders`、`/api/payment/*` 永不缓存**）
  - 图片 — Cache-First 30 天
- `manifest.json`：`theme_color` 与 Tailwind primary-900 (#171719) 一致
- `viewport`：允许用户缩放 (`maximumScale: 5`) 符合 WCAG 1.4.4

## 安全

- `next.config.js` 配置安全响应头：`X-Content-Type-Options`、`X-Frame-Options: DENY`、`Referrer-Policy`、`Permissions-Policy`、`Strict-Transport-Security`
- `reactStrictMode: true`、`poweredByHeader: false`
- `lib/exportData.ts` 的 `csvEscape` 函数对 `=+-@` 开头的单元格前置单引号，防 Excel 公式注入
- `forgotPassword` 客户端只接收 `message` 字段，丢弃任何 `token`/`resetUrl` 等敏感字段
- 登录/注册/重置密码页面均加显式邮箱正则校验，不依赖 HTML5 `type="email"`

## 配色系统

| 用途 | Tailwind 类 | 色值 |
|------|-------------|------|
| 主背景 | `bg-primary-50` | `#f0fdf4` |
| 边框 | `border-primary-200` | `#bbf7d0` |
| 次要文字 | `text-primary-400` | `#4ade80` |
| 主要文字 | `text-primary-700` | `#15803d` |
| 按钮/强调 | `bg-primary-500` | `#22c55e` |
| 深色背景 | `bg-primary-900` | `#14532d` |

> 2026-06-20 从灰色系迁移至绿色系，详见 `tailwind.config.js`

## 部署

### Railway
```bash
railway up
```
`railway.json` 已配置构建与启动命令。

### Docker
```bash
docker build -t kb-coach-web .
docker run -p 3000:3000 -e NEXT_PUBLIC_API_URL=https://api.example.com/api kb-coach-web
```

### 生产环境变量
- `NEXT_PUBLIC_API_URL` — 必填，后端 API 基址（HTTPS）
- `NODE_ENV=production`

## 代码审查修复（2026-06-20）

### Critical
- `ChatMessage.tsx` / `chat/page.tsx` `Bot` 图标未导入导致聊天页崩溃 → 添加 `import { Bot } from 'lucide-react'`
- `compare/page.tsx` `Camera` 图标未导入 → 添加导入

### High
- `chat/page.tsx` `handleSend` 闭包过期导致 AI 缺少当前消息上下文 → 改用函数式更新获取最新 `messages`
- `AuthContext.tsx` value 对象每次渲染重建导致级联重渲染 → `useMemo` 包装

### Medium
- `planStorage.ts` `clearAllPlans()` 不同步云端 → 添加后端 `DELETE /api/data/plans` 端点 + 前端云端同步
- `iconMap.tsx` TypeScript 类型转换错误 → 通过 `unknown` 中间类型修复

### 构建验证
- ✅ TypeScript 编译零错误
- ✅ Next.js 构建全部 22 页面成功

---

## 代码审查修复（2026-06-13）

### Critical
- 登录后未更新 AuthContext 导致被 AuthGuard 踢回 `/login` → 改用 `useAuth().login`
- `forgotPassword` 类型签名包含 `token`/`resetUrl` 字段 → 改为白名单 `{ message }`
- 4 个业务页面用裸 `fetch` 绕过 `authFetch` 导致 401 时崩溃 → 全部切到 `authFetch`
- 多处 `new Error(data.error)` 当 `error` 为 undefined 时显示空字符串 → 加默认文案
- `useServiceWorker` 的 `setInterval` 与 `controllerchange` 监听器从未清理 → 加 cleanup
- `app/workout/page.tsx` 空训练日 `currentExercise.name` 直接崩 → 加空数组防御与友好提示
- Service Worker 缓存 `/api/auth/*` 等敏感 API → 黑名单跳过

### High
- `lib/storage.ts` `compressImage` 图片加载失败时 Promise 永不 resolve → 补 `onerror` + `reject`
- `app/chat/page.tsx` 历史加载会覆盖用户刚发的消息 → `cancelled` 标志 + 保留 userAdded
- `ResultPanel` / `ScoreCard` / `RadarChart` 的 `requestAnimationFrame` 未 cancel → 加 `cancelAnimationFrame`
- `AuthGuard` 每次路由变化都触发 `syncLocalToCloud` → `syncedRef` 防重复
- `PhotoUpload` blob URL 从不 revoke → 用 `previewRef` 在新选图/卸载时释放
- `saveToLocal` QuotaExceededError 仅丢一条 → 循环丢弃至 100 条上限

### Medium
- `lib/recovery.ts` `formatHours` `if (days === 0)` 死代码删除
- `HomePage` 未识别游客模式 → `isAuthenticated() || isGuest()`
- `DashboardPage` 无错误处理 / 卸载 setState → `cancelled` + try/catch + 加载失败 UI
- `Navbar` 用 `getUser()` 而非 `useAuth()` → 改用 Context 同步状态
- `next.config.js` 全空 → 加 `reactStrictMode` + 安全头
- `cloudToLocal` 对云端损坏数据无防御 → 全字段默认值
- `latestAnalysis` 写入失败 → try/catch
- `/workout/complete` `pendingWorkout` 永不过期 → 1 小时过期机制
- `workout/page.tsx` 刷新页面 `startTime=0` 导致 duration 异常 → sessionStorage 持久化

### Low
- `viewport.maximumScale: 1, userScalable: false` 违反 WCAG → 允许缩放
- manifest `theme_color` 绿色 vs UI 灰色 → 统一为 `#171717`
- `tsconfig target: es5` 过旧 → 升级到 `es2017`
- CSV 导出无注入防御 → `csvEscape` 函数
- 登录/注册无邮箱正则 → 显式校验

## 已知限制 / 后续改进

| 优先级 | 项 | 说明 |
|--------|----|------|
| HIGH | Token 存 localStorage | 易遭 XSS，长期方案应迁 httpOnly cookie + SameSite=Strict |
| HIGH | `iconMap.tsx` 全量导入 lucide-react | ~1000 图标全量打包，应改为按需导入 |
| HIGH | 全站零 a11y 属性 | WCAG 2.1 AA 合规性缺失，需系统性添加 `aria-*` / `role` |
| MEDIUM | `cloudStorage.ts` 大量 `any` 类型 | 类型不安全，应为各存储模块定义云端数据接口 |
| MEDIUM | `cloudStorage.ts` 4 处 `console.log` 残留 | 生产环境信息泄露 |
| MEDIUM | Toast / Loading 状态分散 | 各页面自行管理，可抽统一 `useRequest` hook |
| MEDIUM | Modal a11y | 多个弹窗无 Escape 关闭、focus trap、`aria-modal` |
| LOW | 无 CSP 头 | next.config.js 已设基础安全头，但未配置 CSP |
| LOW | 没有 E2E | 仅有 Vitest 单测，建议加 Playwright |
| LOW | 无 ESLint 配置 | `next lint` 启动需要交互式配置，建议加 `eslint.config.js` |

---
*Web 前端文档 — 随开发进度更新*
