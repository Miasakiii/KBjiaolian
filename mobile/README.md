# KB教练 — Flutter 移动端

Flutter × Provider × go_router 实现的移动/桌面客户端，复用 Web 端的后端 API。

## 快速开始

### 环境要求
- Flutter 3.44.2+（Dart 3.2+）
- Android Studio 或 VS Code
- 后端服务运行中（默认 `http://10.0.2.2:3001/api` for Android 模拟器，`http://localhost:3001/api` for iOS/桌面）

```bash
cd mobile
flutter pub get
flutter run
```

### 配置 API 地址

通过 `--dart-define` 注入生产 URL，避免硬编码：

```bash
flutter run \
  --dart-define=API_BASE_URL=https://api.your-host.com/api

# 构建 release
flutter build apk --release \
  --dart-define=API_BASE_URL=https://api.your-host.com/api
```

未传入时回退到本机开发地址（Android: `http://10.0.2.2:3001/api`）。

> **生产环境必须使用 HTTPS**：`AndroidManifest.xml` 已移除 `android:usesCleartextTraffic="true"`，开发回退地址仅在未设置 `--dart-define` 时生效。

## 目录结构

```
mobile/
├── lib/
│   ├── main.dart                    # 入口（runZonedGuarded + 全局错误兜底）
│   ├── app.dart                     # MaterialApp.router 配置
│   ├── routes/
│   │   └── app_router.dart          # createAppRouter(authProvider) + refreshListenable
│   ├── screens/                     # 10 个页面
│   │   ├── home_screen.dart         # 首页（统计 + 快捷操作 + 任务）
│   │   ├── analyze_screen.dart      # 体态分析
│   │   ├── nutrition_screen.dart    # 饮食识别
│   │   ├── chat_screen.dart         # AI 教练对话
│   │   ├── plan_screen.dart         # 训练方案生成
│   │   ├── workout_screen.dart      # 训练进行中 + 历史
│   │   ├── history_screen.dart      # 体态分析历史
│   │   ├── settings_screen.dart     # 设置 + 清空数据
│   │   ├── login_screen.dart        # 登录/注册
│   │   └── about_screen.dart        # 关于
│   ├── providers/                   # 6 个 ChangeNotifier
│   │   ├── auth_provider.dart       # 登录态、用户信息、login/logout/register
│   │   ├── analysis_provider.dart   # 体态分析结果 + 历史
│   │   ├── plan_provider.dart       # 训练方案
│   │   ├── workout_provider.dart    # 训练进行中状态机
│   │   ├── nutrition_provider.dart  # 饮食记录 + 今日营养汇总
│   │   └── chat_provider.dart       # 聊天消息
│   ├── services/
│   │   ├── api_service.dart         # HTTP 封装（30s 超时 + JSON 解析保护 + 类型校验）
│   │   ├── storage_service.dart     # SharedPreferences JSON 存储
│   │   └── cloud_storage_service.dart # 云端同步封装
│   ├── models/                      # JSON 反序列化数据类
│   │   ├── analysis_result.dart
│   │   ├── nutrition_record.dart
│   │   ├── training_plan.dart
│   │   ├── workout_record.dart
│   │   └── user.dart
│   ├── widgets/
│   │   ├── common/
│   │   │   └── main_scaffold.dart   # 底部导航壳
│   │   └── analyze/
│   │       ├── radar_chart.dart     # 8 维度雷达图（CustomPainter）
│   │       ├── score_card.dart      # 评分 + 问题标签
│   │       └── suggestion_list.dart # 建议列表
│   └── utils/                       # 工具函数
├── android/                         # Android 平台代码（已禁用 cleartextTraffic）
├── windows/                         # Windows 桌面平台代码
├── test/                            # 单元测试
├── pubspec.yaml
└── analysis_options.yaml            # flutter_lints 配置
```

## 路由表

| 路径 | 页面 | 公开 |
|------|------|------|
| `/login` | 登录/注册 | 公开 |
| `/about` | 关于 | 公开 |
| `/` | 首页仪表盘 | 受保护 |
| `/analyze` | 体态分析 | 受保护 |
| `/plan` | 训练方案生成 | 受保护 |
| `/workout` | 训练进行中 | 受保护 |
| `/nutrition` | 饮食识别 | 受保护 |
| `/chat` | AI 对话 | 受保护 |
| `/history` | 体态分析历史 | 受保护 |
| `/settings` | 设置 | 受保护 |

