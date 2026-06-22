# KB教练 — 后端 API

Express.js + better-sqlite3 + JWT 认证的后端服务，提供体态分析、训练方案、营养识别、AI 对话、订单系统等 API。

## 快速开始

```bash
cd backend
npm install
npm run dev          # http://localhost:3001
```

环境变量（`.env`，参考 `.env.example`）：

```bash
PORT=3001
JWT_SECRET=your-jwt-secret-here        # 必填，启动时强校验
JWT_EXPIRES_IN=7d                      # 可选，默认 7d
MIMO_API_KEY=sk-your-api-key-here      # 必填（测试环境跳过）
MIMO_API_URL=https://api.xiaomimimo.com/v1/chat/completions
MIMO_MODEL=mimo-v2.5
CORS_ORIGIN=https://your-web-domain.com  # 生产必填，否则禁用跨域
NODE_ENV=production                    # 生产必填
```

> 注意：模块加载时若 `JWT_SECRET` 缺失会立即 fail-fast；若 `MIMO_API_URL`/`MIMO_API_KEY` 缺失（且非测试环境）同样 fail-fast。

## 脚本

| 命令 | 说明 |
|------|------|
| `npm run dev` | 开发模式（`node --watch` 热重载） |
| `npm start` | 生产启动 |
| `npm test` | Jest 测试套件 |
| `npm run test:watch` | 测试 watch 模式 |
| `npm run test:coverage` | 测试覆盖率 |

> 在 WSL 下运行 `npm test` 可能因 `node_modules/.bin/jest` 路径问题失败，可直接用：`node --experimental-vm-modules ./node_modules/jest/bin/jest.js --forceExit`

## 目录结构

