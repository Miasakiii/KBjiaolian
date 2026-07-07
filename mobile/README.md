# KB教练 — Flutter 移动端（个人版）

Flutter × Provider × go_router 实现的移动客户端。**纯本地 + 直连大模型**架构：无后端、无登录，App 直连小米 MiMo API，所有数据存本机。

## 架构

```
Flutter App
  ├── ApiService ──直连──→ 小米 MiMo API（key 通过 --dart-define 注入）
  │   ├── 体态分析（多模态：图片 base64 + prompt）
  │   ├── 训练方案生成
  │   ├── 营养识别（多模态）
  │   └── AI 对话（SSE 流式 + markdown 渲染）
  ├── StorageService ──→ SharedPreferences（个人资料/历史记录）
  ├── LocalExercisesService ──→ assets/exercises.json（1324 条动作库，离线）
  └── AuthProvider ──→ 永真 isAuthenticated（无登录态）
```

## 快速开始

### 环境要求
- Flutter 3.44.2+（Dart 3.2+）
- Android Studio 或 VS Code
- 小米 MiMo API Key

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
flutter build apk --release \
  --dart-define=MIMO_API_KEY=sk-你的key \
  --dart-define=MIMO_API_URL=https://api.xiaomimimo.com/v1/chat/completions \
  --dart-define=MIMO_MODEL=mimo-v2.5
