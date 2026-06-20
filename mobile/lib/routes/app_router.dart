import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../screens/home_screen.dart';
import '../screens/analyze_screen.dart';
import '../screens/plan_screen.dart';
import '../screens/workout_screen.dart';
import '../screens/nutrition_screen.dart';
import '../screens/chat_screen.dart';
import '../screens/history_screen.dart';
import '../screens/compare_screen.dart';
import '../screens/settings_screen.dart';
import '../screens/about_screen.dart';
import '../screens/progress_screen.dart';
import '../screens/login_screen.dart';
import '../screens/profile_screen.dart';
import '../screens/goal_screen.dart';
import '../widgets/common/main_scaffold.dart';

// 公开路由（不需要登录）
const _publicPaths = {'/login', '/about'};

/// 创建 appRouter，传入 AuthProvider 作为 refreshListenable，
/// 登录态变化时 GoRouter 会自动重新评估 redirect，无需手动刷新页面。
GoRouter createAppRouter(ChangeNotifier authProvider) {
  return GoRouter(
    initialLocation: '/',
    refreshListenable: authProvider,
    redirect: (context, state) {
      // 同步读取 AuthProvider 状态，避免每次导航都做 async I/O
      final auth = authProvider as dynamic;
      final isLoggedIn = auth.isLoading == false && auth.isAuthenticated == true;
      final path = state.uri.path;
      final isPublic = _publicPaths.contains(path);

      if (auth.isLoading == true) {
        // 加载中时不强制跳转，避免闪烁
        return null;
      }

      // 未登录且访问受保护页面 → 跳转登录
      if (!isLoggedIn && !isPublic) {
        return '/login';
      }

      // 已登录且访问登录页 → 跳转首页
      if (isLoggedIn && path == '/login') {
        return '/';
      }

      return null;
    },
    routes: [
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
      ShellRoute(
        builder: (context, state, child) => MainScaffold(child: child),
        routes: [
          GoRoute(
            path: '/',
            builder: (context, state) => const HomeScreen(),
          ),
          GoRoute(
            path: '/analyze',
            builder: (context, state) => const AnalyzeScreen(),
          ),
          GoRoute(
            path: '/plan',
            builder: (context, state) => const PlanScreen(),
          ),
          GoRoute(
            path: '/workout',
            builder: (context, state) => const WorkoutScreen(),
          ),
          GoRoute(
            path: '/nutrition',
            builder: (context, state) => const NutritionScreen(),
          ),
          GoRoute(
            path: '/chat',
            builder: (context, state) => const ChatScreen(),
          ),
          GoRoute(
            path: '/history',
            builder: (context, state) => const HistoryScreen(),
          ),
          GoRoute(
            path: '/settings',
            builder: (context, state) => const SettingsScreen(),
          ),
          GoRoute(
            path: '/profile',
            builder: (context, state) => const ProfileScreen(),
          ),
          GoRoute(
            path: '/goal',
            builder: (context, state) => const GoalScreen(),
          ),
          GoRoute(
            path: '/about',
            builder: (context, state) => const AboutScreen(),
          ),
          GoRoute(
            path: '/compare',
            builder: (context, state) => const CompareScreen(),
          ),
          GoRoute(
            path: '/progress',
            builder: (context, state) => const ProgressScreen(),
          ),
        ],
      ),
    ],
  );
}
