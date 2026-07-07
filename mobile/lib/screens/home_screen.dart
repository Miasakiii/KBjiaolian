import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../providers/analysis_provider.dart';
import '../providers/workout_provider.dart';
import '../providers/nutrition_provider.dart';
import '../providers/auth_provider.dart';
import '../services/export_service.dart';
import '../theme/kb_colors.dart';
import '../widgets/common/stat_card.dart';
import '../widgets/common/action_button.dart';
import '../widgets/common/task_item.dart';
import '../widgets/common/feature_chip.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  @override
  void initState() {
    super.initState();
  }

  Future<void> _refresh() async {
    // 个人版：无云端数据，刷新仅触发 provider 重新加载本地数据
    setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: _refresh,
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildHeader(context),
                const SizedBox(height: 20),
                _buildProfileReminder(context),
                const SizedBox(height: 28),
                _buildStats(context),
                const SizedBox(height: 28),
                _buildLocalBadge(context),
                const SizedBox(height: 28),
                _buildQuickActions(context),
                const SizedBox(height: 28),
                _buildTodayTasks(context),
                const SizedBox(height: 28),
                _buildMoreFeatures(context),
              ],
            ),
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
          child: Consumer<AuthProvider>(
            builder: (context, auth, _) {
              final name = auth.nickname.isNotEmpty ? auth.nickname : '用户';
              return Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    '$greeting，$name！',
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
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildProfileReminder(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final user = auth.user;
    // 关键字段（年龄/性别/身高/体重）任一已填则视为已完善
    final hasProfile = user != null &&
        ((user['age'] != null) ||
            (user['height'] != null) ||
            (user['weight'] != null) ||
            (user['gender'] != null && user['gender'].toString().isNotEmpty));
    if (hasProfile) return const SizedBox.shrink();

    return Container(
      margin: const EdgeInsets.only(bottom: 4),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: KbColors.brandSoft,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: KbColors.brand, width: 1),
      ),
      child: Row(
        children: [
          const Icon(Icons.person_outline_rounded, color: KbColors.brand, size: 28),
          const SizedBox(width: 12),
          const Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '完善个人资料',
                  style: TextStyle(fontWeight: FontWeight.w600, color: KbColors.brand, fontSize: 14),
                ),
                SizedBox(height: 2),
                Text(
                  '年龄/性别/身高/体重是 AI 个性化建议的重要参考',
                  style: TextStyle(fontSize: 12, color: KbColors.text2),
                ),
              ],
            ),
          ),
          TextButton(
            onPressed: () => context.go('/profile'),
            style: TextButton.styleFrom(
              foregroundColor: KbColors.brand,
              padding: const EdgeInsets.symmetric(horizontal: 12),
            ),
            child: const Text('去填写', style: TextStyle(fontWeight: FontWeight.w600)),
          ),
        ],
      ),
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

  Widget _buildLocalBadge(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            Container(
              width: 36,
              height: 36,
              decoration: BoxDecoration(
                color: KbColors.brand.withValues(alpha: 0.12),
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Icon(
                Icons.verified_user,
                size: 20,
                color: KbColors.brand,
              ),
            ),
            const SizedBox(width: 12),
            const Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    '本地版 · 不限量',
                    style: TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w600,
                      color: KbColors.text1,
                    ),
                  ),
                  SizedBox(height: 2),
                  Text(
                    '数据保存在本机，AI 直连模型，无配额限制',
                    style: TextStyle(fontSize: 12, color: KbColors.text2),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
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
    // 动态计算今日任务完成状态：基于各 Provider 真实数据
    return Consumer4<AnalysisProvider, WorkoutProvider, NutritionProvider, AuthProvider>(
      builder: (context, analysis, workout, nutrition, auth, _) {
        final analyzedToday = analysis.hasAnalyzedToday;
        final workoutActive = workout.isWorkoutActive;
        final hasTodayWorkout = workout.hasWorkoutToday;
        final hasTodayNutrition =
            ((nutrition.todayNutrition['recordCount'] as num?)?.toInt() ?? 0) > 0;
        final hasAnalysis = analysis.latestScore != null;

        final tasks = <TaskItem>[
          TaskItem(
            icon: Icons.camera_alt,
            title: hasAnalysis ? '再次体态分析' : '完成首次体态分析',
            completed: analyzedToday,
            onTap: () => context.go('/analyze'),
          ),
          TaskItem(
            icon: Icons.sports_gymnastics,
            title: workoutActive ? '训练进行中' : (hasTodayWorkout ? '今日已训练' : '今日训练'),
            completed: hasTodayWorkout,
            onTap: () => context.go('/workout'),
          ),
          TaskItem(
            icon: Icons.restaurant,
            title: hasTodayNutrition ? '今日饮食已记录' : '记录今日饮食',
            completed: hasTodayNutrition,
            onTap: () => context.go('/nutrition'),
          ),
        ];

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
                ...tasks,
              ],
            ),
          ),
        );
      },
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
              icon: Icons.library_books,
              label: '动作库',
              onTap: () => context.go('/exercises'),
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
            // 私人版：隐藏"升级 Pro"快捷入口
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
