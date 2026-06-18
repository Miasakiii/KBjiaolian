# KB教练 — 项目状态总结

> 更新时间: 2026-06-17 | Sprint 1-4 全部完成 + 体验优化

## 项目概述

KB教练是一个 AI 驱动的健身康复应用，帮助用户进行体态评估、训练计划、营养管理和运动指导。

## 技术架构

```
┌─────────────────────────────────────────────────────┐
│                    客户端层                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │ Web 前端  │  │ Flutter  │  │ Flutter 桌面端    │  │
│  │ Next.js   │  │ 移动端   │  │ Windows          │  │
│  │ :3000     │  │ (待修复) │  │ (已构建)         │  │
│  └──────────┘  └──────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│                  后端服务层                           │
│  ┌──────────────────────────────────────────────┐  │
│  │  Express.js API  :3001                       │  │
│  │  - 体态分析（8 维度）                          │  │
│  │  - 前后对比分析                               │  │
│  │  - 渐进式训练方案                              │  │
│  │  - 营养识别 / AI 对话                          │  │
│  │  - 验证码注册 + JWT 认证                       │  │
│  │  - 使用量配额 + 订单系统                        │  │
│  └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│                  数据层                              │
│  ┌──────────────────────────────────────────────┐  │
│  │  SQLite (better-sqlite3)                     │  │
│  │  10 张表: users, analysis, plans, workouts,   │  │
│  │  nutrition, chat, orders, usage_logs,         │  │
│  │  verification_codes, password_resets         │  │
│  └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

## Sprint 完成情况

### ✅ Sprint 1 — 核心竞争力加固
- 体态分析 4→8 维度（头前伸/圆肩/骨盆前倾/膝超伸/脊柱侧弯/高低肩/XO型腿/腹直肌分离）
- 前后对比分析（选择两次记录 → AI 变化报告）
- 8 维度雷达图 + 专业评估报告导出

### ✅ Sprint 2 — 智能训练闭环
- 渐进式超负荷算法（基于历史训练数据自动调整）
- 登录体验优化（游客模式 + 登录回跳 + 密码重置）
- UX 优化（骨架屏 + 空状态引导 + Toast 通知）

### ✅ Sprint 3 — 功能补全
- PWA 离线支持（Service Worker 4 缓存策略 + 离线回退）
- 训练动作库（28 个标准动作，按肌群/难度筛选）
- 恢复追踪（肌肉恢复进度 + 4 周训练热力图）

### ✅ Sprint 4 — 商业化
- 使用量限制（Free/Pro 套餐，每日配额检查）
- 定价页 + 支付页（诱饵定价 + 微信支付基建）
- 订单系统（创建/查询/回调，模拟支付）

### ✅ 体验优化
- 首页分流（未登录→落地宣传页，已登录→仪表盘）
- 个人中心（订阅状态 + 用量统计 + 订单历史）
- 验证码注册（邮箱验证码 → 注册，控制台打印开发模式）
- 定价策略重构（诱饵定价，Free 2/1/2/5，Pro 年度 ¥168/年）
- Emoji → Lucide Icon 迁移（全站统一图标）
- UI 风格统一（primary 色改为黑灰色系）

## 页面清单（25 页）

| 页面 | 路径 | 说明 |
|------|------|------|
| 首页 | `/` | 未登录→落地宣传页，已登录→仪表盘 |
| 体态分析 | `/analyze` | 拍照上传 → AI 8 维度评估 + 配额提示 |
| 前后对比 | `/compare` | 选择两次分析记录 → AI 变化报告 |
| 训练方案 | `/plan` | 参数表单 → AI 个性化方案 |
| 方案列表 | `/plans` | 保存的训练方案管理 |
| 训练中 | `/workout` | 训练计时器 + 组数记录 |
| 训练完成 | `/workout/complete` | 训练总结 + 评分 |
| 训练历史 | `/workouts` | 所有训练记录列表 |
| 进度追踪 | `/progress` | 训练数据图表 |
| 饮食识别 | `/nutrition` | 拍照识别食物 + 营养分析 |
| 饮食历史 | `/nutrition/history` | 饮食记录列表 |
| AI 对话 | `/chat` | 流式响应的智能教练对话 |
| 动作库 | `/exercises` | 28 个标准动作，按肌群/难度筛选 |
| 恢复追踪 | `/recovery` | 肌肉恢复进度 + 4 周热力图 |
| 历史记录 | `/history` | 体态分析历史 |
| 数据导出 | `/export` | 导出分析/训练/饮食数据 |
| 关于我们 | `/about` | 产品介绍 |
| 设置 | `/settings` | 账户设置 |
| **登录** | `/login` | 邮箱 + 验证码注册 / 密码登录 + 游客模式 |
| **忘记密码** | `/forgot-password` | 邮箱验证码 → 重置密码 |
| **定价** | `/pricing` | Free/Pro 套餐对比 + 诱饵定价 |
| **支付** | `/payment` | 微信支付 + 模拟支付（开发） |
| **个人中心** | `/profile` | 订阅状态 + 用量 + 订单 + 账户信息 |

## 组件清单（36 个）

| 类别 | 组件 |
|------|------|
| 布局 | Navbar, Footer |
| 分析 | PhotoUpload, ResultPanel, RadarChart, ScoreCard, TipsCard, SuggestionList, ExportReport |
| 训练 | PlanForm, PlanResult, DaySchedule, ExerciseItem, ExerciseDetail, WorkoutTimer, ExerciseSet, WorkoutStats, WorkoutCard |
| 饮食 | NutritionCard, FoodResult, TodayNutrition |
| 对话 | ChatMessage |
| 仪表盘 | DashboardStats, QuickActions, TodayTasks, RecentActivity, ProgressChart |
| 通用 | Skeleton, EmptyState, LazyImage, AuthProvider, UpdatePrompt |
| 商业化 | QuotaBar, ExerciseCard, ExerciseDetailModal |

## 后端 API 清单

### 公开端点
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/health` | 健康检查 |
| POST | `/api/auth/register` | 注册（需要验证码） |
| POST | `/api/auth/login` | 登录 |
| POST | `/api/auth/send-code` | 发送邮箱验证码（60s 冷却） |
| POST | `/api/auth/forgot-password` | 发送重置验证码 |
| POST | `/api/auth/reset-password` | 重置密码（需要验证码） |
| GET | `/api/plans` | 套餐信息 |

