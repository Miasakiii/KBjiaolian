# KB教练 - 项目状态总结

> 更新时间: 2026-06-13

## 项目概述

KB教练是一个 AI 驱动的健身康复应用，帮助用户进行体态评估、训练计划、营养管理和运动指导。

## 技术架构

```
┌─────────────────────────────────────────────────────┐
│                    客户端层                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │ Web 前端  │  │ Flutter  │  │ Flutter 桌面端    │  │
│  │ Next.js   │  │ 移动端   │  │ Windows ✅       │  │
│  │ :3000     │  │ (待完成) │  │ (已构建)         │  │
│  └──────────┘  └──────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│                  后端服务层                           │
│  ┌──────────────────────────────────────────────┐  │
│  │  Express.js API  :3001                       │  │
│  │  - 体态分析接口                               │  │
│  │  - MiMo AI 集成                              │  │
│  │  - 聊天/计划/营养接口                          │  │
│  └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

## 各端状态

### 1. Web 前端 (Next.js) ✅ 完成

| 项目 | 详情 |
|------|------|
| 框架 | Next.js 14.2.18 + React 18 |
| 端口 | http://localhost:3000 |
| 状态 | **已完成** |
| 功能 | 首页、分析、计划、营养、设置、历史记录、聊天 |
| 技术栈 | Tailwind CSS, html2canvas, jsPDF |

**启动命令:**
```bash
cd web && npm run dev
```

### 2. 后端 API (Express.js) ✅ 完成

| 项目 | 详情 |
|------|------|
| 框架 | Express.js 4.x |
| 端口 | http://localhost:3001 |
| 状态 | **已完成** |
| 功能 | 体态分析、AI 聊天、计划生成、营养建议 |
| AI 集成 | MiMo API (dangbei/mimo-v2-pro) |

**启动命令:**
```bash
cd backend && npm run dev
```

**API 端点:**
- `POST /api/analyze` - 体态分析
- `POST /api/chat` - AI 聊天
- `POST /api/plan` - 训练计划生成
- `POST /api/nutrition` - 营养建议

### 3. Flutter 移动端 🔄 进行中

| 项目 | 详情 |
|------|------|
| 框架 | Flutter 3.44.2 + Dart 3.12.2 |
| 状态 | **代码完成，Android 构建待修复** |
| 功能 | 首页、分析、计划、营养、设置、历史记录、聊天、运动 |
| 状态管理 | Riverpod + Provider |

**已完成:**
- ✅ 项目架构搭建
- ✅ 全部页面实现 (9 个页面)
- ✅ API 服务层 (平台自适应)
- ✅ 本地存储 (Hive)
- ✅ 状态管理 (Provider/Riverpod)
- ✅ 路由配置 (GoRouter)
- ✅ Windows 桌面端构建成功

**待完成:**
- ⚠️ Android APK 构建 (flutter_local_notifications 编译兼容性问题)
- ⚠️ iOS 构建
- ⚠️ 应用图标和启动画面
- ⚠️ 网络图片缓存配置

**文件结构:**
```
mobile/lib/
├── main.dart                    # 入口
├── app.dart                     # 应用配置和主题
├── models/
│   └── analysis_result.dart     # 数据模型
├── providers/
│   ├── analysis_provider.dart   # 分析状态管理
│   ├── chat_provider.dart       # 聊天状态管理
│   ├── nutrition_provider.dart  # 营养状态管理
│   ├── plan_provider.dart       # 计划状态管理
│   └── workout_provider.dart    # 运动状态管理
├── routes/
│   └── app_router.dart          # 路由配置
├── screens/
│   ├── home_screen.dart         # 首页
│   ├── analyze_screen.dart      # 体态分析
│   ├── plan_screen.dart         # 训练计划
│   ├── nutrition_screen.dart    # 营养管理
│   ├── chat_screen.dart         # AI 聊天
│   ├── workout_screen.dart      # 运动记录
│   ├── history_screen.dart      # 历史记录
│   ├── settings_screen.dart     # 设置
│   └── about_screen.dart        # 关于
├── services/
│   ├── api_service.dart         # API 服务 (平台自适应)
│   └── storage_service.dart     # 本地存储服务
└── widgets/
    ├── common/
    │   └── main_scaffold.dart   # 主框架
    └── analyze/
        ├── radar_chart.dart     # 雷达图
        ├── score_card.dart      # 分数卡片
        └── suggestion_list.dart # 建议列表
