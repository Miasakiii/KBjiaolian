import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../providers/analysis_provider.dart';
import '../providers/workout_provider.dart';
import '../providers/nutrition_provider.dart';
import '../services/export_service.dart';
import '../theme/kb_colors.dart';
import '../widgets/common/stat_card.dart';
import '../widgets/common/action_button.dart';
import '../widgets/common/task_item.dart';
import '../widgets/common/feature_chip.dart';

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
            borderRadius: BorderRadius.circular(16),
            boxShadow: [
              BoxShadow(
                color: KbColors.brand.withValues(alpha: 0.16),
                blurRadius: 16,
                offset: const Offset(0, 6),
              ),
            ],
          ),
          clipBehavior: Clip.antiAlias,
          child: SvgPicture.asset(
            'assets/logo/kb-logo-v1.svg',
            width: 56,
            height: 56,
            fit: BoxFit.cover,
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
              child: StatCard(
                icon: Icons.insights,
                title: '体态评分',
                value: latestScore?.toString() ?? '--',
                subtitle: latestScore != null ? '最新评分' : '未测评',
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: StatCard(
                icon: Icons.fitness_center,
                title: '本周训练',
                value: '$weekWorkouts次',
                subtitle: '近 7 天',
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: StatCard(
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
              child: ActionButton(
                icon: Icons.camera_alt,
                label: '体态分析',
                onTap: () => context.go('/analyze'),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: ActionButton(
                icon: Icons.sports_gymnastics,
                label: '开始训练',
                onTap: () => context.go('/workout'),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: ActionButton(
                icon: Icons.restaurant_menu,
                label: '饮食记录',
                onTap: () => context.go('/nutrition'),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: ActionButton(
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
            TaskItem(
              icon: Icons.camera_alt,
              title: '完成首次体态分析',
              completed: false,
              onTap: () => context.go('/analyze'),
            ),
            TaskItem(
              icon: Icons.sports_gymnastics,
              title: '今日训练',
              completed: false,
              onTap: () => context.go('/workout'),
            ),
            TaskItem(
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
            FeatureChip(
              icon: Icons.assignment,
              label: '训练方案',
              onTap: () => context.go('/plan'),
            ),
            FeatureChip(
              icon: Icons.trending_up,
              label: '进度趋势',
              onTap: () => context.go('/progress'),
            ),
            FeatureChip(
              icon: Icons.upload_file,
              label: '数据导出',
              onTap: () => ExportService.exportData(context),
            ),
            FeatureChip(
              icon: Icons.info_outline,
              label: '关于',
              onTap: () => context.go('/about'),
            ),
          ],
        ),
      ],
    );
  }

}
