import 'package:go_router/go_router.dart';

import '../screens/home_screen.dart';
import '../screens/analyze_screen.dart';
import '../screens/plan_screen.dart';
import '../screens/workout_screen.dart';
import '../screens/nutrition_screen.dart';
import '../screens/chat_screen.dart';
import '../screens/history_screen.dart';
import '../screens/settings_screen.dart';
import '../screens/about_screen.dart';
import '../screens/login_screen.dart';
import '../widgets/common/main_scaffold.dart';
import '../services/api_service.dart';

// 公开路由（不需要登录）
const _publicPaths = {'/login', '/about'};

final appRouter = GoRouter(
  initialLocation: '/',
  redirect: (context, state) async {
    final path = state.uri.path;
    final isPublic = _publicPaths.contains(path);
    final isLoggedIn = await ApiService.isAuthenticated();

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
          path: '/about',
          builder: (context, state) => const AboutScreen(),
        ),
      ],
    ),
  ],
);
