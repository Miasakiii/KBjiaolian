# KB教练 — 项目目录结构

> 最后更新：2026-06-15

```
kb-coach/
│
├── README.md                     # 产品总览
├── PROJECT-STRUCTURE.md          # 本文件
│
├── docs/
│   ├── tech-spec.md              # 技术规格（API、Prompt、安全）
│   ├── design-system.md          # 设计规范（颜色、字体、组件）
│   ├── competitive-analysis.md   # 竞品分析
│   ├── user-personas.md          # 用户画像
│   └── monetization.md           # 商业化方案
│
├── backend/                      # 后端服务 ✅ 运行中
│   ├── package.json
│   ├── .env                      # ⚠️ 含真实 API 密钥
│   ├── .env.example
│   ├── .gitignore
│   ├── data/
│   │   └── kb-coach.db           # SQLite 数据库
│   └── src/
│       ├── index.js              # Express 入口，路由注册
│       ├── auth.js               # JWT 认证（注册/登录/中间件）
│       ├── database.js           # SQLite 数据库初始化（6 张表）
│       ├── data.js               # 数据持久化 CRUD API
│       ├── validation.js         # 输入校验工具
│       ├── analyze.js            # 体态分析（MiMo 视觉）
│       ├── plan.js               # 训练方案生成
│       ├── nutrition.js          # 食物识别
│       └── chat.js               # AI 对话（普通 + 流式）
│
├── web/                          # Next.js 桌面端 ✅ 完整
│   ├── package.json
│   ├── next.config.js
│   ├── tailwind.config.js
│   └── src/
│       ├── app/
│       │   ├── page.tsx          # 首页 Dashboard
│       │   ├── login/page.tsx    # 登录/注册页面 ✨ 新增
│       │   ├── analyze/          # 体态分析
│       │   ├── chat/             # AI 对话
│       │   ├── plan/             # 训练方案生成
│       │   ├── plans/            # 方案列表
│       │   ├── workout/          # 训练执行 + 完成
│       │   ├── workouts/         # 训练记录
│       │   ├── nutrition/        # 饮食识别 + 历史
│       │   ├── compare/          # 进度对比
│       │   ├── progress/         # 进度趋势
│       │   ├── history/          # 分析历史
│       │   ├── export/           # 数据导出
│       │   ├── settings/         # 用户设置
│       │   └── about/            # 关于页面
│       ├── components/
│       │   ├── Navbar.tsx        # 导航栏（含用户信息/登出）
│       │   └── AuthProvider.tsx  # 路由保护 + 数据同步 ✨ 新增
│       ├── lib/
│       │   ├── auth.ts           # 认证工具 ✨ 新增
│       │   ├── cloudStorage.ts   # 云端存储客户端 ✨ 新增
│       │   ├── storage.ts        # 本地存储（双模式）
│       │   ├── workoutStorage.ts # 训练存储（双模式）
│       │   ├── planStorage.ts    # 方案存储（双模式）
│       │   ├── nutritionStorage.ts # 饮食存储（双模式）
│       │   ├── dashboard.ts
│       │   └── export.ts
│       └── types/                # 5 个类型定义
│
├── mobile/                       # Flutter 移动端 ✅ 完整
│   ├── pubspec.yaml
│   ├── lib/
│   │   ├── main.dart             # 入口（含 AuthProvider）
│   │   ├── app.dart              # 主题 + 路由
│   │   ├── routes/app_router.dart # 路由守卫 ✨ 新增
│   │   ├── screens/
│   │   │   ├── login_screen.dart # 登录/注册页面 ✨ 新增
│   │   │   ├── home_screen.dart
│   │   │   ├── analyze_screen.dart
│   │   │   ├── plan_screen.dart
│   │   │   ├── workout_screen.dart
│   │   │   ├── nutrition_screen.dart
│   │   │   ├── chat_screen.dart
│   │   │   ├── history_screen.dart
│   │   │   ├── settings_screen.dart # 用户信息 + 登出
│   │   │   └── about_screen.dart
│   │   ├── providers/
│   │   │   ├── auth_provider.dart    # 认证状态管理 ✨ 新增
│   │   │   ├── analysis_provider.dart # 云端同步
│   │   │   ├── plan_provider.dart    # 云端同步
│   │   │   ├── workout_provider.dart # 云端同步
│   │   │   ├── nutrition_provider.dart # 云端同步
│   │   │   └── chat_provider.dart    # 云端同步
│   │   ├── widgets/
│   │   ├── services/
│   │   │   ├── api_service.dart      # 含认证请求方法
│   │   │   ├── storage_service.dart
│   │   │   └── cloud_storage_service.dart # 云端 API 客户端 ✨ 新增
│   │   └── models/
│   │       └── analysis_result.dart
│   ├── android/                  # Android 构建配置
│   └── windows/                  # Windows 桌面构建
│
├── fitness-data/                 # 用户体态数据
│   ├── profile.json
│   ├── photos/
│   └── assessments/
│
└── docs/superpowers/             # 开发计划文档
    ├── specs/                    # 设计规格
    └── plans/                    # 实施计划
```

## 启动顺序

```bash
# 1. 后端
cd backend && npm install && npm start

# 2. 桌面端
cd web && npm install && npm run dev

# 3. 移动端（需要 Android 模拟器或真机）
cd mobile && flutter pub get && flutter run
```

## 环境要求

| 工具 | 版本 | 备注 |
|------|------|------|
| Node.js | 18+ | 后端 + Web |
| Flutter | 3.44.2 | 移动端 |
| JDK | LibericaJDK-21 | Android 构建（不要用 Android Studio JBR） |
| Android SDK | 36 | compileSdk=36 |
| Gradle | 9.1.0 | 通过腾讯镜像下载 |

## 当前状态 (2026-06-15)

### 已完成
- ✅ **后端安全**: JWT 认证 + 3 层速率限制 + 输入校验
- ✅ **数据持久化**: SQLite 6 张表 (users, analysis_records, training_plans, workout_records, nutrition_records, chat_history)
- ✅ **Web 端**: 16 个页面 + 认证 + 路由保护 + 云端同步
- ✅ **Flutter 端**: 10 个页面 + 认证 + 路由守卫 + 云端同步
- ✅ **核心流程**: 注册登录 → 拍照分析 → 生成方案 → 训练打卡 → 饮食记录 → AI 对话

### 架构特点
- **双模式存储**: localStorage/SharedPreferences (即时) + 云端 API (异步同步)
- **路由保护**: 未登录自动跳转登录页
- **数据同步**: 登录后自动同步本地数据到云端

### 待完成
- 🟢 测试覆盖（当前 0%）
- 🟢 PWA 图标资源
- 🟢 错误边界组件
- 🟢 生产部署配置

## API 端点

### 认证
- `POST /api/auth/register` — 注册
- `POST /api/auth/login` — 登录
- `GET /api/auth/profile` — 获取用户信息

### 业务（需认证）
- `POST /api/analyze` — 体态分析
- `POST /api/plan/generate` — 生成训练方案
- `POST /api/nutrition/analyze` — 食物识别
- `POST /api/chat` — AI 对话（自动保存历史）

### 数据 CRUD（需认证）
- `GET/POST/DELETE /api/data/analysis` — 分析记录
- `GET/POST/DELETE /api/data/plans` — 训练方案
- `GET/POST/DELETE /api/data/workouts` — 训练记录
- `GET/POST/DELETE /api/data/nutrition` — 饮食记录
- `GET/DELETE /api/data/chat` — 聊天历史

### 系统
- `GET /api/health` — 健康检查
