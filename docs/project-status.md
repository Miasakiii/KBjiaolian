# KB教练 — 项目状态总结（个人版）

> 更新时间: 2026-07-07 | 纯本地 + 直连大模型架构，无后端无登录，动作库离线整合

## 项目概述

KB教练个人版是纯本地运行的健身康复应用。移动端直连小米 MiMo 大模型 API，数据存本机 SharedPreferences，动作库 1,324 条打包进 APK 离线可用。无后端、无登录、无商业化、无云端部署。

## 技术架构

```
┌─────────────────────────────────────────────────────┐
│              Flutter 移动端 / Windows 桌面端           │
│  ┌──────────────────────────────────────────────┐  │
│  │  Provider 6 + go_router 12 + KbColors token  │  │
│  │  无登录 · 无后端 · 直连大模型                  │  │
│  └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
            │                          │
            ▼                          ▼
┌───────────────────────┐   ┌─────────────────────┐
│   小米 MiMo API        │   │  本地存储            │
│   （直连，--dart-define │   │  SharedPreferences  │
│    注入 key）           │   │  + assets JSON     │
│   - 体态分析（多模态）  │   │  - 个人资料         │
│   - 训练方案            │   │  - 体态/训练/饮食历史│
│   - 营养识别            │   │  - 动作库（1324条）  │
│   - AI 对话（SSE 流式） │   │                    │
└───────────────────────┘   └─────────────────────┘
```

## 已完成功能

### 核心功能
- ✅ 体态分析 8 维度（多模态：拍照 + AI）
- ✅ 前后对比分析
- ✅ 渐进式超负荷训练方案生成
- ✅ 食物拍照识别 + 营养成分估算（多模态）
- ✅ AI 教练对话（SSE 流式 + markdown 渲染，mimo-V2.5 推理模型适配）
- ✅ 8 维度雷达图 + 进度趋势折线图
- ✅ 恢复追踪（肌肉恢复 + 4 周热力图）+ 训练完成总结
- ✅ 数据导出（JSON + share_plus）

### 动作库（离线整合）
- ✅ 1,324 个训练动作打包进 `assets/exercises.json`（9.7MB，离线）
- ✅ `LocalExercisesService` 内存查询（列表/详情/搜索/元数据）
- ✅ 动作库浏览页（筛选 + 搜索 + 分页）+ 详情页（中文步骤 + 肌群标签）
- ✅ 首字母 + 肌群色块占位图标
- 数据来源：[hasaneyldrm/exercises-dataset](https://github.com/hasaneyldrm/exercises-dataset)

### 个人资料与 AI 个性化
- ✅ 个人资料本地存储（昵称/性别/年龄/身高/体重）
- ✅ `_getProfileContext()` 注入所有 AI prompt（对话/训练方案/体态分析）
- ✅ 首页未填提醒卡片，引导跳转 `/profile`
- ✅ 保存后同步 `AuthProvider`，首页昵称实时刷新
- ✅ `context.pop()` 修复 go_router 黑屏问题

### 纯本地架构
- ✅ `ApiService` 直连 MiMo（key 通过 `--dart-define` 注入）
- ✅ `AuthProvider` 永真，无登录守卫
- ✅ `CloudStorageService` / `WechatPayService` 改 no-op stub
- ✅ 移除 Firebase / Crashlytics / 微信 SDK / flutter_secure_storage
- ✅ flutter_launcher_icons 生成各分辨率图标

### 设计系统
- ✅ 深 teal `#0f766e` + KbColors token 系统（零硬编码）
- ✅ 字重 400/600，警示橙 `#f97316` 仅用于问题点
- ✅ 17 屏全部 token 化

## 页面清单（17 页）

| 页面 | 路径 | 说明 |
|------|------|------|
| 首页 | `/` | 统计 + 快捷操作 + 个人资料未填提醒 |
| 体态分析 | `/analyze` | 拍照 → AI 8 维度评估 |
| 前后对比 | `/compare` | 两次记录 → AI 变化报告 |
| 进度趋势 | `/progress` | 折线图 + 统计 |
| 训练方案 | `/plan` | 参数表单 + 渐进式 |
| 训练中 | `/workout` | 计时器 + 组数（动作可跳详情） |
| 训练完成 | `/workout/complete` | 总结 + 评分 |
| 饮食识别 | `/nutrition` | 拍照识别 |
| AI 对话 | `/chat` | SSE 流式 + markdown |
| 历史记录 | `/history` | 体态分析历史 |
| 恢复追踪 | `/recovery` | 肌肉恢复 + 热力图 |
| 动作库 | `/exercises` | 筛选 + 搜索 + 分页 |
| 动作详情 | `/exercises/:id` | 中文步骤 + 肌群标签 |
| 设置 | `/settings` | 设置 + 数据导出 |
| 个人资料 | `/profile` | 本地保存 |
| 训练目标 | `/goal` | 目标设置 |
| 关于/隐私 | `/about` `/privacy` | 静态信息 |

## 技术栈

| 层 | 技术 |
|---|---|
| 移动端 | Flutter 3.44.2 + Provider 6 + go_router 12 + KbColors |
| 桌面端 | Flutter Windows |
| AI | 小米 MiMo（OpenAI 兼容） |
| 本地存储 | SharedPreferences |
| 动作库 | assets JSON（1,324 条，离线） |
| AI 渲染 | flutter_markdown |
| 图标 | flutter_launcher_icons |

## 启动指南

### 运行（开发模式）

```bash
cd mobile
flutter pub get
flutter run \
  --dart-define=MIMO_API_KEY=sk-你的key \
  --dart-define=MIMO_API_URL=https://api.xiaomimimo.com/v1/chat/completions \
  --dart-define=MIMO_MODEL=mimo-v2.5
```

### 构建 Release APK

```bash
cd mobile
flutter build apk --release \
  --dart-define=MIMO_API_KEY=sk-你的key \
  --dart-define=MIMO_API_URL=https://api.xiaomimimo.com/v1/chat/completions \
  --dart-define=MIMO_MODEL=mimo-v2.5
# 产物：mobile/build/app/outputs/flutter-apk/app-release.apk
```

> ⚠️ 不传 `MIMO_API_KEY` 时 App 可启动，但 AI 功能不可用；动作库浏览等离线功能正常。

## 待办 / 下一步

| 优先级 | 任务 | 说明 |
|--------|------|------|
| 🟢 P2 | 穿戴设备整合 | Apple Watch / 手环数据 |
| 🟢 P2 | 离线 AI 缓存 | 网络失败时本地降级 |
| 🟢 P2 | 数据导入 | 从导出 JSON 恢复 |
| 🟢 P2 | 动作图标增强 | 接入免费图标库或用户自拍照 |
| 🟢 P2 | 训练提醒 | 本地通知 |

## 文档索引

| 文档 | 路径 | 内容 |
|------|------|------|
| 主 README | [README.md](../README.md) | 项目概览、快速开始 |
| 移动端 | [mobile/README.md](../mobile/README.md) | Flutter 纯本地架构、路由、Provider、ApiService |
| 后端（可选/历史） | [backend/README.md](../backend/README.md) | Express 后端，个人版不再依赖 |
| 项目状态 | 本文件 | 功能清单、架构、待办 |

---

*个人版项目状态 — 纯本地架构*