```

> ⚠️ 不传 `MIMO_API_KEY` 时 App 可启动，但 AI 功能不可用；动作库浏览、本地训练记录等离线功能正常。

## 目录结构

```
mobile/
├── lib/
│   ├── main.dart                         # 入口（runZonedGuarded 全局错误兜底）
│   ├── app.dart                          # MaterialApp.router 配置（teal 主题）
│   ├── routes/
│   │   └── app_router.dart               # go_router（无登录守卫，所有页面直接可访问）
│   ├── screens/                          # 17 个页面（全部 token 化）
│   │   ├── home_screen.dart              # 首页（统计 + 快捷操作 + 个人资料未填提醒）
│   │   ├── analyze_screen.dart           # 体态分析（8 维度，拍照→AI 多模态）
│   │   ├── compare_screen.dart           # 前后对比分析
│   │   ├── progress_screen.dart          # 进度趋势（折线图）
│   │   ├── plan_screen.dart              # 训练方案生成 + 渐进式超负荷
│   │   ├── workout_screen.dart           # 训练进行中（动作可跳转详情页）
│   │   ├── workout_complete_screen.dart  # 训练完成总结
│   │   ├── nutrition_screen.dart         # 饮食识别（拍照→AI 多模态）
│   │   ├── chat_screen.dart              # AI 教练对话（SSE 流式 + markdown）
│   │   ├── history_screen.dart           # 体态分析历史
│   │   ├── recovery_screen.dart          # 恢复追踪（肌肉恢复 + 4 周热力图）
│   │   ├── exercise_library_screen.dart  # 动作库浏览（筛选 + 搜索 + 分页）
│   │   ├── exercise_detail_screen.dart   # 动作详情（中文步骤 + 肌群标签）
│   │   ├── settings_screen.dart          # 设置 + 数据导出
│   │   ├── profile_screen.dart           # 个人资料编辑（本地保存）
│   │   ├── goal_screen.dart              # 训练目标设置
│   │   ├── about_screen.dart             # 关于
│   │   └── privacy_screen.dart           # 隐私政策
│   ├── providers/                        # 6 个 ChangeNotifier
│   │   ├── auth_provider.dart            # 永真 isAuthenticated，资料存本地
│   │   ├── analysis_provider.dart        # 体态分析结果 + 历史
│   │   ├── plan_provider.dart            # 训练方案
│   │   ├── workout_provider.dart         # 训练进行中状态机
│   │   ├── nutrition_provider.dart       # 饮食记录 + 今日营养汇总
│   │   └── chat_provider.dart            # 聊天消息（仅内存）
│   ├── services/
│   │   ├── api_service.dart              # 直连 MiMo（4 套 prompt + 个人资料注入）
│   │   ├── storage_service.dart          # SharedPreferences JSON 存储
│   │   ├── local_exercises_service.dart  # 动作库本地查询（读 assets JSON）
│   │   ├── cloud_storage_service.dart    # no-op stub（兼容旧调用）
│   │   ├── wechat_pay_service.dart       # no-op stub
│   │   └── export_service.dart           # 数据导出（JSON + share_plus）
│   ├── models/                           # 数据模型
│   ├── widgets/
│   │   ├── common/                       # main_scaffold/stat_card/action_button/...
│   │   └── analyze/                      # radar_chart/score_card/suggestion_list
│   └── theme/                            # kb_colors.dart + kb_spacing.dart
├── assets/
│   ├── exercises.json                    # 动作库数据集（1324 条，9.7MB，离线）
│   └── logo/                             # App 图标素材
├── android/                              # Android 配置（com.kbcoach.personal，已生成图标）
├── pubspec.yaml                          # 依赖 + flutter_launcher_icons 配置
└── analysis_options.yaml
```

## 路由表

无登录守卫，所有页面直接可访问。

| 路径 | 页面 |
|------|------|
| `/` | 首页仪表盘 |
| `/analyze` | 体态分析（8 维度） |
| `/compare` | 前后对比分析 |
| `/progress` | 进度趋势 |
| `/plan` | 训练方案生成 |
| `/workout` | 训练进行中 |
| `/workout/complete` | 训练完成总结 |
| `/nutrition` | 饮食识别 |
| `/chat` | AI 对话 |
| `/history` | 体态分析历史 |
| `/recovery` | 恢复追踪 |
| `/exercises` | 动作库浏览 |
| `/exercises/:id` | 动作详情 |
| `/settings` | 设置 + 数据导出 |
| `/profile` | 个人资料编辑 |
| `/goal` | 训练目标设置 |
| `/about` | 关于 |
| `/privacy` | 隐私政策 |

## ApiService 设计

直连小米 MiMo API（OpenAI 兼容 Chat Completions）：

- **key/url/model 注入**：通过 `--dart-define` 编译时注入，不硬编码
- **4 套 prompt**：体态分析 / 训练方案 / 营养识别 / 对话
- **多模态**：体态分析、营养识别走图片 base64 + prompt
- **SSE 流式**：AI 对话用 Server-Sent Events，实时输出（mimo-V2.5 推理模型分两阶段，只输出正文 content，思维链 reasoning_content 不混入）
- **推理模型回退**：若 `content` 为空（max_tokens 被推理耗尽），回退取 `reasoning_content` 保证有响应
- **个人资料注入**：`_getProfileContext()` 从本地读昵称/性别/年龄/身高/体重，注入所有 AI prompt

## 个人资料与 AI 个性化

个人资料存 SharedPreferences（key: `user_profile`），包含昵称/性别/年龄/身高/体重：

- 保存时同步通知 `AuthProvider`，首页昵称实时刷新
- 作为上下文注入 AI 对话 / 训练方案 / 体态分析 prompt
- 首页检测未填时显示 teal 提醒卡片，引导跳转 `/profile`

## 动作库（离线）

`LocalExercisesService` 从 `assets/exercises.json` 加载 1,324 条动作到内存：

- `getMeta()` — 身体部位/设备/目标肌群聚合（供筛选 UI）
- `list(bodyPart, equipment, target, page, pageSize)` — 分页筛选
- `search(q, page, pageSize)` — 名称/肌群模糊搜索（前缀匹配优先）
- `getById(id)` — 动作详情（含中文逐步说明）

数据来源：[hasaneyldrm/exercises-dataset](https://github.com/hasaneyldrm/exercises-dataset)

## 主题

- `colorSchemeSeed: Color(0xFF0f766e)`（深 teal）
- `KbColors` token 系统（零硬编码颜色）
- 字重只用 400/600（正文/标题）
- 警示橙 `#f97316` 仅用于问题点/不达标

## 国内镜像

```bash
$env:PUB_HOSTED_URL="https://pub.flutter-io.cn"
$env:FLUTTER_STORAGE_BASE_URL="https://storage.flutter-io.cn"
flutter pub get
```

## 许可

Private — 仅供个人使用

---

*移动端文档 — 个人版纯本地架构*