### 需认证端点
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/auth/profile` | 用户信息（含 plan） |
| GET | `/api/quota` | 今日配额用量 |
| POST | `/api/analyze` | 体态分析（限额） |
| POST | `/api/analyze/compare` | 前后对比（限额） |
| POST | `/api/plan/generate` | 训练方案生成（限额） |
| POST | `/api/plan/progressive` | 渐进式方案（限额） |
| GET | `/api/plan/progression` | 训练建议 |
| POST | `/api/nutrition/analyze` | 饮食识别（限额） |
| POST | `/api/chat` | AI 对话（限额） |
| POST | `/api/chat/stream` | AI 流式对话（限额） |
| POST | `/api/orders` | 创建订单 |
| GET | `/api/orders` | 订单列表 |
| GET | `/api/orders/:id` | 订单详情 |
| POST | `/api/payment/mock-pay/:id` | 模拟支付 |
| POST | `/api/payment/wechat/notify` | 微信回调 |
| CRUD | `/api/data/*` | 数据持久化（分析/方案/训练/饮食/聊天） |

## 数据库表（10 张）

| 表名 | 说明 | 关键字段 |
|------|------|----------|
| users | 用户 | id, email, password, nickname, plan, plan_expires_at |
| analysis_records | 体态分析 | user_id, score, issues(JSON), radar(JSON) |
| training_plans | 训练方案 | user_id, goal, schedule(JSON) |
| workout_records | 训练记录 | user_id, exercises(JSON), rating, duration |
| nutrition_records | 饮食记录 | user_id, foods(JSON), total_calories |
| chat_history | 聊天记录 | user_id, role, content |
| verification_codes | 验证码 | email, code, type(register/reset), used, expires_at |
| password_resets | 密码重置 | user_id, token, expires_at, used |
| orders | 订单 | user_id, plan, amount, status, trade_no |
| usage_logs | 使用量 | user_id, action, created_at |

## 商业化配置

### 套餐定价（诱饵定价策略）

| 套餐 | 价格 | 体态分析 | 训练方案 | 饮食识别 | AI 对话 |
|------|------|----------|----------|----------|---------|
| 免费版 | ¥0 | 2次/天 | 1次/天 | 2次/天 | 5次/天 |
| Pro 月度 | ¥29.90/月 | 25次/天 | 10次/天 | 25次/天 | 100次/天 |
| **Pro 年度** | **¥168/年** | 25次/天 | 10次/天 | 25次/天 | 100次/天 |

- Pro 月度为诱饵价格，让年度（¥14/月）显得超值
- 年度省 53%，对比线下私教 ¥300/节
- Pro 额外功能：渐进超负荷、前后对比、恢复追踪、数据导出

### 支付流程
```
用户选择套餐 → POST /api/orders → 返回支付参数 → 展示二维码
→ 微信扫码 → 回调 /api/payment/wechat/notify → 升级用户 plan
```
> 当前为模拟支付，生产环境需接入微信支付 API

## 注册认证流程

### 注册（邮箱验证码）
```
输入邮箱+密码 → POST /api/auth/send-code → 验证码打印到控制台
→ 输入验证码 → POST /api/auth/register → 创建用户+返回JWT
```

### 登录
```
输入邮箱+密码 → POST /api/auth/login → 返回JWT
```

### 忘记密码
```
输入邮箱 → POST /api/auth/forgot-password → 验证码打印到控制台
→ 输入验证码+新密码 → POST /api/auth/reset-password → 密码重置
```
> 验证码当前为控制台打印模式，生产环境需接入邮件服务（Resend/QQ邮箱SMTP）

## 前端技术规范

### 图标系统
- 使用 `lucide-react` 图标库（tree-shakeable，风格统一）
- 全站已从 emoji 迁移到 Lucide icon

### 配色方案
- `primary` 色系：黑灰（#fafafa → #171717），统一全站风格
- 重点色：gray-900（按钮/强调）、gray-400（次要文字）、gray-200（边框）

### 首页分流
- 未登录用户：落地宣传页（Hero + 功能展示 + 定价 + 用户评价 + CTA）
- 已登录用户：仪表盘（统计卡片 + 快捷操作 + 今日任务 + 最近活动）

## 技术栈

| 层 | 技术 |
|---|---|
| Web 前端 | Next.js 14 App Router, Tailwind CSS, TypeScript, Lucide React |
| 移动端 | Flutter (Dart) |
| 后端 | Express.js, Node.js |
| 数据库 | SQLite (better-sqlite3) |
| AI | OpenAI / DeepSeek API |
| 认证 | JWT + bcrypt + 邮箱验证码 |
| 部署 | Docker Compose + Nginx + SSL |

## 启动指南

### 快速启动 (Web + 后端)

**终端 1 - 后端:**
```bash
cd backend
npm run dev
# API 运行在 http://localhost:3001
```

**终端 2 - Web 前端:**
```bash
cd web
npm run dev
# Web 运行在 http://localhost:3000
```

## 待办 / 下一步

| 优先级 | 任务 | 说明 |
|--------|------|------|
| 🔴 P0 | 接入真实微信支付 | 替换模拟支付，配置商户号 |
| 🔴 P0 | 接入邮件服务 | 替换控制台打印，用 Resend/QQ邮箱 SMTP 发验证码 |
| 🟡 P1 | Flutter Android 修复 | Kotlin 编译问题 |
| 🟡 P1 | 数据备份策略 | SQLite 定期备份 |
| 🟢 P2 | 社区功能 | 用户互动、分享 |
| 🟢 P2 | 穿戴设备整合 | Apple Watch / 手环数据 |

---

*文档维护: 项目进展文档，请随开发进度更新*
