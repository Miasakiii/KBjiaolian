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
import '../screens/profile_screen.dart';
import '../screens/goal_screen.dart';
import '../screens/privacy_screen.dart';
import '../screens/workout_complete_screen.dart';
import '../screens/recovery_screen.dart';
import '../screens/exercise_library_screen.dart';
import '../screens/exercise_detail_screen.dart';
import '../theme/kb_colors.dart';
import '../providers/auth_provider.dart';
import '../widgets/common/main_scaffold.dart';

/// 个人版路由 —— 无登录守卫，所有页面直接可访问。
/// createAppRouter 仍接收 AuthProvider（用于 refreshListenable 触发重建），但不再做登录重定向。
GoRouter createAppRouter(AuthProvider authProvider) {
  return GoRouter(
    initialLocation: '/',
    refreshListenable: authProvider,
    errorBuilder: (context, state) => Scaffold(
      appBar: AppBar(title: const Text('页面未找到')),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.explore_off, size: 64, color: KbColors.text3),
            const SizedBox(height: 16),
            const Text('404', style: TextStyle(fontSize: 32, fontWeight: FontWeight.w600, color: KbColors.text2)),
            const SizedBox(height: 8),
            const Text('页面不存在或已被移除', style: TextStyle(color: KbColors.text3)),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: () => context.go('/'),
              child: const Text('返回首页'),
            ),
          ],
        ),
      ),
    ),
    // 个人版无 redirect —— 不做登录态拦截
    routes: [
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
          GoRoute(
            path: '/recovery',
            builder: (context, state) => const RecoveryScreen(),
          ),
          GoRoute(
            path: '/workout/complete',
            builder: (context, state) {
              final extras = state.extra as Map<String, dynamic>?;
              return WorkoutCompleteScreen(
                durationMinutes: extras?['duration'] as int? ?? 0,
                totalExercises: extras?['exercises'] as int? ?? 0,
                totalSets: extras?['sets'] as int? ?? 0,
                rating: extras?['rating'] as int? ?? 4,
              );
            },
          ),
          GoRoute(
            path: '/privacy',
            builder: (context, state) => const PrivacyScreen(),
          ),
          GoRoute(
            path: '/exercises',
            builder: (context, state) => const ExerciseLibraryScreen(),
          ),
          GoRoute(
            path: '/exercises/:id',
            builder: (context, state) => ExerciseDetailScreen(
              exerciseId: state.pathParameters['id'] ?? '',
            ),
          ),
        ],
      ),
    ],
  );
}