路由守卫：`createAppRouter(authProvider)` 接收 AuthProvider 作为 `refreshListenable`，登录态变化自动重新评估 redirect，无需手动刷新页面。`redirect` 同步读取 AuthProvider 状态，不再做 async I/O。

## 状态管理

### Provider 6.1.1
所有 Provider 继承 `ChangeNotifier`，在 `main.dart` 通过 `MultiProvider` 注入：

```dart
final authProvider = AuthProvider();
final router = createAppRouter(authProvider);

runApp(MultiProvider(
  providers: [
    ChangeNotifierProvider.value(value: authProvider),
    ChangeNotifierProvider(create: (_) => AnalysisProvider()),
    ChangeNotifierProvider(create: (_) => PlanProvider()),
    ChangeNotifierProvider(create: (_) => WorkoutProvider()),
    ChangeNotifierProvider(create: (_) => NutritionProvider()),
    ChangeNotifierProvider(create: (_) => ChatProvider()),
  ],
  child: KBCoachApp(router: router),
));
```

### 关键 Provider 说明

| Provider | 职责 |
|----------|------|
| `AuthProvider` | 持有 `_isAuthenticated`/`_user`/`_isLoading`，登录防重入，logout 兜底 try/finally |
| `AnalysisProvider` | `analyzePhoto` 防重入；分析后合并本地+云端记录去重 |
| `WorkoutProvider` | `startWorkout` 校验 dayIndex 范围、sets 类型兼容；`thisWeekWorkouts` 以本周一 00:00 为起点 |
| `NutritionProvider` | `todayNutrition` 全类型安全（`_toInt` 兼容 num/double/String/null） |
| `ChatProvider` | `clearChat` 改为 Future 同步清空云端；历史消息 skip 欢迎消息 |

## 网络层（ApiService）

`lib/services/api_service.dart` 关键设计：

- `baseUrl` 优先从 `--dart-define=API_BASE_URL` 读取
- 所有请求 `.timeout(Duration(seconds: 30))`，AI 图片类请求 90 秒
- `_parseJsonObject(response)` 安全解析：空响应、非 JSON、非 Object 都抛友好错误
- `_throwFromResponse` 提取 `error` 字段，无则用 fallback 文案
- `sendMessage` 校验返回的 `reply` 是非空 String，避免 null 流入 `Future<String>` 签名
- `authenticatedDelete` 用于清空云端聊天历史

## 本地存储

`StorageService`（基于 SharedPreferences）：
- `getJson`/`getList` 加 try/catch，损坏数据返回默认值不崩
- 通用 `save`/`get`/`saveJson`/`saveList` 接口
- 业务方法：`saveAnalysisRecord`/`getAnalysisRecords`、`saveWorkoutRecord` 等

## 全局错误兜底

`main.dart`：
```dart
FlutterError.onError = (details) {
  FlutterError.presentError(details);
  debugPrint('FlutterError: ${details.exception}\n${details.stack}');
};

runZonedGuarded(() async {
  // ...
}, (error, stack) {
  debugPrint('Zone 未捕获错误: $error\n$stack');
});
```
- `StorageService.init` 失败不再黑屏，仅 `debugPrint`
- `setPreferredOrientations` 移到 `runApp` 之后，避免阻塞启动

## 主题

- `colorSchemeSeed: Color(0xFF16a34a)`（Material 3 绿色种子色）
- 不指定 `fontFamily`，使用平台默认（Android: Roboto，iOS: SF）
- `scaffoldBackgroundColor: Color(0xFFF0FDF4)`（淡绿背景）

## 国内镜像

```bash
export PUB_HOSTED_URL="https://pub.flutter-io.cn"
export FLUTTER_STORAGE_BASE_URL="https://storage.flutter-io.cn"
flutter pub get
```

## 构建

### Android
```bash
flutter build apk --release \
  --dart-define=API_BASE_URL=https://api.your-host.com/api
```

### Windows 桌面
```bash
flutter build windows --release \
  --dart-define=API_BASE_URL=http://localhost:3001/api
```

## 测试

```bash
flutter test
```

测试目录：
- `test/models/` — 数据模型反序列化
- `test/providers/` — Provider 业务逻辑
- `test/services/` — ApiService（mock http）

> 测试需先 `flutter pub get`。`test/widget_test.dart` 等部分测试因依赖未安装可能在 WSL 中报错，需在 Windows 原生环境运行。

## 本轮代码审查修复（2026-06）

