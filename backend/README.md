# KB教练 — 后端 API（可选/历史参考）

> ⚠️ **个人版移动端不再依赖此后端**。当前移动端为纯本地架构，直连小米 MiMo API，数据存 SharedPreferences，动作库打包进 assets。此目录保留 Express.js 后端代码供开发参考（如需独立运行数据持久化服务或多用户场景）。

Express.js + better-sqlite3 + JWT 认证的本地后端服务，提供体态分析、训练方案、营养识别、AI 对话等 API。所有数据存于本机 SQLite，无商业化、无配额、无云备份。

内置 1,324 个训练动作库（来自 [hasaneyldrm/exercises-dataset](https://github.com/hasaneyldrm/exercises-dataset)，含中文逐步说明），AI 方案生成时引用真实动作，避免凭空捏造。

## 动作库数据集

**数据来源**：[hasaneyldrm/exercises-dataset](https://github.com/hasaneyldrm/exercises-dataset)（1,324 条，10 个身体部位，12 种设备，6 种语言含中文）

### 首次导入

```bash
cd backend
npm run fetch-exercises   # 下载 exercises.json 到 data/exercises.json
npm run dev               # 启动时自动检测并导入到 SQLite（若表为空）
```

导入幂等（`INSERT OR IGNORE`），重复运行不会产生重复数据。导入状态见启动日志。

### 许可证说明

⚠️ 该数据集仓库未明确标注开源许可证，基础数据来自 ExerciseDB v1。个人版本地使用风险较低，但：
- 不可用于商业用途
- 如收到权利方投诉应立即移除
- 数据集**不含媒体文件**（`image`/`gif_url` 为 null），仅有文字说明

## 快速开始

```bash
cd backend
npm install
cp .env.example .env  # 编辑 JWT_SECRET / MIMO_API_KEY 等
npm run dev          # http://localhost:3003
```

环境变量（`.env`，参考 `.env.example`）：

```bash
PORT=3003
JWT_SECRET=your-jwt-secret-here        # 必填，启动时强校验
JWT_EXPIRES_IN=7d                      # 可选，默认 7d
MIMO_API_KEY=sk-your-api-key-here      # 必填（测试环境跳过）
MIMO_API_URL=https://api.xiaomimimo.com/v1/chat/completions
MIMO_MODEL=mimo-v2.5
RESEND_API_KEY=re-your-api-key-here    # 可选，未配置时验证码打印到控制台
MAIL_FROM=KB教练 <noreply@kbcoach.app>
# CORS_ORIGIN=http://localhost:3000    # 可选，留空则使用本机调试默认值
```

> 模块加载时若 `JWT_SECRET` 缺失会立即 fail-fast；若 `MIMO_API_URL`/`MIMO_API_KEY` 缺失（且非测试环境）同样 fail-fast。

## 脚本

| 命令 | 说明 |
|------|------|
| `npm run dev` | 开发模式（tsx watch 热重载） |
| `npm start` | 生产启动（需先 `npm run build`） |
| `npm run build` | TypeScript 编译 |
| `npm test` | Jest 测试套件 |
| `npm run test:watch` | 测试 watch 模式 |
| `npm run test:coverage` | 测试覆盖率 |
| `npm run typecheck` | 类型检查 |

## 目录结构

```
backend/
├── src/
│   ├── index.ts          # 入口：app.listen + SIGTERM/SIGINT 优雅关闭
│   ├── app.ts            # Express app + 路由 + 限流 + 全局兜底
│   ├── auth.ts           # 注册/登录/验证码/重置密码/JWT 中间件
│   ├── database.ts       # better-sqlite3 初始化 + 表结构 + 迁移 + WAL checkpoint
│   ├── data.ts           # 数据持久化 CRUD（分析/方案/训练/饮食/聊天）
│   ├── backup.ts         # SQLite 每日本地备份（保留 7 天）
│   ├── email.ts          # Resend 邮件服务（验证码邮件）
│   ├── logger.ts         # pino 结构化日志
│   ├── validation.ts     # 输入校验 + extractJsonObject（平衡括号 JSON 提取）
│   ├── progression.ts    # 渐进式超负荷算法（历史训练数据分析）
│   ├── analyze.ts        # 体态分析（8 维度）+ 前后对比
│   ├── plan.ts           # 训练方案生成（注入动作库候选，AI 输出 exerciseId）
│   ├── nutrition.ts      # 食物识别
│   ├── chat.ts           # AI 对话（普通 + 流式 SSE）
│   ├── exercises.ts      # 动作库 API（列表/详情/搜索/元数据 + AI 候选查询）
│   ├── exercises-seed.ts # 动作库数据集导入（启动时自动检测）
│   └── types.ts          # 共享类型定义
├── __tests__/            # Jest 测试（10 套件）
├── data/                 # SQLite 数据库 + backups/（运行时生成）
├── jest.config.js
├── tsconfig.json
└── .env.example
```

## API 路由

### 公开端点
| 方法 | 路径 | 说明 | 限流 |
|------|------|------|------|
| GET | `/api/health` | 健康检查 | 60/min |
| POST | `/api/auth/register` | 注册（需验证码） | 10/min |
| POST | `/api/auth/login` | 登录 | 10/min |
| POST | `/api/auth/send-code` | 发送验证码（60s 冷却） | 10/min |
| POST | `/api/auth/forgot-password` | 发送重置验证码 | 10/min |
| POST | `/api/auth/reset-password` | 重置密码（需验证码） | 10/min |

### 动作库（公开访问，静态数据）
| 方法 | 路径 | 说明 | 限流 |
|------|------|------|------|
| GET | `/api/exercises` | 动作列表（分页 + `bodyPart`/`equipment`/`target` 筛选） | 60/min |
| GET | `/api/exercises/:id` | 动作详情（含中文步骤说明） | 60/min |
| GET | `/api/exercises/meta` | 筛选选项聚合（所有 bodyPart/equipment/target 列表） | 60/min |
| GET | `/api/exercises/search?q=` | 名称/肌群模糊搜索 | 60/min |

### 需认证端点（Bearer JWT）
| 方法 | 路径 | 说明 | 限流 |
|------|------|------|------|
| GET | `/api/auth/profile` | 用户信息 | 60/min |
| POST | `/api/analyze` | 体态分析 | 20/min |
| POST | `/api/analyze/compare` | 前后对比 | 20/min |
| POST | `/api/plan/generate` | 训练方案 | 20/min |
| POST | `/api/plan/progressive` | 渐进式方案 | 20/min |
| GET | `/api/plan/progression` | 渐进式建议 | 60/min |
| POST | `/api/nutrition/analyze` | 食物识别 | 20/min |
| POST | `/api/chat` | AI 对话 | 20/min |
| POST | `/api/chat/stream` | AI 流式对话 (SSE) | 20/min |
| CRUD | `/api/data/analysis` `(/:id)` | 体态分析记录 | 60/min |
| CRUD | `/api/data/plans` `(/:id)` | 训练方案（DELETE 无 :id 则清空全部） | 60/min |
| CRUD | `/api/data/workouts` `(/:id)` | 训练记录 | 60/min |
| CRUD | `/api/data/nutrition` `(/:id)` | 饮食记录 | 60/min |
| GET/DELETE | `/api/data/chat` | 聊天历史 | 60/min |

## 数据库表（9 张）

| 表 | 用途 | 关键字段 |
|----|------|----------|
| users | 用户 | id (UUID), email UNIQUE, password (bcrypt), nickname |
| analysis_records | 体态分析 | user_id, score, issues(JSON), radar(JSON), suggestions(JSON) |
| training_plans | 训练方案 | user_id, goal, schedule(JSON), nutrition(JSON), duration_weeks |
| workout_records | 训练记录 | user_id, exercises(JSON), rating, duration, start_time, end_time |
| nutrition_records | 饮食记录 | user_id, foods(JSON), total_calories/protein/carbs/fat |
| chat_history | 聊天历史 | user_id, role(user/assistant), content |
| exercises | 动作库（1324 条） | id, name, body_part, equipment, target, instructions_zh |
| verification_codes | 邮箱验证码 | email, code, type(register/reset), used, attempts, expires_at |
| password_resets | 密码重置 token | user_id, token, expires_at, used |

索引：每个业务表都有 `(user_id, created_at DESC)` 复合索引。

## 认证机制

```
注册: 邮箱→send-code→输入验证码→register（验证码不立即标记，注册成功后才标记）
登录: email+password→bcrypt.compare（防用户枚举的时序攻击）→JWT
鉴权: Bearer JWT → authMiddleware → req.userId
重置: 邮箱→forgot-password→验证码→reset-password→bcrypt.hash→update
```

- JWT_SECRET 必填，启动时强校验（生产环境额外要求长度 ≥32 + 四类字符齐全 + 占位符黑名单）
- JWT_EXPIRES_IN 默认 7d，可通过环境变量覆盖
- 登录对不存在用户也执行一次 bcrypt 比较（用固定 dummy hash），防止时序攻击枚举用户
- 验证码 5 次错误后自动锁定，需重新获取

## AI 模块

四个 AI 模块（`analyze.ts`/`plan.ts`/`nutrition.ts`/`chat.ts`）共用模式：

- 启动校验 `MIMO_API_URL`/`MIMO_API_KEY`（测试环境跳过）
- 60 秒超时（`AbortController`）
- `sendMessageStream` 接受外部 `signal`，客户端断开时取消上游请求，避免连接泄漏
- AI 返回的 JSON 用 `validation.ts#extractJsonObject` 提取（先尝试 ` ```json ``` ` 围栏，再平衡括号扫描），取代贪婪正则
- 体态/营养分析的缓存键用 `crypto.createHash('sha256').update(全图).digest('hex')`，避免前缀/碰撞

### SSE 流式对话要点
- 路由内 `req.on('close', onAbort)` 监听客户端断开
- `headersSent` 标志：响应头已发送时无法改 status，仅能写错误事件后 `res.end()`
- `reader.releaseLock()` 在 finally 中调用
- `finally` 兜底 `abortController.abort()` 取消上游

## 数据备份

`backup.ts` 实现本地 SQLite 文件备份：

- 启动时立即备份一次
- 每 24 小时自动备份一次（`setInterval().unref()` 不阻止退出）
- 备份存于 `data/backups/kb-coach-YYYY-MM-DD.db`
- 自动清理超过 7 天的旧备份
- `database.ts` 每 5 分钟执行 `wal_checkpoint(TRUNCATE)`，防止 WAL 文件无限增长
- 关闭前执行最后一次 checkpoint，再 `db.close()`

## 输入校验与安全

- `validation.ts` 提供：`isValidBase64Image`、`isValidGoal/Experience/Equipment`、`isValidChatMessage/History`、`sanitizeString`
- `data.ts` 所有 `saveXxx` 加白名单字段与上限（图片预览 2MB、字符串 5K、ID 64 字符、分页 100 上限）
- 邮箱正则采用 RFC 5322 简化版
- 密码强度：6-100 字符且必须包含字母 + 数字（生产环境额外要求 8+ 字符 + 大小写 + 数字 + 特殊字符 + 弱密码黑名单）
- 删除接口检查 `result.changes === 0` 返回 404
- 错误响应仅对带 `statusCode` 的业务错误透传 `err.message`，DB 异常统一友好文案

## 速率限制

- `generalLimiter`: 60/min/IP
- `authLimiter`: 10/min/IP（登录/注册/发码/重置）
- `aiLimiter`: 20/min，按 `req.userId || req.ip` 限流

## 优雅关闭

`src/index.ts` 监听 `SIGTERM`/`SIGINT`：
1. 标记 `shuttingDown`，拒绝重复触发
2. `server.close()` 停止接收新连接
3. 等待在途请求完成（10 秒兜底强制退出）
4. `closeDatabase()` 关闭 SQLite（含最后一次 WAL checkpoint）

## 全局错误兜底

`src/app.ts` 顶部注册：
```js
process.on('unhandledRejection', (reason) => logger.error({ reason }, 'Unhandled Rejection'));
process.on('uncaughtException', (err) => logger.error({ err }, 'Uncaught Exception'));
```

避免 async 路由未 catch 的 rejection 直接终止进程。

## 测试

```bash
npm test
```

10 个测试套件：`analyze` / `plan` / `nutrition` / `chat` / `auth` / `auth-comprehensive` / `data-comprehensive` / `progression` / `routes` / `validation`

> `auth-comprehensive.test.ts` 和 `routes.test.ts` 在 WSL Linux 环境下因 `better-sqlite3` 是 Windows 编译版本会报 `invalid ELF header`，需在 Windows 原生环境或重新 `npm rebuild better-sqlite3` 后运行。

---

*后端文档 — 个人版，随开发进度更新*
