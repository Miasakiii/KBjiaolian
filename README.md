# KB教练 - AI 健身康复应用

> 🏋️ AI 驱动的体态评估与健身训练平台

## 简介

KB教练是一个全平台健身康复应用，通过 AI 技术为用户提供个性化的体态评估、训练计划、营养建议和运动指导。

## 功能特性

- 🎯 **体态分析** - AI 驱动的体态评估和建议
- 📋 **训练计划** - 个性化训练方案生成
- 🥗 **营养管理** - 饮食建议和营养追踪
- 💬 **AI 聊天** - 智能健身问答
- 📊 **历史记录** - 训练和分析历史追踪
- ⚙️ **个人设置** - 自定义偏好配置

## 技术栈

| 层级 | 技术 |
|------|------|
| Web 前端 | Next.js 14 + React 18 + Tailwind CSS |
| 移动端 | Flutter 3.44.2 + Riverpod |
| 桌面端 | Flutter Windows |
| 后端 | Express.js + MiMo AI API |
| 状态管理 | Provider / Riverpod |
| 本地存储 | Hive / SharedPreferences |

## 快速开始

### 前置要求

- Node.js 18+
- Flutter 3.44.2 (如需移动端)
- Android Studio (如需 Android 构建)

### 启动后端

```bash
cd backend
npm install
npm run dev
# API: http://localhost:3001
```

### 启动 Web 前端

```bash
cd web
npm install
npm run dev
# Web: http://localhost:3000
```

### 启动 Flutter 桌面端

```bash
cd mobile
flutter pub get
flutter run -d windows
```

## 项目结构

```
KBjiaolian/
├── web/                    # Next.js Web 前端
├── backend/                # Express.js 后端 API
├── mobile/                 # Flutter 移动端/桌面端
│   ├── lib/
│   │   ├── screens/        # 页面
│   │   ├── providers/      # 状态管理
│   │   ├── services/       # API 服务
│   │   ├── widgets/        # 组件
│   │   └── models/         # 数据模型
│   ├── windows/            # Windows 平台
│   └── android/            # Android 平台
├── docs/                   # 文档
└── preview-visual-style.html  # 设计预览
```

## API 接口

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/analyze` | POST | 体态分析 |
| `/api/chat` | POST | AI 聊天 |
| `/api/plan` | POST | 训练计划 |
| `/api/nutrition` | POST | 营养建议 |

## 国内镜像

```bash
# Flutter 镜像
export PUB_HOSTED_URL="https://pub.flutter-io.cn"
export FLUTTER_STORAGE_BASE_URL="https://storage.flutter-io.cn"
```

## 文档

- [项目状态总结](docs/project-status.md) - 详细的开发进度和状态

## 许可

Private - 仅供个人使用

---

*Built with ❤️ by KB Coach Team*
