import 'dart:async';
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

void main() {
  // 全局 Flutter 框架错误捕获
  FlutterError.onError = (details) {
    FlutterError.presentError(details);
    debugPrint('FlutterError: ${details.exception}\n${details.stack}');
  };

  // 通过 zone 捕获所有未处理异步错误，避免黑屏
  runZonedGuarded(() async {
    WidgetsFlutterBinding.ensureInitialized();

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

    final authProvider = AuthProvider();
    final router = createAppRouter(authProvider);

    runApp(
      MultiProvider(
        providers: [
          ChangeNotifierProvider.value(value: authProvider),
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
  }, (error, stack) {
    debugPrint('Zone 未捕获错误: $error\n$stack');
  });
}