```
backend/
├── src/
│   ├── index.js          # 入口：app.listen + SIGTERM/SIGINT 优雅关闭
│   ├── app.js            # Express app + 路由 + 限流 + 全局兜底
│   ├── auth.js           # 注册/登录/验证码/重置密码/JWT 中间件
│   ├── database.js       # better-sqlite3 初始化 + 表结构 + 迁移
│   ├── data.js           # 数据持久化 CRUD（分析/方案/训练/饮食/聊天）
│   ├── orders.js         # 订单创建/完成/关闭 + 支付参数生成
│   ├── wechatpay.js      # 微信支付 API v3（签名/验签/统一下单/回调解密）
│   ├── subscription.js   # 套餐配置 + 配额预占/释放 + 升级/降级
│   ├── validation.js     # 输入校验 + extractJsonObject（平衡括号 JSON 提取）
│   ├── progression.js    # 渐进式超负荷算法（历史训练数据分析）
│   ├── analyze.js        # 体态分析（8 维度）+ 前后对比
│   ├── plan.js           # 训练方案生成
│   ├── nutrition.js      # 食物识别
│   └── chat.js           # AI 对话（普通 + 流式 SSE）
├── __tests__/            # Jest 测试（9 套件）
├── data/                 # SQLite 数据库文件目录（运行时生成）
├── Dockerfile
├── railway.json
├── jest.config.js
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
| GET | `/api/plans` | 所有套餐信息 | 60/min |

### 需认证端点（Bearer JWT）
| 方法 | 路径 | 说明 | 限流 |
|------|------|------|------|
| GET | `/api/auth/profile` | 用户信息 | 60/min |
| GET | `/api/quota` | 今日配额用量 | 60/min |
| POST | `/api/analyze` | 体态分析 | 20/min + 配额 |
| POST | `/api/analyze/compare` | 前后对比 | 20/min |
| POST | `/api/plan/generate` | 训练方案 | 20/min + 配额 |
| POST | `/api/plan/progressive` | 渐进式方案 | 20/min + 配额 |
| GET | `/api/plan/progression` | 渐进式建议 | 60/min |
| POST | `/api/nutrition/analyze` | 食物识别 | 20/min + 配额 |
| POST | `/api/chat` | AI 对话 | 20/min + 配额 |
| POST | `/api/chat/stream` | AI 流式对话 (SSE) | 20/min + 配额 |
| POST | `/api/orders` | 创建订单 | 60/min |
| POST | `/api/orders/:id/pay` | 获取支付参数（需 platform: miniapp/app） | 60/min |
| GET | `/api/orders` `(/:id)` | 订单列表/详情 | 60/min |
| POST | `/api/payment/mock-pay/:id` | **仅非生产** 模拟支付 | 60/min |
| POST | `/api/payment/wechat/notify` | 微信支付回调（验签+解密） | - |
| CRUD | `/api/data/analysis` `(/:id)` | 体态分析记录 | 60/min |
| CRUD | `/api/data/plans` `(/:id)` | 训练方案（DELETE 无 :id 则清空全部） | 60/min |
| CRUD | `/api/data/workouts` `(/:id)` | 训练记录 | 60/min |
| CRUD | `/api/data/nutrition` `(/:id)` | 饮食记录 | 60/min |
| GET/DELETE | `/api/data/chat` | 聊天历史 | 60/min |

## 数据库表（10 张）

| 表 | 用途 | 关键字段 |
|----|------|----------|
| users | 用户 | id (UUID), email UNIQUE, password (bcrypt), nickname, plan, plan_expires_at |
| analysis_records | 体态分析 | user_id, score, issues(JSON), radar(JSON), suggestions(JSON) |
| training_plans | 训练方案 | user_id, goal, schedule(JSON), nutrition(JSON), duration_weeks |
| workout_records | 训练记录 | user_id, exercises(JSON), rating, duration, start_time, end_time |
| nutrition_records | 饮食记录 | user_id, foods(JSON), total_calories/protein/carbs/fat |
| chat_history | 聊天历史 | user_id, role(user/assistant), content |
| orders | 订单 | user_id, plan, amount(分), status(pending/paid/failed), trade_no |
| usage_logs | 使用量日志 | user_id, action, created_at（按日聚合） |
| verification_codes | 邮箱验证码 | email, code, type(register/reset), used, expires_at |
| password_resets | 密码重置 token | user_id, token, expires_at, used |

索引：每个业务表都有 `(user_id, created_at DESC)` 复合索引；`orders(trade_no)`、`usage_logs(user_id, action, created_at DESC)` 等。

## 认证机制

```
注册: 邮箱→send-code→输入验证码→register（验证码不立即标记，注册成功后才标记）
登录: email+password→bcrypt.compare（防用户枚举的时序攻击）→JWT
鉴权: Bearer JWT → authMiddleware → req.userId
重置: 邮箱→forgot-password→验证码→reset-password→bcrypt.hash→update
```

- JWT_SECRET 必填，启动时强校验
- JWT_EXPIRES_IN 默认 7d，可通过环境变量覆盖
- 登录对不存在用户也执行一次 bcrypt 比较（用固定 dummy hash），防止时序攻击枚举用户

## 配额系统

`subscription.js` 实现的预占式配额，避免 TOCTOU 并发绕过：

```js
// 路由调用：
const usageId = reserveQuota(userId, 'analyze');  // 同事务 check + insert
try {
  await analyzePhoto(image);                       // AI 调用
} catch (err) {
  releaseQuota(usageId);                           // 失败补偿
  throw err;
}
```

- "今日"按中国时区 (UTC+8) 计算，避免 Railway/Docker 默认 UTC 时区导致 0-8 点算到昨天
- 配额限制（每日）：

| 套餐 | 体态分析 | 训练方案 | 饮食识别 | AI 对话 |
|------|---------|---------|---------|---------|
| free | 2 | 1 | 2 | 5 |
| pro_monthly / pro_yearly | 25 | 10 | 25 | 100 |

## 订单与支付

- `createOrder`: 5 分钟内同套餐 pending 订单复用，避免重复创建
- `completeOrder`: `db.transaction` + `WHERE status='pending'` 原子更新，防并发重复支付
- `upgradePlan`: 续费在剩余时长基础上叠加（不覆盖未到期天数）
- `closeExpiredOrders`: 每 5 分钟定时清理超过 30 分钟未支付的订单（`setInterval().unref()`）
- 模拟支付端点 `POST /api/payment/mock-pay/:id` 仅在 `NODE_ENV !== 'production'` 注册
- 微信支付回调 `POST /api/payment/wechat/notify` 已实现签名校验 + AEAD_AES_256_GCM 解密 + 金额校验

### 微信支付 API v3（`wechatpay.js`）

支持小程序 JSAPI 支付和 App 支付：

| 函数 | 说明 |
|---|---|
| `createJsapiOrder` | 统一下单（JSAPI），返回 `wx.requestPayment` 参数 |
| `createAppOrder` | 统一下单（APP），返回微信 SDK 参数 |
| `verifyCallbackSignature` | 验证回调签名（RSA-SHA256） |
| `decryptNotification` | 解密回调通知（AEAD_AES_256_GCM） |
| `queryOrder` | 查询订单状态 |
| `closeOrder` | 关闭订单 |

**支付流程：**
```
1. 前端 POST /api/orders → 创建订单
2. 前端 POST /api/orders/:id/pay {platform, openid} → 获取支付参数
3. 小程序 wx.requestPayment / App 微信 SDK
4. 微信通知 POST /api/payment/wechat/notify → 验签+解密+升级套餐
```

**环境变量：**
```bash
WECHATPAY_MCH_ID=商户号
WECHATPAY_SERIAL_NO=证书序列号
WECHATPAY_API_V3_KEY=APIv3密钥
WECHATPAY_PRIVATE_KEY_PATH=./certs/apiclient_key.pem
WECHATPAY_NOTIFY_URL=https://your-domain/api/payment/wechat/notify
MOCK_WECHAT_PAY=true  # 开发模式跳过真实API
```

## AI 模块

四个 AI 模块（`analyze.js`/`plan.js`/`nutrition.js`/`chat.js`）共用模式：

- 启动校验 `MIMO_API_URL`/`MIMO_API_KEY`（测试环境跳过）
- 60 秒超时（`AbortController`）
- `sendMessageStream` 接受外部 `signal`，客户端断开时取消上游请求，避免连接泄漏
- AI 返回的 JSON 用 `validation.js#extractJsonObject` 提取（先尝试 ` ```json ``` ` 围栏，再平衡括号扫描），取代贪婪正则 `\{[\s\S]*\}`
- 体态/营养分析的缓存键用 `crypto.createHash('sha256').update(全图).digest('hex')`，避免前缀/碰撞