### Critical
- 全站明文 HTTP + `usesCleartextTraffic="true"` → 支持 `--dart-define` 注入 HTTPS；移除明文流量允许
- 登录/注册无邮箱格式 / 密码上限 → RegExp 校验 + 128 位上限
- GoRouter redirect async 每次导航 I/O → 同步化 + `refreshListenable: authProvider`
- `sendMessage` 返回 `null` 但签名 `Future<String>` → 类型校验 + 抛错
- 所有 `jsonDecode` 无异常保护 / 无超时 → `_parseJsonObject` + `.timeout()`
- 注册后 `result['user']` 缺失导致状态不一致 → 兼容 null/Map/平铺结构
- `chat_provider` `take(_messages.length - 1)` 可能负数 + 欢迎消息发给 AI → `skip(1)` + clamp
- `workout_screen` `Navigator.pushNamed` 与 go_router 不兼容 → `context.push`
- `thisWeekWorkouts` 本周一当天记录漏掉 → 改用本周一 00:00 起点

### High
- 多处 await 后未检查 `mounted` → `if (!mounted) return`
- `_ActiveWorkoutState.Stream.periodic` 在 build 中创建 → 移到 `initState`
- `startWorkout` 不校验 dayIndex / sets 类型不安全 → 边界校验 + `parseRangeNum`
- `todayNutrition` `as int` 强转 → `_toInt` 兼容 num/String/null
- 多处 `DateTime.parse` 无 tryParse → 替换并默认 `DateTime.now()`
- `history_screen` `issue['name']` 直接传 Text → `whereType<Map>()` + `?.toString()`
- `settings` 清空数据未 await + 未重置 providers → 改 async + 调用各 provider clear 方法
- `analysis_provider.clearHistory` 同步签名调异步存储 → 改 `Future<void>`
- `StorageService.getJson/getList` 损坏数据崩 → try/catch 默认值
- `_ActiveWorkoutState currentWorkout!` 解包 → null check + 空 exercises 防御
- `_RadarChartPainter.shouldRepaint => true` → 比较字段，数据未变不重绘

### Medium
- 删除重复 `lib/models/chat_message.dart`（与 `chat_provider.dart` 内同名类冲突，未被生产代码引用）
- `main_scaffold._getCurrentIndex` 完善路由映射（plan/workout/history 等不强制高亮首页）
- `home_screen._buildStats` 接入 Workout/Nutrition Provider，显示本周训练 + 今日热量真实数据
- home_screen "进度趋势"/"数据导出" chip 空实现 → SnackBar 提示"功能开发中"
- `chat_screen` ListView 无 key + 进入不滚到底 → `ValueKey` + `initState` postFrameCallback 滚动
- `nutrition_screen` foods 非 Map 元素崩溃 → `whereType<Map>()` + 字段 `?.toString()`
- `analysis_provider.analyzePhoto` 防重入 + 合并本地/云端记录去重
- `chat_provider.clearChat` 同步清空云端（`authenticatedDelete('/data/chat')`）

### Low
- `analysis_result.dart` `List<String>.from` 强转 → `?.map((e) => e.toString()).toList()`
- `analysis_provider._loadHistory` 兼容 `{result: {...}}` 与平铺结构
- `main.dart` 引入 `FlutterError.onError` + `runZonedGuarded` 全局错误兜底
- `chat_screen` 输入框加 `maxLength: 2000`
- `score_card` severity switch 显式区分 `mild` 与未知（原 default 误归 mild）
- `app.dart` 移除未声明的 `fontFamily: 'NotoSansSC'`

## 已知限制 / 后续改进

| 项 | 说明 |
|----|------|
| 无推送通知 | 推送相关代码未实现 |
| 无离线缓存 | 网络请求失败直接报错，未做本地缓存降级 |
| 测试覆盖不全 | `widget_test.dart` 等部分测试因依赖未安装需要 Windows 原生环境 |
| `flutter_lints` 配置过简 | 建议启用 `avoid_dynamic_calls` / `unawaited_futures` / `use_build_context_synchronously` |
| 无 404 fallback 路由 | GoRouter 默认空白屏 |
| 字体回退 | 当前用平台默认字体，未来需要 NotoSansSC 时需在 pubspec 声明字体资源 |
| `NutritionRecord` model 字段结构 | model 与 provider 实际使用的 schema 不一致，需统一 |
| `dart_code_metrics` 未接入 | 建议接入 CI 跑 `flutter analyze` 与 `flutter test` |

---
*移动端文档 — 随开发进度更新*
