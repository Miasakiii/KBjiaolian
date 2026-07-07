import 'dart:async';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../providers/auth_provider.dart';
import '../providers/analysis_provider.dart';
import '../providers/plan_provider.dart';
import '../providers/workout_provider.dart';
import '../providers/nutrition_provider.dart';
import '../providers/chat_provider.dart';
import '../services/export_service.dart';
import '../services/storage_service.dart';
import '../theme/kb_colors.dart';

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('设置'),
      ),
      body: ListView(
        children: [
          // 用户信息
          _buildUserSection(context),

          // 个人信息
          _buildSection(
            context,
            title: '个人信息',
            children: [
              _buildListTile(
                context,
                icon: Icons.person,
                title: '个人资料',
                subtitle: '昵称、性别、年龄、身高、体重',
                onTap: () {
                  context.go('/profile');
                },
              ),
              _buildListTile(
                context,
                icon: Icons.flag,
                title: '训练目标',
                subtitle: '设置训练和营养目标',
                onTap: () {
                  context.go('/goal');
                },
              ),
            ],
          ),

          // 数据管理
          _buildSection(
            context,
            title: '数据管理',
            children: [
              _buildListTile(
                context,
                icon: Icons.upload,
                title: '导出数据',
                subtitle: '导出所有数据为 JSON 或 CSV',
                onTap: () {
                  ExportService.exportData(context);
                },
              ),
              _buildListTile(
                context,
                icon: Icons.delete_forever,
                title: '清空数据',
                subtitle: '删除所有本地数据',
                onTap: () {
                  _showClearDataDialog(context);
                },
                textColor: KbColors.danger,
              ),
            ],
          ),

          // 数据管理（个人版：无登录，提供清除本地数据）
          _buildSection(
            context,
            title: '数据管理',
            children: [
              Consumer<AuthProvider>(
                builder: (context, auth, _) {
                  return _buildListTile(
                    context,
                    icon: Icons.cleaning_services,
                    title: '清除本地数据',
                    subtitle: '清空本地存储的分析/训练/饮食记录',
                    onTap: () => _showClearDataDialog(context),
                    textColor: KbColors.danger,
                  );
                },
              ),
            ],
          ),

          // 关于
          _buildSection(
            context,
            title: '关于',
            children: [
              _buildListTile(
                context,
                icon: Icons.info,
                title: '关于 KB教练',
                subtitle: '版本 1.0.0',
                onTap: () {
                  context.go('/about');
                },
              ),
              _buildListTile(
                context,
                icon: Icons.privacy_tip,
                title: '隐私政策',
                onTap: () {
                  context.go('/privacy');
                },
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildUserSection(BuildContext context) {
    return Consumer<AuthProvider>(
      builder: (context, auth, _) {
        if (!auth.isAuthenticated) {
          return const SizedBox.shrink();
        }

        return Container(
          margin: const EdgeInsets.all(16),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: KbColors.brand,
            borderRadius: BorderRadius.circular(16),
            boxShadow: [
              BoxShadow(
                color: KbColors.brand.withValues(alpha: 0.16),
                blurRadius: 12,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Row(
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Center(
                  child: Icon(Icons.person, color: Colors.white, size: 28),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      auth.nickname,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    if (auth.email != null)
                      Text(
                        auth.email!,
                        style: TextStyle(
                          color: Colors.white.withValues(alpha: 0.8),
                          fontSize: 14,
                        ),
                      ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Text(
                  '已登录',
                  style: TextStyle(color: Colors.white, fontSize: 12),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildSection(
    BuildContext context, {
    required String title,
    required List<Widget> children,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 24, 16, 8),
          child: Text(
            title,
            style: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: KbColors.brand600,
            ),
          ),
        ),
        Card(
          margin: const EdgeInsets.symmetric(horizontal: 16),
          child: Column(
            children: children,
          ),
        ),
      ],
    );
  }

  Widget _buildListTile(
    BuildContext context, {
    required IconData icon,
    required String title,
    String? subtitle,
    VoidCallback? onTap,
    Color? textColor,
  }) {
    return ListTile(
      leading: Icon(icon, color: textColor ?? KbColors.brand),
      title: Text(
        title,
        style: TextStyle(color: textColor),
      ),
      subtitle: subtitle != null ? Text(subtitle) : null,
      trailing: const Icon(Icons.chevron_right, size: 20),
      onTap: onTap,
    );
  }

  Future<void> _showClearDataDialog(BuildContext context) async {
    unawaited(showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('清空数据'),
        content: const Text('确定要删除所有本地数据吗？此操作无法撤销。'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('取消'),
          ),
          ElevatedButton(
            onPressed: () async {
              Navigator.pop(context);
              // 在 await 前获取 provider 引用，避免 await 后 context 失效
              final analysisP = context.read<AnalysisProvider>();
              final planP = context.read<PlanProvider>();
              final workoutP = context.read<WorkoutProvider>();
              final nutritionP = context.read<NutritionProvider>();
              final chatP = context.read<ChatProvider>();
              final messenger = ScaffoldMessenger.of(context);
              await StorageService.clear();
              // 重置内存中的数据，避免页面继续展示旧数据
              await analysisP.clearHistory();
              await planP.clearPlans();
              workoutP.cancelWorkout();
              nutritionP.clearError();
              await chatP.clearChat();
              // 清除导出缓存
              await ExportService.clearExportCache();
              messenger.showSnackBar(
                const SnackBar(content: Text('数据已清空')),
              );
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: KbColors.danger,
            ),
            child: const Text('确定清空'),
          ),
        ],
      ),
    ),
  );
}

}
