# KB教练 — 微信小程序详细开发计划

> 版本: v1.0 | 制定日期: 2026-06-20
> 基于现有 Express.js 后端（10 张表 / 18 个 API / 商业化基建完整）

---

## 目录

1. [项目概况与目标](#1-项目概况与目标)
2. [技术架构决策](#2-技术架构决策)
3. [小程序页面规划](#3-小程序页面规划)
4. [后端改造清单](#4-后端改造清单)
5. [分阶段开发计划](#5-分阶段开发计划)
6. [目录结构](#6-目录结构)
7. [关键技术实现要点](#7-关键技术实现要点)
8. [上线前检查清单](#8-上线前检查清单)
9. [里程碑与时间预估](#9-里程碑与时间预估)

---

## 1. 项目概况与目标

### 1.1 为什么做小程序

| 优势 | 说明 |
|------|------|
| 零下载门槛 | 微信内直接打开，触达率远高于独立 App |
| 支付天然闭环 | `wx.requestPayment()` 直接唤起，体验远胜扫码 |
| 图片上传更顺畅 | `wx.chooseMedia` 原生相机/相册，体态分析核心体验提升 |
| 社交裂变 | 分享给好友/朋友圈，天然传播路径 |
| 后端可直接复用 | 现有 18 个 REST API 无需重写，仅需新增微信登录通道 |

### 1.2 目标

- **Phase 1**（MVP）：3-4 周内上线，覆盖核心功能，跑通微信审核
- **Phase 2**（商业化）：接入真实微信支付，跑通付费转化链路
- **Phase 3**（增长）：订阅消息推送、分享裂变、历史记录完整迁移

---

## 2. 技术架构决策

### 2.1 原生 vs 框架

**推荐：原生微信小程序**（WXML/WXSS/JS）

理由：
- 项目体量适中，原生可控性更强
- 审核稳定性高，无框架编译黑盒
- 无需额外构建链，上手快
- 后续可考虑 Taro 重构实现跨端

### 2.2 整体架构

```
┌─────────────────────────────────────────┐
│         微信小程序（新建）                │
│  ┌──────────┐  ┌──────────┐             │
│  │ 主包      │  │ 分包      │             │
│  │ 首页/分析 │  │ 历史/设置 │             │
│  │ 训练/营养 │  │ 个人中心  │             │
│  └────┬─────┘  └────┬─────┘             │
└───────┼─────────────┼───────────────────┘
        │             │
        ▼             ▼
┌─────────────────────────────────────────┐
│  HTTPS API（复用现有 Express.js 后端）   │
│  + 新增 /api/auth/wechat-login 端点     │
└─────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────┐
│  SQLite 数据库（10 张表，保持不变）       │
│  + users 表新增 openid / wechat_info 列 │
└─────────────────────────────────────────┘
```

### 2.3 包体积规划

| 包 | 内容 | 预估大小 |
|----|------|---------|
| 主包 | app + 首页/分析/训练/AI对话 | ~600KB |
| 分包1: user | 登录/个人中心/定价/支付 | ~200KB |
| 分包2: history | 历史记录/进度/恢复追踪 | ~300KB |
| 分包3: nutrition | 饮食识别/饮食历史 | ~200KB |
| **合计** | | **~1.3MB** |

> 主包目标 < 1MB，分包按需加载

---

## 3. 小程序页面规划

### 3.1 主包页面（优先级最高）

| 页面 | 路径 | 对应 Web 页面 | 后端 API |
|------|------|--------------|---------|
| 首页/仪表盘 | `pages/index/index` | `/` | `/api/quota`, `/api/auth/profile` |
| 体态分析 | `pages/analyze/index` | `/analyze` | `/api/analyze` |
| 训练方案 | `pages/plan/index` | `/plan` | `/api/plan/generate` |
| AI 对话 | `pages/chat/index` | `/chat` | `/api/chat`（非流式） |
| 动作库 | `pages/exercises/index` | `/exercises` | 静态数据 |

### 3.2 分包页面

**user 分包**

| 页面 | 路径 | 说明 |
|------|------|------|
| 登录/注册 | `subpkg/user/login/index` | 微信一键登录 + 邮箱登录 |
| 个人中心 | `subpkg/user/profile/index` | 订阅状态 + 用量统计 |
| 定价页 | `subpkg/user/pricing/index` | Free/Pro 套餐对比 |
| 支付页 | `subpkg/user/payment/index` | `wx.requestPayment()` |

**history 分包**

| 页面 | 路径 | 说明 |
|------|------|------|
| 分析历史 | `subpkg/history/analysis/index` | 体态记录列表 |
| 前后对比 | `subpkg/history/compare/index` | 选 2 条记录 → AI 对比 |
| 训练历史 | `subpkg/history/workouts/index` | 训练记录列表 |
| 进度追踪 | `subpkg/history/progress/index` | 数据图表 |
| 恢复追踪 | `subpkg/history/recovery/index` | 肌肉恢复热力图 |

**nutrition 分包**

| 页面 | 路径 | 说明 |
|------|------|------|
| 饮食识别 | `subpkg/nutrition/analyze/index` | 拍照识别食物 |
| 饮食历史 | `subpkg/nutrition/history/index` | 饮食记录列表 |

### 3.3 TabBar 设计（底部导航）

```
[首页] [分析] [训练] [对话] [我的]
  🏠     📸     🏋️    💬     👤
```

---

## 4. 后端改造清单

### 4.1 必须新增（上线前）

#### 微信登录端点

```javascript
// POST /api/auth/wechat-login
// 接收小程序端 wx.login() 返回的 code
// 用 code 换取 openid，绑定/创建用户，返回 JWT

// backend/src/auth.js 新增：
app.post('/api/auth/wechat-login', async (req, res) => {
  const { code } = req.body;
  
  // 1. 用 code 换取 openid（需要 appid + appsecret）
  const wxRes = await fetch(
    `https://api.weixin.qq.com/sns/jscode2session?appid=${WX_APPID}&secret=${WX_SECRET}&js_code=${code}&grant_type=authorization_code`
  );
  const { openid, session_key } = await wxRes.json();
  
  // 2. 查找或创建用户
  let user = db.prepare('SELECT * FROM users WHERE openid = ?').get(openid);
  if (!user) {
    const result = db.prepare(
      'INSERT INTO users (openid, nickname, plan, created_at) VALUES (?, ?, ?, ?)'
    ).run(openid, `微信用户_${openid.slice(-6)}`, 'free', Date.now());
    user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
  }
  
  // 3. 签发 JWT（与现有逻辑一致）
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' });
  res.json({ success: true, data: { access_token: token, user } });
});
```

#### 数据库 users 表迁移

```sql
-- 新增两列（兼容现有邮箱用户）
ALTER TABLE users ADD COLUMN openid TEXT;
ALTER TABLE users ADD COLUMN wechat_nickname TEXT;
ALTER TABLE users ADD COLUMN wechat_avatar TEXT;
CREATE UNIQUE INDEX idx_users_openid ON users(openid) WHERE openid IS NOT NULL;
```

#### 图片上传端点

```javascript
// 现有 /api/analyze 接收 base64，小程序需要改用 wx.uploadFile
// 新增支持 multipart/form-data 的接收方式
// 推荐：新增 /api/upload/image 端点，返回临时 URL
// 或：修改 /api/analyze 支持 multipart + base64 双模式
```

### 4.2 需要修复（上线安全要求）

| 问题 | 影响 | 修复方案 |
|------|------|---------|
| 微信支付回调未验证签名 | 🔴 CRITICAL — 被仿造回调可以免费升级 Pro | 接入微信支付 SDK，用 RSA 公钥验证签名 |
| JWT Secret 弱可预测值 | 🔴 HIGH — Token 可被伪造 | 改为 32 字节随机值，写入 .env |
| 验证码无尝试次数限制 | 🟡 MEDIUM — 可暴力破解 | 加入 Redis 或内存计数，5 次错误锁定 |

### 4.3 配置新增

```bash
# backend/.env 新增
WX_APPID=wx开头的18位字符串
WX_SECRET=32位十六进制字符串
WX_PAY_MCHID=微信商户号
WX_PAY_CERT_KEY=支付证书私钥
```

---

## 5. 分阶段开发计划

### Phase 1 — MVP（目标：3 周上线审核）

#### Week 1：基础骨架 + 认证

**Day 1-2：项目初始化**
- [ ] 在微信开发者工具创建项目，填入 AppID
- [ ] 配置 `app.json`（pages + tabBar + window）
- [ ] 写 `app.js`（globalData 结构 + 启动登录检查）
- [ ] 写 `utils/request.js`（统一请求封装，Bearer JWT）
- [ ] 写 `utils/auth.js`（wx.login 流程 + token 管理）
- [ ] 注册合法域名：request、uploadFile、download 白名单

**Day 3-4：登录页 + 认证流程**
- [ ] `subpkg/user/login` 页面（微信一键登录 + 邮箱登录双入口）
- [ ] 后端：新增 `/api/auth/wechat-login` 端点
- [ ] 后端：users 表 ALTER 加 openid 列
- [ ] 测试：登录拿到 JWT，存 wx.setStorageSync('token')

**Day 5-7：首页仪表盘**
- [ ] `pages/index/index` — 已登录态：配额卡片 + 快捷操作 + 今日摘要
- [ ] `pages/index/index` — 未登录态：宣传 Banner + 功能介绍 + 登录 CTA
- [ ] 调用 `/api/quota` + `/api/auth/profile`

#### Week 2：核心功能页

**体态分析页（重点页面）**
- [ ] `pages/analyze/index` — 拍照/相册选图（`wx.chooseMedia`）
- [ ] 图片压缩（`wx.compressImage`，压缩到 800px，< 300KB）
- [ ] `wx.uploadFile` 上传到后端，显示加载动画
- [ ] 结果页：8 维度评分卡 + 雷达图（使用 `echarts-for-weixin`）
- [ ] 保存记录到 `/api/data/analysis`

**训练方案页**
- [ ] `pages/plan/index` — 目标选择（减脂/增肌/康复）+ 参数表单
- [ ] 调用 `/api/plan/generate`，展示 7 天计划
- [ ] 每日动作列表，可展开查看动作说明

**AI 对话页**
- [ ] `pages/chat/index` — 消息气泡列表 + 输入框
- [ ] 调用 `/api/chat`（非流式，小程序不支持 SSE）
- [ ] 打字机效果：用 `setInterval` 逐字渲染模拟流式

**动作库页**
- [ ] `pages/exercises/index` — 28 个动作卡片，按肌群筛选
- [ ] 本地 JSON 数据，无网络请求，离线可用

#### Week 3：分包功能 + 完善

**个人中心分包**
- [ ] `subpkg/user/profile` — 头像/昵称 + 订阅状态徽章 + 今日用量进度条
- [ ] `subpkg/user/pricing` — Free/Pro 对比卡片（复用现有定价策略）
- [ ] `subpkg/user/payment` — 调用 `wx.requestPayment()`（先接模拟支付测试）

**历史记录分包**
- [ ] `subpkg/history/analysis` — 体态分析历史列表，点击查看详情
- [ ] `subpkg/history/compare` — 选择两条记录 → AI 对比报告
- [ ] `subpkg/history/workouts` — 训练历史

**提交审核准备**
- [ ] 补充隐私政策页面（审核必须）
- [ ] 补充用户协议页面
- [ ] 所有图片 lazy-load 处理
- [ ] 检查包大小，主包 < 1.5MB
- [ ] 真机测试（iOS + Android）

---

### Phase 2 — 商业化（目标：上线后 1-2 周）

- [ ] 接入真实微信支付（商户号注册 → 生成签名 → 后端回调验签）
- [ ] 接入订阅消息（训练提醒 / 方案到期提醒）
- [ ] 完善配额 UI（接近限额时弹出升级引导）
- [ ] 用量超限友好拦截（非直接报错，而是引导到定价页）

---

### Phase 3 — 增长（上线稳定后）

- [ ] 分享卡片（`onShareAppMessage` 自定义体态分析结果分享图）
- [ ] 营养识别分包（`subpkg/nutrition`）
- [ ] 恢复追踪分包（热力图组件）
- [ ] 微信运动数据读取（步数整合到训练记录）

---

## 6. 目录结构

```
miniprogram/                    # 小程序根目录（建议放在 KBjiaolian/miniprogram/）
│
├── app.js                      # App 生命周期 + globalData
├── app.json                    # 路由、tabBar、分包配置
├── app.wxss                    # 全局样式（绿色系 #22c55e）
├── project.config.json         # AppID + 编译设置
├── sitemap.json                # 搜索索引
│
├── pages/                      # 主包页面
│   ├── index/                  # 首页/仪表盘
│   │   ├── index.js
│   │   ├── index.json
│   │   ├── index.wxml
│   │   └── index.wxss
│   ├── analyze/                # 体态分析
│   ├── plan/                   # 训练方案
│   ├── chat/                   # AI 对话
│   └── exercises/              # 动作库（静态数据）
│
├── subpkg/                     # 分包
│   ├── user/                   # 用户分包
│   │   ├── login/
│   │   ├── profile/
│   │   ├── pricing/
│   │   └── payment/
│   ├── history/                # 历史记录分包
│   │   ├── analysis/
│   │   ├── compare/
│   │   ├── workouts/
│   │   ├── progress/
│   │   └── recovery/
│   └── nutrition/              # 营养分包
│       ├── analyze/
│       └── history/
│
├── components/                 # 自定义组件
│   ├── quota-bar/              # 配额进度条
│   ├── score-card/             # 维度评分卡
│   ├── empty-state/            # 空状态组件
│   ├── loading-spinner/        # 加载动画
│   └── plan-day/               # 训练方案单日视图
│
├── utils/
│   ├── request.js              # 统一请求封装（Bearer JWT + 401 刷新）
│   ├── auth.js                 # wx.login + token 管理
│   ├── upload.js               # 图片压缩 + uploadFile 封装
│   └── format.js               # 日期/数字格式化工具
│
├── services/
│   ├── analyze.js              # 体态分析 API 调用
│   ├── plan.js                 # 训练方案 API
│   ├── chat.js                 # AI 对话 API
│   ├── payment.js              # 支付 + 订阅消息
│   └── data.js                 # 数据持久化 CRUD
│
└── assets/
    ├── icons/                  # 自定义图标（SVG 转 PNG）
    └── exercises/              # 动作示意图（按需加载）
```

---

## 7. 关键技术实现要点

### 7.1 图片上传（体态分析核心）

```javascript
// utils/upload.js
const uploadImage = (filePath) => {
  return new Promise((resolve, reject) => {
    // 先压缩，目标 < 500KB
    wx.compressImage({
      src: filePath,
      quality: 70,
      success: (compressRes) => {
        wx.uploadFile({
          url: `${BASE_URL}/api/upload/image`,
          filePath: compressRes.tempFilePath,
          name: 'image',
          header: { Authorization: `Bearer ${wx.getStorageSync('token')}` },
          success: (res) => {
            const data = JSON.parse(res.data);
            resolve(data.imageUrl); // 返回服务器存储的临时URL
          },
          fail: reject,
        });
      },
      fail: reject,
    });
  });
};
```

### 7.2 微信登录（关键认证流程）

```javascript
// utils/auth.js
const wxLogin = async () => {
  // 检查已有 token 是否有效
  const token = wx.getStorageSync('token');
  if (token) {
    try {
      // 验证 token 有效性
      await request({ url: '/api/auth/profile' });
      return; // token 有效，直接返回
    } catch (e) {
      wx.removeStorageSync('token'); // token 失效，清除
    }
  }
  
  // 发起微信登录
  const { code } = await new Promise((resolve, reject) =>
    wx.login({ success: resolve, fail: reject })
  );
  
  const res = await request({
    url: '/api/auth/wechat-login',
    method: 'POST',
    data: { code },
    skipAuth: true, // 跳过 token 注入
  });
  
  wx.setStorageSync('token', res.data.access_token);
  wx.setStorageSync('user', res.data.user);
  
  const app = getApp();
  app.globalData.user = res.data.user;
  app.globalData.isLoggedIn = true;
};
```

### 7.3 微信支付（Phase 2 核心）

```javascript
// services/payment.js
const pay = async (planType) => {
  // Step 1: 后端创建订单，返回 prepay 参数
  const order = await request({
    url: '/api/orders',
    method: 'POST',
    data: { plan: planType },
  });
  
  // Step 2: 唤起微信支付
  return new Promise((resolve, reject) => {
    wx.requestPayment({
      timeStamp: order.timeStamp,
      nonceStr: order.nonceStr,
      package: order.package,
      signType: 'RSA',
      paySign: order.paySign,
      success: () => resolve({ success: true }),
      fail: (err) => {
        if (err.errMsg.includes('cancel')) {
          resolve({ success: false, reason: 'cancelled' });
        } else {
          reject(err);
        }
      },
    });
  });
};
```

### 7.4 AI 对话（非流式适配）

```javascript
// 小程序不支持 SSE，改用非流式接口 + 打字机效果
const sendMessage = async (content) => {
  const res = await request({
    url: '/api/chat',  // 非流式端点
    method: 'POST',
    data: { message: content },
  });
  
  // 打字机效果模拟流式
  const fullText = res.data.reply;
  let displayed = '';
  let i = 0;
  
  const timer = setInterval(() => {
    if (i >= fullText.length) {
      clearInterval(timer);
      return;
    }
    displayed += fullText[i++];
    this.setData({ 'messages[messages.length-1].content': displayed });
  }, 30); // 每 30ms 一个字
};
```

### 7.5 订阅消息（Phase 2）

```javascript
// 在用户完成分析后，顺势请求订阅授权
const requestSubscription = async () => {
  const TEMPLATE_IDS = [
    'xxx_训练提醒模板ID',
    'xxx_配额更新模板ID',
  ];
  
  return new Promise((resolve) => {
    wx.requestSubscribeMessage({
      tmplIds: TEMPLATE_IDS,
      success: (res) => {
        const accepted = TEMPLATE_IDS.filter(id => res[id] === 'accept');
        // 告知后端用户已授权，后续可主动推送
        if (accepted.length > 0) {
          request({
            url: '/api/subscription/accept',
            method: 'POST',
            data: { templates: accepted },
          });
        }
        resolve(accepted);
      },
      fail: () => resolve([]),
    });
  });
};
```

---

## 8. 上线前检查清单

### 微信平台配置

- [ ] 注册小程序账号，获取 AppID
- [ ] 小程序后台 → 开发管理 → 服务器域名，添加：
  - `request 合法域名`：`https://your-api-domain.com`
  - `uploadFile 合法域名`：`https://your-api-domain.com`
  - `downloadFile 合法域名`：`https://your-cdn.com`（如有）
- [ ] 配置业务域名（如需 webview 展示 H5 内容）
- [ ] 开通微信支付（商户号 → 绑定小程序）

### 安全修复（上线前必须）

- [ ] 修复微信支付回调签名验证（CRITICAL）
- [ ] 将 JWT Secret 改为 64 字符随机字符串
- [ ] 验证码添加尝试次数限制（5 次锁定）
- [ ] 生产环境关闭模拟支付端点 `/api/payment/mock-pay`

### 审核合规

- [ ] 补充《隐私政策》页面（必须在设置 → 关于中可以访问）
- [ ] 补充《用户协议》页面
- [ ] 所有申请的权限必须有对应使用场景说明（隐私弹框）
- [ ] `app.json` 中 `requiredPrivateInfos` 配置
- [ ] 所有图片资源使用正版/自绘，不使用版权图片
- [ ] 不得出现"最好用/第一/唯一"等违规宣传词

### 性能指标

- [ ] 主包大小 < 1.5MB（用微信开发者工具检查）
- [ ] 首页启动时间 < 1.5 秒（中低端机实测）
- [ ] setData 数据量单次 < 256KB
- [ ] 图片统一使用 WebP + lazy-load

### 真机测试

- [ ] iOS WeChat 测试（重点：相机权限、支付）
- [ ] Android 中低端机测试（重点：启动速度、内存）
- [ ] 弱网（2G/3G）场景测试（重点：上传体态图片）
- [ ] 扫码进入测试（体态分析结果分享链接）

---

## 9. 里程碑与时间预估

```
Week 1          Week 2          Week 3          Week 4
├───────────────┼───────────────┼───────────────┼────────────▶
│               │               │               │
│ 基础骨架       │ 核心功能页     │ 分包 + 完善    │ 审核 + 修复
│ 认证流程       │ 分析/训练/对话 │ 历史/个人中心  │ 上线
│ 后端改造       │ 动作库        │ 支付(模拟)     │
│               │               │ 真机测试       │
```

| 里程碑 | 时间节点 | 交付物 |
|--------|---------|--------|
| 脚手架完成 | Day 3 | app.js/json + utils/request.js + auth.js |
| 登录流程跑通 | Day 5 | wx.login → 后端 → JWT 完整链路 |
| 体态分析可用 | Day 10 | 拍照 → 上传 → 结果展示 |
| 全主包功能完成 | Day 14 | 5 个主包页面全部可用 |
| 分包功能完成 | Day 18 | 历史/个人中心/支付页完成 |
| 真机测试通过 | Day 20 | iOS + Android 验证 |
| 提交审核 | Day 21 | 首次提交 |
| 审核通过上线 | Day 24-28 | 正式发布（预留审核修改时间） |

---

## 附录：需要申请的微信小程序类目

| 类目 | 说明 |
|------|------|
| 健康 > 运动健身 | 主类目 |
| AI 技术 | 使用 AI 分析功能时需要 |

**审核材料准备**：
- 应用截图 5-10 张（清晰展示核心功能）
- 测试账号（供审核员登录）
- 功能说明文档（500 字以内）

---

*本文档随开发进度持续更新*
