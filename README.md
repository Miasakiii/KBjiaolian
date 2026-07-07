# KB教练 - AI 健身康复应用（个人版）

> 🏋️ AI 驱动的体态评估与健身训练应用 · 纯本地 · 直连大模型 · 无后端无登录

## 简介

KB教练个人版是一个纯本地运行的健身康复应用，移动端直连小米 MiMo 大模型 API，无需后端服务器、无需登录注册。所有用户数据（个人资料/体态记录/训练方案/饮食记录/聊天历史）存储在本机 SharedPreferences，动作库（1,324 条）打包进 APK 离线可用，隐私可控。

## 功能特性

- 🎯 **体态分析** — AI 驱动的 8 维度体态评估（头前伸/圆肩/骨盆前倾/膝超伸/脊柱侧弯/高低肩/XO型腿/核心稳定）
- 📋 **训练计划** — 个性化训练方案生成 + 渐进式超负荷
- 🥗 **营养管理** — 食物拍照识别 + 营养成分估算
- 💬 **AI 聊天** — 智能健身问答（流式 SSE + markdown 渲染）
- 📚 **动作库** — 内置 1,324 个训练动作（10 个身体部位 / 12 种设备 / 含中文逐步说明），离线浏览搜索
- 📊 **历史记录** — 体态/训练/饮食全维度历史追踪 + 前后对比 + 进度趋势
- 🔄 **恢复追踪** — 肌肉恢复进度 + 4 周训练热力图
- 📤 **数据导出** — JSON 统一导出 + 系统分享
- 👤 **个人资料** — 年龄/性别/身高/体重作为 AI 个性化建议上下文，首页未填提醒
- 🎨 **视觉设计系统** — 深 teal `#0f766e` 临床专业色 + 极简留白

## 技术栈

| 层级 | 技术 |
|------|------|
| 移动端/桌面端 | Flutter 3.44.2 + Provider 6 + go_router 12 + KbColors token |
| AI | 小米 MiMo（OpenAI 兼容 Chat Completions API，key 通过 `--dart-define` 注入） |
| 本地存储 | SharedPreferences（个人资料/历史记录） |
| 动作库数据 | JSON 打包进 assets（1,324 条，离线可用） |
| AI 回复渲染 | flutter_markdown |
| 图标 | flutter_launcher_icons |

## 模块文档

- [移动端](mobile/README.md) — Flutter 路由、Provider、直连 MiMo、本地存储、KbColors token
- [项目状态](docs/project-status.md) — 功能清单、架构、待办

## 快速开始

### 前置要求

- Flutter 3.44.2+（Dart 3.2+）
- 小米 MiMo API Key（[申请地址](https://www.xiaomimimo.com/)）

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

### Windows 桌面端

```bash
cd mobile
flutter run -d windows \
  --dart-define=MIMO_API_KEY=sk-你的key \
  --dart-define=MIMO_API_URL=https://api.xiaomimimo.com/v1/chat/completions \
  --dart-define=MIMO_MODEL=mimo-v2.5
```

> ⚠️ 若不传 `MIMO_API_KEY`，App 可启动但 AI 功能（体态分析/训练方案/营养识别/对话）不可用；动作库浏览、本地训练记录等离线功能正常。

## 项目结构

```
KBjiaolian/
├── mobile/                 # Flutter 移动端（个人版主体，详见 mobile/README.md）
│   ├── lib/
│   │   ├── main.dart              # 入口（runZonedGuarded 全局错误兜底）
│   │   ├── app.dart               # MaterialApp.router 配置
│   │   ├── routes/app_router.dart # go_router 路由（无登录守卫）
│   │   ├── screens/               # 17 个页面（含动作库/恢复追踪/训练完成）
│   │   ├── providers/             # 6 个 ChangeNotifier（AuthProvider 永真）
│   │   ├── services/
│   │   │   ├── api_service.dart          # 直连 MiMo API（无后端）
│   │   │   ├── storage_service.dart      # SharedPreferences 本地存储
│   │   │   ├── local_exercises_service.dart # 动作库本地查询（读 assets JSON）
│   │   │   ├── cloud_storage_service.dart # no-op stub（兼容旧调用）
│   │   │   ├── wechat_pay_service.dart   # no-op stub
│   │   │   └── export_service.dart       # 数据导出
│   │   ├── models/                # 数据模型
│   │   ├── widgets/               # common + analyze 组件
│   │   └── theme/                 # kb_colors.dart + kb_spacing.dart
│   ├── assets/
│   │   ├── exercises.json         # 动作库数据集（1,324 条，9.7MB，离线）
│   │   └── logo/                  # App 图标素材
│   ├── android/                   # Android 配置（com.kbcoach.personal）
│   └── windows/                   # Windows 桌面配置
├── docs/                   # 项目文档
└── README.md               # 本文件
```

## 架构

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

## 个人资料与 AI 个性化

个人资料（昵称/性别/年龄/身高/体重）存储在本地 SharedPreferences，并作为上下文注入所有 AI 调用：

- **AI 对话** — system prompt 拼接个人资料
- **训练方案生成** — "用户信息"段落包含个人资料
- **体态分析** — system prompt 拼接个人资料

首页检测到个人资料未填时显示提醒卡片，引导用户前往 `/profile` 完善。

## 动作库数据集

**来源**：[hasaneyldrm/exercises-dataset](https://github.com/hasaneyldrm/exercises-dataset)（1,324 条，10 个身体部位，12 种设备，6 种语言含中文）

- 打包进 `mobile/assets/exercises.json`（9.7MB），完全离线
- `LocalExercisesService` 启动时加载到内存，提供列表/详情/搜索/元数据查询
- 浏览页支持按身体部位/设备筛选 + 关键词搜索
- 详情页显示中文逐步说明 + 目标肌群 + 协同肌群

⚠️ 该数据集仓库未明确标注开源许可证，基础数据来自 ExerciseDB v1。个人版本地使用风险较低，不可商用。

## 国内镜像

```bash
# Flutter 镜像（国内访问慢时使用）
$env:PUB_HOSTED_URL="https://pub.flutter-io.cn"
$env:FLUTTER_STORAGE_BASE_URL="https://storage.flutter-io.cn"
```

## 许可

Private — 仅供个人使用

---

*Built with ❤️ for personal fitness coaching*
