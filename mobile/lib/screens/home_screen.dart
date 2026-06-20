import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../providers/analysis_provider.dart';
import '../providers/workout_provider.dart';
import '../providers/nutrition_provider.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // 欢迎区域
              _buildHeader(context),
              const SizedBox(height: 24),

              // 数据统计
              _buildStats(context),
              const SizedBox(height: 24),

              // 快捷操作
              _buildQuickActions(context),
              const SizedBox(height: 24),

              // 今日任务
              _buildTodayTasks(context),
              const SizedBox(height: 24),

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
            gradient: const LinearGradient(
              colors: [Color(0xFF16a34a), Color(0xFF15803d)],
            ),
            borderRadius: BorderRadius.circular(16),
            boxShadow: [
              BoxShadow(
                color: const Color(0xFF16a34a).withValues(alpha: 0.3),
                blurRadius: 12,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: const Center(
            child: Text('💪', style: TextStyle(fontSize: 28)),
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                '$greeting！',
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: const Color(0xFF166534),
                ),
              ),
              Text(
                '欢迎使用 KB教练',
                style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                  color: Colors.green.shade600,
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
                icon: '📊',
                title: '体态评分',
                value: latestScore?.toString() ?? '--',
                subtitle: latestScore != null ? '最新评分' : '未测评',
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _StatCard(
                icon: '💪',
                title: '本周训练',
                value: '$weekWorkouts次',
                subtitle: '近 7 天',
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _StatCard(
                icon: '🍎',
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
        Text(
          '快捷操作',
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.bold,
            color: const Color(0xFF166534),
          ),
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: _ActionButton(
                icon: '📸',
                label: '体态分析',
                color: const Color(0xFF16a34a),
                onTap: () => context.go('/analyze'),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _ActionButton(
                icon: '🏋️',
                label: '开始训练',
                color: Colors.blue,
                onTap: () => context.go('/workout'),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _ActionButton(
                icon: '🍎',
                label: '饮食记录',
                color: Colors.green,
                onTap: () => context.go('/nutrition'),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _ActionButton(
                icon: '🤖',
                label: 'AI 教练',
                color: Colors.purple,
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
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Text('📋', style: TextStyle(fontSize: 20)),
                const SizedBox(width: 8),
                Text(
                  '今日任务',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            _TaskItem(
              icon: '📸',
              title: '完成首次体态分析',
              completed: false,
              onTap: () => context.go('/analyze'),
            ),
            _TaskItem(
              icon: '🏋️',
              title: '今日训练',
              completed: false,
              onTap: () => context.go('/workout'),
            ),
            _TaskItem(
              icon: '🍎',
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
        Text(
          '更多功能',
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.bold,
            color: const Color(0xFF166534),
          ),
        ),
        const SizedBox(height: 12),
        Wrap(
          spacing: 12,
          runSpacing: 12,
          children: [
            _FeatureChip(
              icon: '📋',
              label: '训练方案',
              onTap: () => context.go('/plan'),
            ),
            _FeatureChip(
              icon: '📈',
              label: '进度趋势',
              onTap: () {
                _showTODOToast(context, '进度趋势功能开发中');
              },
            ),
            _FeatureChip(
              icon: '📤',
              label: '数据导出',
              onTap: () {
                _showTODOToast(context, '数据导出功能开发中');
              },
            ),
            _FeatureChip(
              icon: 'ℹ️',
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
  final String icon;
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
        padding: const EdgeInsets.all(12),
        child: Column(
          children: [
            Text(icon, style: const TextStyle(fontSize: 24)),
            const SizedBox(height: 8),
            Text(
              value,
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.bold,
                color: const Color(0xFF166534),
              ),
            ),
            Text(
              title,
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: Colors.green.shade600,
              ),
            ),
            Text(
              subtitle,
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: Colors.green.shade400,
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
  final String icon;
  final String label;
  final Color color;
  final VoidCallback onTap;

  const _ActionButton({
    required this.icon,
    required this.label,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 16),
          child: Column(
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [color, color.withValues(alpha: 0.8)],
                  ),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Center(
                  child: Text(icon, style: const TextStyle(fontSize: 24)),
                ),
              ),
              const SizedBox(height: 8),
              Text(
                label,
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  fontWeight: FontWeight.w600,
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
  final String icon;
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
        padding: const EdgeInsets.symmetric(vertical: 8),
        child: Row(
          children: [
            Text(icon, style: const TextStyle(fontSize: 20)),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                title,
                style: TextStyle(
                  color: completed ? Colors.green.shade600 : null,
                  decoration: completed ? TextDecoration.lineThrough : null,
                ),
              ),
            ),
            Icon(
              completed ? Icons.check_circle : Icons.arrow_forward_ios,
              size: 16,
              color: completed ? Colors.green : Colors.grey,
            ),
          ],
        ),
      ),
    );
  }
}

class _FeatureChip extends StatelessWidget {
  final String icon;
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
      avatar: Text(icon),
      label: Text(label),
      onPressed: onTap,
      backgroundColor: Colors.white,
      side: BorderSide(color: Colors.green.shade100),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(20),
      ),
    );
  }
}