```

**API 地址配置:**
```dart
// services/api_service.dart - 平台自适应
Android 模拟器: http://10.0.2.2:3001/api
iOS 模拟器:     http://localhost:3001/api
桌面端:         http://localhost:3001/api
```

### 4. Flutter 桌面端 (Windows) ✅ 完成

| 项目 | 详情 |
|------|------|
| 状态 | **已构建成功** |
| 可执行文件 | `mobile/build/windows/x64/runner/Release/kb_coach.exe` |
| 启动方式 | 双击 exe 或 `flutter run -d windows` |

## 已解决的问题

### Web 端
1. ✅ 静态导出 API 路由 404 问题
2. ✅ 移动端导航布局优化
3. ✅ 聊天输入框被遮挡问题
4. ✅ 历史记录无法加载问题
5. ✅ 菜单栏覆盖聊天界面问题

### Flutter 端
1. ✅ Socket 连接 pub.dev 失败 → 使用国内镜像
2. ✅ Windows Developer Mode 未开启
3. ✅ Visual Studio C++ 组件缺失
4. ✅ CardTheme 类型错误 → CardThemeData
5. ✅ shade800 getter 错误 → 直接使用颜色
6. ✅ 字体文件缺失 → 移除 fonts 配置
7. ✅ Android 平台支持已添加

### 后端
1. ✅ API 接口设计和实现
2. ✅ MiMo AI 集成

## 待解决问题

### Android 构建问题 (优先级: 高)

**问题描述:**
```
flutter_local_notifications 16.3.3 编译错误:
bigLargeIcon(null) 方法引用不明确
BigPictureStyle 中的方法 bigLargeIcon(Bitmap) 和 bigLargeIcon(Icon) 都匹配
```

**解决方案:**
1. 升级 `flutter_local_notifications` 到 ^18.0.0 (需要开启 Windows Developer Mode)
2. 或降级 Android compileSdk 到 34
3. 或手动 patch pub cache 中的插件代码

**阻塞原因:**
- 升级插件需要开启 Windows Developer Mode (用于 symlink 支持)
- 用户暂时不想处理

### 其他待完成项

1. **iOS 构建** - 需要 macOS 环境和 Xcode
2. **应用图标** - 需要设计 app icon
3. **启动画面** - 需要配置 splash screen
4. **签名配置** - release 构建需要正式签名
5. **网络图片缓存** - cached_network_image 配置

## 环境要求

### 开发环境
- Node.js 18+
- Flutter 3.44.2
- Dart 3.12.2
- Android Studio (Android SDK)
- Visual Studio 2022 (C++ 桌面开发)

### 国内镜像配置
```bash
# Flutter
export PUB_HOSTED_URL="https://pub.flutter-io.cn"
export FLUTTER_STORAGE_BASE_URL="https://storage.flutter-io.cn"

# Gradle (已在 android/settings.gradle.kts 配置)
# 阿里云 Maven 镜像
```

### Gradle 配置
- Gradle 版本: 9.1.0
- Android Gradle Plugin: 9.0.1
- Kotlin: 2.3.20
- JDK: LibericaJDK-21 (系统) / Android Studio JBR

## 启动指南

### 快速启动 (Web + 后端)

**终端 1 - 后端:**
```bash
cd backend
npm run dev
# API 运行在 http://localhost:3001
```

**终端 2 - Web 前端:**
```bash
cd web
npm run dev
# Web 运行在 http://localhost:3000
```

### Flutter 桌面端
```bash
cd mobile
flutter run -d windows
# 或直接运行: build/windows/x64/runner/Release/kb_coach.exe
```

### Flutter Android (待修复)
```bash
cd mobile
# 需要先开启 Windows Developer Mode
flutter run -d android
```

## 下一步计划

1. **修复 Android 构建** - 解决 flutter_local_notifications 兼容性问题
2. **完善移动端 UI** - 优化触控体验和动画
3. **添加应用图标** - 设计并配置各平台图标
4. **实现离线功能** - 本地缓存和离线模式
5. **性能优化** - 图片懒加载、列表虚拟化
6. **测试覆盖** - 单元测试和集成测试
7. **发布准备** - 签名、混淆、多语言

---

*文档维护: 项目进展文档，请随开发进度更新*
