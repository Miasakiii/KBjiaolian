import 'dart:async';
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';

import 'app.dart';
import 'routes/app_router.dart';
import 'services/storage_service.dart';
import 'providers/auth_provider.dart';
import 'providers/analysis_provider.dart';
import 'providers/plan_provider.dart';
import 'providers/workout_provider.dart';
import 'providers/nutrition_provider.dart';
import 'providers/chat_provider.dart';

void main() async {
  // 确保 binding 初始化（async main 必须在最前）
  WidgetsFlutterBinding.ensureInitialized();

  // 个人版：无 Firebase / 无微信 SDK，全局错误兜底仅打印控制台
  FlutterError.onError = (details) {
    FlutterError.presentError(details);
    debugPrint('FlutterError: ${details.exception}\n${details.stack}');
  };
  PlatformDispatcher.instance.onError = (error, stack) {
    debugPrint('Zone 未捕获错误: $error\n$stack');
    return true;
  };

  // 初始化本地存储（异常时仍尝试启动，避免黑屏）
  try {
    await StorageService.init();
  } catch (e) {
    debugPrint('StorageService 初始化失败: $e');
  }

  // 设置状态栏样式
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
    ),
  );

  // Lazy Provider：仅 AuthProvider 在启动时创建，其余按需
  final authProvider = AuthProvider();
  final router = createAppRouter(authProvider);

  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider.value(value: authProvider),
        // 懒加载：首次访问时才实例化，减少冷启动耗时
        ChangeNotifierProvider(create: (_) => AnalysisProvider()),
        ChangeNotifierProvider(create: (_) => PlanProvider()),
        ChangeNotifierProvider(create: (_) => WorkoutProvider()),
        ChangeNotifierProvider(create: (_) => NutritionProvider()),
        ChangeNotifierProvider(create: (_) => ChatProvider()),
      ],
      child: KBCoachApp(router: router),
    ),
  );

  // 在 runApp 之后调整方向，避免阻塞启动
  await SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);
}
