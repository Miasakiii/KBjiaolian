# KB教练 - AI 健身康复应用

> 🏋️ AI 驱动的体态评估与健身训练平台

## 简介

KB教练是一个全平台健身康复应用，通过 AI 技术为用户提供个性化的体态评估、训练计划、营养建议和运动指导。

## 功能特性

- 🎯 **体态分析** — AI 驱动的 8 维度体态评估（头前伸/圆肩/骨盆前倾/膝超伸/脊柱侧弯/高低肩/XO型腿/核心稳定）
- 📋 **训练计划** — 个性化训练方案生成 + 渐进式超负荷算法
- 🥗 **营养管理** — 食物拍照识别 + 营养成分估算
- 💬 **AI 聊天** — 智能健身问答（流式响应）
- 📊 **历史记录** — 体态/训练/饮食/聊天全维度历史追踪 + 前后对比
- 🔄 **恢复追踪** — 肌肉恢复进度 + 4 周训练热力图
- ⚙️ **商业化** — Free/Pro 套餐、配额管理、订单系统、微信支付基建
- 📱 **PWA + 移动端** — Web 端支持离线、Flutter 支持 Android/iOS/Windows

## 技术栈

| 层级 | 技术 |
|------|------|
| Web 前端 | Next.js 14 App Router + React 18 + TypeScript + Tailwind CSS |
| 移动端/桌面端 | Flutter 3.44.2 + Provider 6 + go_router 12 |
| 后端 | Express.js 4 + better-sqlite3 + JWT |
| AI | MiMo / OpenAI 兼容 Chat Completions API |
| 认证 | JWT + bcrypt + 邮箱验证码 |
| 本地存储 | Web: localStorage；Mobile: SharedPreferences |
| 部署 | Docker Compose + Nginx + SSL，支持 Railway |

## 模块文档

- [Web 前端](web/README.md) — Next.js 路由、组件、状态管理、PWA、安全
- [后端 API](backend/README.md) — Express 路由、数据库、AI 模块、配额/订单系统
- [移动端](mobile/README.md) — Flutter 路由、Provider、网络层、主题
- [项目状态](docs/project-status.md) — Sprint 进度、API/页面/数据库清单、待办

## 快速开始

### 前置要求

- Node.js 18+
- Flutter 3.44.2+（如需移动端）
- Android Studio / Xcode（如需构建 APK/IPA）

### 启动后端

```bash
cd backend
npm install
cp .env.example .env  # 编辑 JWT_SECRET / MIMO_API_KEY 等
npm run dev
# API: http://localhost:3001
```

### 启动 Web 前端

```bash
cd web
npm install
npm run dev
# Web: http://localhost:3000
```

### 启动 Flutter 移动端

```bash
cd mobile
flutter pub get
flutter run                    # Android 模拟器（API: 10.0.2.2:3001）
# 或生产配置：
flutter run --dart-define=API_BASE_URL=https://api.your-host.com/api
```

### 启动 Flutter Windows 桌面端

```bash
cd mobile
flutter pub get
flutter run -d windows
```

## 项目结构

```
KBjiaolian/
├── web/                    # Next.js Web 前端（详见 web/README.md）
│   ├── src/
│   │   ├── app/            # 25 个路由
│   │   ├── components/     # 36 个组件
│   │   ├── lib/            # auth/storage/cloudStorage 等
│   │   ├── hooks/
│   │   └── types/
│   ├── public/sw.js        # Service Worker
│   └── README.md
├── backend/                # Express.js 后端（详见 backend/README.md）
│   ├── src/
│   │   ├── app.js          # 路由 + 限流
│   │   ├── auth.js         # 注册/登录/验证码
│   │   ├── analyze.js / plan.js / nutrition.js / chat.js  # AI 模块
│   │   ├── subscription.js # 配额预占/释放 + 套餐升级
│   │   ├── orders.js       # 订单 + 微信支付参数
│   │   ├── data.js         # 数据持久化 CRUD
│   │   └── database.js     # SQLite 表结构
│   ├── __tests__/          # 9 个测试套件
│   └── README.md
├── mobile/                 # Flutter 移动端（详见 mobile/README.md）
│   ├── lib/
│   │   ├── screens/        # 10 个页面
│   │   ├── providers/      # 6 个 ChangeNotifier
│   │   ├── services/       # api/storage/cloud
│   │   ├── models/
│   │   ├── widgets/
│   │   └── routes/
│   ├── android/            # 已禁用 cleartextTraffic
│   ├── windows/
│   └── README.md
├── docs/                   # 项目文档
├── deploy.sh / docker-compose.yml / nginx/  # 部署配置
└── README.md               # 本文件
```

## API 接口

公开端点（无需认证）：

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/health` | GET | 健康检查 |
| `/api/auth/register` | POST | 注册（需验证码） |
| `/api/auth/login` | POST | 登录 |
| `/api/auth/send-code` | POST | 发送邮箱验证码 |
| `/api/auth/forgot-password` | POST | 发送重置验证码 |
| `/api/auth/reset-password` | POST | 重置密码 |
| `/api/plans` | GET | 套餐信息 |

需认证端点（Bearer JWT）：

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/auth/profile` | GET | 用户信息 |
| `/api/quota` | GET | 今日配额 |
| `/api/analyze` | POST | 体态分析（限额） |
| `/api/analyze/compare` | POST | 前后对比 |
| `/api/plan/generate` | POST | 训练方案（限额） |
| `/api/plan/progressive` | POST | 渐进式方案（限额） |
| `/api/nutrition/analyze` | POST | 食物识别（限额） |
| `/api/chat` `(/stream)` | POST | AI 对话（限额） |
| `/api/orders` | POST/GET | 订单创建/查询 |
| `/api/payment/mock-pay/:id` | POST | 模拟支付（仅非生产） |
| `/api/data/*` | CRUD | 数据持久化（分析/方案/训练/饮食/聊天） |

完整 API 说明详见 [backend/README.md](backend/README.md)。

## 国内镜像

```bash
# Flutter 镜像
export PUB_HOSTED_URL="https://pub.flutter-io.cn"
export FLUTTER_STORAGE_BASE_URL="https://storage.flutter-io.cn"

# npm 镜像（如需）
npm config set registry https://registry.npmmirror.com
```

## 代码审查与修复记录（2026-06）

本轮对 Web / Backend / Mobile 三个模块全量审查并修复 **88 个问题**，详见各模块 README 的"本轮代码审查修复"章节：

| 等级 | Backend | Web | Mobile | 合计 |
|------|---------|-----|--------|------|
| Critical | 5 | 7 | 9 | **21** |
| High | 9 | 6 | 12 | **27** |
| Medium | 7 | 9 | 8 | **24** |
| Low | 5 | 5 | 6 | **16** |
| **合计** | 26 | 27 | 35 | **88** |

## 文档

- [项目状态总结](docs/project-status.md) — Sprint 完成情况、API/页面/数据库清单
- [Web 前端](web/README.md)
- [后端 API](backend/README.md)
- [移动端](mobile/README.md)
- [部署指南](docs/deployment-guide.md)
- [云端部署](docs/CLOUD_DEPLOY.md)

## 许可

Private — 仅供个人使用

---

*Built with ❤️ by KB Coach Team*
