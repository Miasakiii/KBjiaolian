# KB教练 — AI 健身康复师

> 📸 拍张照，AI 告诉你：现在什么样、该怎么练、练多久能到什么程度。

## 产品概述

KB 教练是一款 AI 驱动的健身康复应用，核心能力是**照片体态分析 + 个性化训练方案 + 可视化进度追踪**。

面向中文市场的久坐白领、健身新手和体态问题人群，填补"AI 健身教练"在中文市场的空白。

## 核心功能

| 功能 | 说明 | 状态 |
|------|------|------|
| 📸 体态分析 | 拍照 → AI 评估体脂、肌肉、体态问题 | ✅ 已完成 |
| 🏋️ 训练方案 | 基于分析结果生成个性化计划 | ✅ 已完成 |
| 📊 进度追踪 | 照片对比、体围记录、趋势图 | ✅ 已完成 |
| 🍎 饮食管理 | 拍照识别食物、热量追踪 | ✅ 已完成 |
| 💬 AI 对话 | 自然语言交互、动态调整 | ✅ 已完成 |
| 🏆 社交激励 | 打卡排行、进步分享 | 🚧 计划中 |

## 技术架构

```
前端 (Next.js 14) + 后端 (Express.js)
         │
    API Gateway
         │
  ┌──────┼──────┐
  │      │      │
分析引擎 训练系统 用户系统
  │      │      │
  └──────┼──────┘
         │
  MiMo API (AI 核心)
```

## 开发路线图

| 阶段 | 周期 | 交付物 | 状态 |
|------|------|--------|------|
| **P1 MVP** | 4-6 周 | 拍照分析 + 训练方案 | ✅ 已完成 |
| **P2 体验** | 4-6 周 | 训练打卡 + 进度对比 | ✅ 已完成 |
| **P3 智能** | 4-6 周 | AI 对话 + 饮食识别 | ✅ 已完成 |
| **P4 增长** | 持续 | 社交 + 付费 + 运营 | 🚧 进行中 |

## 已完成功能详情

### P1 MVP ✅

- **体态分析**
  - 拍照/上传图片
  - AI 识别体态问题（圆肩、头前伸、骨盆前倾、膝超伸）
  - 综合评分（0-100 分）
  - 雷达图展示各维度问题严重程度
  - 生成分析总结

- **训练方案**
  - 个性化参数设置（目标、经验、设备、频率）
  - AI 生成针对性训练计划
  - 详细动作指导（组数、次数、休息时间）
  - 营养建议

- **报告导出**
  - PDF 格式导出
  - 图片格式导出
  - 品牌化报告模板

### P2 体验 ✅

- **训练打卡**
  - 选择训练日开始训练
  - 逐组完成动作打卡
  - 训练计时器
  - 训练感受评分

- **进度对比**
  - 历史记录管理
  - 双记录对比
  - 评分变化趋势
  - 各维度对比分析

- **进度趋势**
  - 体态评分趋势图
  - 体态问题变化图
  - 训练次数统计图

### P3 智能 ✅

- **AI 对话**
  - 智能问答（健身、营养、体态）
  - 多轮对话支持
  - 快捷问题
  - 美观的 Markdown 渲染

- **饮食识别**
  - 拍照识别食物
  - 营养成分分析
  - 饮食记录历史
  - 每日营养统计

### 其他功能 ✅

- **首页仪表盘**
  - 数据概览卡片
  - 快捷操作入口
  - 今日任务提醒
  - 最近活动记录

- **个人设置**
  - 个人信息管理
  - 训练目标设置
  - 营养目标设置
  - BMI 和基础代谢计算

- **数据导出**
  - JSON 格式导出
  - CSV 格式导出
  - 数据统计概览

## 商业模式

- 免费版：每月 3 次分析 + 基础方案
- 高级版：¥29/月，无限分析 + AI 教练
- 专业版：¥59/月，含人工教练咨询

## 技术栈

### 前端
- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS 3
- **状态管理**: React useState/useEffect
- **图表**: 自定义 SVG 组件
- **PDF 导出**: html2canvas + jsPDF