### SSE 流式对话要点
- 路由内 `req.on('close', onAbort)` 监听客户端断开
- `headersSent` 标志：响应头已发送时无法改 status，仅能写错误事件后 `res.end()`
- `reader.releaseLock()` 在 finally 中调用
- `finally` 兜底 `abortController.abort()` 取消上游

## 输入校验与安全

- `validation.js` 提供：`isValidBase64Image`、`isValidGoal/Experience/Equipment`、`isValidChatMessage/History`、`sanitizeString`
- `data.js` 所有 `saveXxx` 加白名单字段与上限（图片预览 2MB、字符串 5K、ID 64 字符、分页 100 上限）
- 邮箱正则采用 RFC 5322 简化版
- 密码强度：6-100 字符且必须包含字母 + 数字
- 删除接口检查 `result.changes === 0` 返回 404
- 错误响应仅对带 `statusCode` 的业务错误透传 `err.message`，DB 异常统一友好文案

## 速率限制

- `generalLimiter`: 60/min/IP
- `authLimiter`: 10/min/IP（登录/注册/发码/重置）
- `aiLimiter`: 20/min，按 `req.userId || req.ip` 限流

## 优雅关闭

`src/index.js` 监听 `SIGTERM`/`SIGINT`：
1. 标记 `shuttingDown`，拒绝重复触发
2. `server.close()` 停止接收新连接
3. 等待在途请求完成（10 秒兜底强制退出）
4. `db.close()` 关闭 SQLite

## 全局错误兜底

`src/app.js` 顶部注册：
```js
process.on('unhandledRejection', (reason) => console.error(reason));
process.on('uncaughtException', (err) => console.error(err.message));
```

避免 async 路由未 catch 的 rejection 直接终止进程。

## 测试

```bash
npm test
```

9 个测试套件：`analyze` / `plan` / `nutrition` / `chat` / `auth` / `auth-comprehensive` / `data-comprehensive` / `validation` / `routes`

