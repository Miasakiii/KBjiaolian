import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../providers/analysis_provider.dart';
import '../providers/workout_provider.dart';
import '../providers/nutrition_provider.dart';
import '../theme/kb_colors.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // 欢迎区域
              _buildHeader(context),
              const SizedBox(height: 28),

              // 数据统计
              _buildStats(context),
              const SizedBox(height: 28),

              // 快捷操作
              _buildQuickActions(context),
              const SizedBox(height: 28),

              // 今日任务
              _buildTodayTasks(context),
              const SizedBox(height: 28),

              // 更多功能
              _buildMoreFeatures(context),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeader(BuildContext context) {
    final hour = DateTime.now().hour;
    String greeting;
    if (hour < 6) {
      greeting = '夜深了';
    } else if (hour < 12) {
      greeting = '早上好';
    } else if (hour < 18) {
      greeting = '下午好';
    } else {
      greeting = '晚上好';
    }

    return Row(
      children: [
        Container(
          width: 56,
          height: 56,
          decoration: BoxDecoration(
            color: KbColors.brand,
            borderRadius: BorderRadius.circular(16),
            boxShadow: [
              BoxShadow(
                color: KbColors.brand.withValues(alpha: 0.16),
                blurRadius: 16,
                offset: const Offset(0, 6),
              ),
            ],
          ),
          child: const Icon(
            Icons.fitness_center,
            color: Colors.white,
            size: 28,
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                '$greeting！',
                style: const TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.w600,
                  color: KbColors.text1,
                ),
              ),
              const SizedBox(height: 2),
              const Text(
                '欢迎使用 KB教练',
                style: TextStyle(
                  fontSize: 14,
                  color: KbColors.brand,
                  fontWeight: FontWeight.w400,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildStats(BuildContext context) {
    return Consumer3<AnalysisProvider, WorkoutProvider, NutritionProvider>(
      builder: (context, analysisProvider, workoutProvider, nutritionProvider, _) {
        final latestScore = analysisProvider.latestScore;
        final weekWorkouts = workoutProvider.thisWeekWorkouts;
        final todayNutrition = nutritionProvider.todayNutrition;

        return Row(
          children: [
            Expanded(
              child: _StatCard(
                icon: Icons.insights,
                title: '体态评分',
                value: latestScore?.toString() ?? '--',
                subtitle: latestScore != null ? '最新评分' : '未测评',
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _StatCard(
                icon: Icons.fitness_center,
                title: '本周训练',
                value: '$weekWorkouts次',
                subtitle: '近 7 天',
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _StatCard(
                icon: Icons.restaurant,
                title: '今日热量',
                value: '${todayNutrition['calories']}',
                subtitle: '${todayNutrition['recordCount']} 条记录',
              ),
            ),
          ],
        );
      },
    );
  }

  Widget _buildQuickActions(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          '快捷操作',
          style: TextStyle(
            fontSize: 17,
            fontWeight: FontWeight.w600,
            color: KbColors.text1,
          ),
        ),
        const SizedBox(height: 14),
        Row(
          children: [
            Expanded(
              child: _ActionButton(
                icon: Icons.camera_alt,
                label: '体态分析',
                onTap: () => context.go('/analyze'),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _ActionButton(
                icon: Icons.sports_gymnastics,
                label: '开始训练',
                onTap: () => context.go('/workout'),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _ActionButton(
                icon: Icons.restaurant_menu,
                label: '饮食记录',
                onTap: () => context.go('/nutrition'),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _ActionButton(
                icon: Icons.smart_toy,
                label: 'AI 教练',
                onTap: () => context.go('/chat'),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildTodayTasks(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Row(
              children: [
                Icon(Icons.checklist, size: 20, color: KbColors.brand),
                SizedBox(width: 8),
                Text(
                  '今日任务',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
                ),
              ],
            ),
            const SizedBox(height: 16),
            _TaskItem(
              icon: Icons.camera_alt,
              title: '完成首次体态分析',
              completed: false,
              onTap: () => context.go('/analyze'),
            ),
            _TaskItem(
              icon: Icons.sports_gymnastics,
              title: '今日训练',
              completed: false,
              onTap: () => context.go('/workout'),
            ),
            _TaskItem(
              icon: Icons.restaurant,
              title: '记录今日饮食',
              completed: false,
              onTap: () => context.go('/nutrition'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMoreFeatures(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          '更多功能',
          style: TextStyle(
            fontSize: 17,
            fontWeight: FontWeight.w600,
            color: KbColors.text1,
          ),
        ),
        const SizedBox(height: 14),
        Wrap(
          spacing: 12,
          runSpacing: 12,
          children: [
            _FeatureChip(
              icon: Icons.assignment,
              label: '训练方案',
              onTap: () => context.go('/plan'),
            ),
            _FeatureChip(
              icon: Icons.trending_up,
              label: '进度趋势',
              onTap: () => context.go('/progress'),
            ),
            _FeatureChip(
              icon: Icons.upload_file,
              label: '数据导出',
              onTap: () {
                _showTODOToast(context, '数据导出功能开发中');
              },
            ),
            _FeatureChip(
              icon: Icons.info_outline,
              label: '关于',
              onTap: () => context.go('/about'),
            ),
          ],
        ),
      ],
    );
  }

  void _showTODOToast(BuildContext context, String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        duration: const Duration(seconds: 2),
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final String value;
  final String subtitle;

  const _StatCard({
    required this.icon,
    required this.title,
    required this.value,
    required this.subtitle,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          children: [
            Icon(icon, size: 24, color: KbColors.brand),
            const SizedBox(height: 10),
            Text(
              value,
              style: const TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.w600,
                color: KbColors.text1,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              title,
              style: const TextStyle(
                fontSize: 12,
                color: KbColors.brand,
                fontWeight: FontWeight.w400,
              ),
            ),
            Text(
              subtitle,
              style: const TextStyle(
                color: KbColors.text3,
                fontSize: 10,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ActionButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;

  const _ActionButton({
    required this.icon,
    required this.label,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(20),
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 18),
          child: Column(
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: KbColors.brand,
                  borderRadius: BorderRadius.circular(14),
                  boxShadow: [
                    BoxShadow(
                      color: KbColors.brand.withValues(alpha: 0.16),
                      blurRadius: 8,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Icon(icon, color: Colors.white, size: 22),
              ),
              const SizedBox(height: 10),
              Text(
                label,
                style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: KbColors.text1,
                ),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _TaskItem extends StatelessWidget {
  final IconData icon;
  final String title;
  final bool completed;
  final VoidCallback onTap;

  const _TaskItem({
    required this.icon,
    required this.title,
    required this.completed,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 10),
        child: Row(
          children: [
            Icon(
              icon,
              size: 18,
              color: completed ? KbColors.brand : KbColors.text3,
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                title,
                style: TextStyle(
                  fontSize: 14,
                  color: completed ? KbColors.brand : KbColors.text1,
                  decoration: completed ? TextDecoration.lineThrough : null,
                  fontWeight: FontWeight.w400,
                ),
              ),
            ),
            Icon(
              completed ? Icons.check_circle : Icons.arrow_forward_ios,
              size: 16,
              color: completed ? KbColors.brand : KbColors.line,
            ),
          ],
        ),
      ),
    );
  }
}

class _FeatureChip extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;

  const _FeatureChip({
    required this.icon,
    required this.label,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return ActionChip(
      avatar: Icon(icon, size: 16, color: KbColors.brand),
      label: Text(
        label,
        style: const TextStyle(
          fontSize: 13,
          fontWeight: FontWeight.w400,
          color: KbColors.text1,
        ),
      ),
      onPressed: onTap,
      backgroundColor: KbColors.surface,
      side: const BorderSide(color: KbColors.lineSoft),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(20),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 4),
    );
  }
}