### 后端
- **运行时**: Node.js
- **框架**: Express.js
- **模块系统**: ES Modules
- **AI 集成**: MiMo API

### 数据存储
- **前端**: localStorage (浏览器本地存储)
- **类型定义**: TypeScript 接口

## 项目文件索引

```
kb-coach/
├── README.md                      ← 你在这里
├── PROJECT-STRUCTURE.md           ← 前后端目录结构
│
├── docs/
│   ├── tech-spec.md               ← API 接口、AI Prompt、安全隐私
│   ├── design-system.md           ← 色彩/字体/组件/动效规范
│   ├── competitive-analysis.md    ← 竞品分析与市场机会
│   ├── user-personas.md           ← 目标用户画像
│   └── monetization.md            ← 商业模式与变现策略
│
├── backend/
│   └── src/
│       ├── index.js               ← Express 服务器入口
│       ├── analyze.js             ← 体态分析 API
│       ├── plan.js                ← 训练方案生成 API
│       ├── nutrition.js           ← 饮食识别 API
│       └── chat.js                ← AI 对话 API
│
├── web/
│   └── src/
│       ├── app/
│       │   ├── page.tsx           ← 首页仪表盘
│       │   ├── analyze/page.tsx   ← 体态分析页面
│       │   ├── plan/page.tsx      ← 训练方案页面
│       │   ├── workout/page.tsx   ← 训练打卡页面
│       │   ├── nutrition/page.tsx ← 饮食记录页面
│       │   ├── chat/page.tsx      ← AI 对话页面
│       │   ├── history/page.tsx   ← 分析历史页面
│       │   ├── workouts/page.tsx  ← 训练记录页面
│       │   ├── compare/page.tsx   ← 进度对比页面
│       │   ├── progress/page.tsx  ← 进度趋势页面
│       │   ├── settings/page.tsx  ← 个人设置页面
│       │   └── export/page.tsx    ← 数据导出页面
│       │
│       ├── components/            ← React 组件
│       ├── lib/                   ← 工具函数
│       └── types/                 ← TypeScript 类型
│
└── ralph/
    ├── prd.json                   ← Ralph PRD 文件
    └── progress.txt               ← 进度跟踪
```

## 快速开始

### 环境要求

- Node.js 18+
- npm 或 yarn

### 安装依赖

```bash
# 后端
cd backend && npm install

# 前端
cd web && npm install
```

### 配置环境变量

复制 `backend/.env.example` 为 `backend/.env`，填入你的 MiMo API 密钥：

```bash
MIMO_API_KEY=your-api-key-here
MIMO_API_URL=https://api.xiaomimimo.com/v1/chat/completions
MIMO_MODEL=mimo-v2.5
PORT=3001
```

### 启动服务

```bash
# 终端 1：启动后端
cd backend && npm start

# 终端 2：启动前端
cd web && npm run dev
```

访问 http://localhost:3000 开始使用。

## 页面路由

| 路径 | 页面 | 功能 |
|------|------|------|
| `/` | 首页仪表盘 | 数据概览、快捷操作 |
| `/analyze` | 体态分析 | 拍照分析体态 |
| `/plan` | 训练方案 | 生成训练计划 |
| `/workout` | 训练打卡 | 执行训练 |
| `/nutrition` | 饮食记录 | 记录饮食 |
| `/chat` | AI 教练 | 智能问答 |
| `/history` | 分析历史 | 查看历史记录 |
| `/workouts` | 训练记录 | 查看训练记录 |
| `/compare` | 进度对比 | 对比两次分析 |
| `/progress` | 进度趋势 | 查看变化趋势 |
| `/settings` | 个人设置 | 管理个人信息 |
| `/export` | 数据导出 | 导出数据 |

## API 接口

| 方法 | 路径 | 功能 |
|------|------|------|
| POST | `/api/analyze` | 体态分析 |
| POST | `/api/plan/generate` | 生成训练方案 |
| POST | `/api/nutrition/analyze` | 饮食识别 |
| POST | `/api/chat` | AI 对话 |
| GET | `/api/health` | 健康检查 |

## 贡献指南

欢迎贡献代码、报告问题或提出建议！

## 许可证

MIT License