**已知问题**：`auth-comprehensive.test.js` 和 `routes.test.js` 在 WSL Linux 环境下因 `better-sqlite3` 是 Windows 编译版本会报 `invalid ELF header`，与代码无关，需在 Windows 原生环境或重新 `npm rebuild better-sqlite3` 后运行。

## 部署

### Railway
```bash
railway up
```
需配置环境变量：`JWT_SECRET` / `MIMO_API_KEY` / `MIMO_API_URL` / `CORS_ORIGIN` / `NODE_ENV=production`

### Docker
```bash
docker build -t kb-coach-backend .
docker run -p 3001:3001 \
  -e JWT_SECRET=... \
  -e MIMO_API_KEY=... \
  -e MIMO_API_URL=... \
  -e CORS_ORIGIN=https://your-web.com \
  -e NODE_ENV=production \
  kb-coach-backend
```

> Dockerfile 基于 alpine，构建 `better-sqlite3` 需要 `build-base` + `python3`，已配置。

## 本轮代码审查修复（2026-06）

### Critical
- 模拟支付端点生产环境暴露 → 仅非生产注册 + `mockPayUrl` 仅开发返回
- SSE 错误响应头已发送导致进程崩溃 → `headersSent` 标志 + 写错误事件后 end
- 验证码明文写入生产日志 → `NODE_ENV !== 'production'` 才打印
- SSE 客户端断开后上游连接不释放 → `AbortController` + `req.on('close')`
- AI 模块启动不校验 URL/KEY → fail-fast（测试环境跳过）；`JWT_EXPIRES_IN` 改读环境变量

### High
- `completeOrder` 并发竞态 → `db.transaction` + `WHERE status='pending'`
- 配额 TOCTOU 并发绕过 → `reserveQuota/releaseQuota` 同事务预占 + AI 调用失败补偿
- 验证码注册失败白白作废 → `verifyCode` 不立即 markCodeUsed，由调用方成功后调用
- 缓存键前 1000 字符 + 32 位哈希易碰撞 → sha256 全图哈希
- async 路由错误中间件 + 进程兜底 → `unhandledRejection` / `uncaughtException`
- 登录用户枚举时序攻击 → 不存在用户也执行 bcrypt 比较
- 数据写入零校验 → 白名单字段 + 长度/大小上限
- AI JSON 贪婪正则解析 → 平衡括号扫描 + 围栏优先

### Medium
- `progression.js` reps="8-12" 误解析为 812 → `parseRangeNum` 支持 "8-12"/"3组"/"10kg"
- `progression.js` `sessions === 0` 永不进入 → 改为 `=== 1`
- 死代码 `cache.js` 删除
- 无 `SIGTERM/SIGINT` → 优雅关闭
- CORS 默认 localhost → 生产未配置禁用跨域
- 错误信息泄露 SQL → 仅业务错误透传

### Low
- ID 生成 `Math.random` → `crypto.randomUUID()` / `crypto.randomBytes`
- `String.prototype.substr` 弃用 → `substring`
- 删除接口无 changes 检查 → 返回 404
- 邮箱正则过宽 → RFC 5322 简化版
- 密码仅长度校验 → 必须字母 + 数字

## 已知限制 / 后续改进

| 项 | 说明 |
|----|------|
| 模拟支付 | 生产环境必须接入真实微信支付 API（已预留回调端点） |
| 邮件服务 | 验证码仍打印日志，生产需接入 Resend / QQ 邮箱 SMTP |
| 无进程级 cluster | 单进程，多核 CPU 未充分利用 |
| `safeAddColumn` 用 try/catch 文本匹配 | 应改为 `PRAGMA table_info` 检测 |
| 无结构化日志 | 仍用 `console.log`，建议接入 pino/winston |
| Dockerfile 用 `npm install --production` | 建议改 `npm ci` 并锁定版本 |
| 无 CSRF 防护 | 当前用 Bearer token 不受 CSRF 影响，但若改 cookie 需补 |
| 测试在 WSL 失败 | `better-sqlite3` 跨平台编译问题 |

---
*后端文档 — 随开发进度更新*
