# KB教练 Flutter 移动端

## 简介

KB教练是一款 AI 驱动的健身康复应用，这是 Flutter 移动端实现。

## 功能特性

- 📸 AI 体态分析
- 🏋️ 个性化训练方案
- 🍎 饮食识别
- 🤖 AI 教练对话
- 📊 进度追踪
- ⚙️ 个人设置

## 技术栈

- **框架**: Flutter 3.x
- **状态管理**: Provider
- **路由**: go_router
- **本地存储**: shared_preferences
- **网络请求**: http
- **图片处理**: image_picker

## 项目结构

```
lib/
├── main.dart              # 应用入口
├── app.dart               # 应用配置
├── routes/                # 路由配置
│   └── app_router.dart
├── screens/               # 页面
│   ├── home_screen.dart
│   ├── analyze_screen.dart
│   ├── plan_screen.dart
│   ├── workout_screen.dart
│   ├── nutrition_screen.dart
│   ├── chat_screen.dart
│   ├── history_screen.dart
│   ├── settings_screen.dart
│   └── about_screen.dart
├── widgets/               # 组件
│   ├── common/
│   └── analyze/
├── services/              # 服务
│   ├── api_service.dart
│   └── storage_service.dart
├── models/                # 数据模型
│   └── analysis_result.dart
├── providers/             # 状态管理
│   ├── analysis_provider.dart
│   ├── plan_provider.dart
│   ├── workout_provider.dart
│   ├── nutrition_provider.dart
│   └── chat_provider.dart
└── utils/                 # 工具函数
```

## 快速开始

### 环境要求

- Flutter 3.2.0+
- Dart 3.2.0+
- Android Studio / VS Code

### 安装依赖

```bash
cd mobile
flutter pub get
```

### 运行应用

```bash
# Android 模拟器
flutter run

# iOS 模拟器
flutter run -d ios

# 真机
flutter run -d <device_id>
```

### 配置 API 地址

编辑 `lib/services/api_service.dart`，修改 `baseUrl`：

```dart
// Android 模拟器
static const String baseUrl = 'http://10.0.2.2:3001/api';

// iOS 模拟器
static const String baseUrl = 'http://localhost:3001/api';

// 真机（需要配置实际 IP）
static const String baseUrl = 'http://192.168.1.100:3001/api';
```

## 构建

### Android

```bash
flutter build apk --release
```

### iOS

```bash
flutter build ios --release
```

## 后端 API

复用 Web 端的后端 API，详见 `backend/` 目录。

## 开发计划

- [x] 项目搭建
- [x] 首页仪表盘
- [x] 体态分析
- [x] AI 对话
- [x] 饮食记录
- [x] 训练方案
- [x] 训练打卡
- [x] 历史记录
- [x] 设置页面
- [x] 关于页面
- [ ] 通知推送
- [ ] 离线支持
- [ ] 性能优化

## 许可证

MIT License
