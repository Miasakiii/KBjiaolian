import 'dart:convert';
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:path_provider/path_provider.dart';
import 'package:provider/provider.dart';
import 'package:share_plus/share_plus.dart';

import '../providers/auth_provider.dart';
import '../providers/analysis_provider.dart';
import '../providers/plan_provider.dart';
import '../providers/workout_provider.dart';
import '../providers/nutrition_provider.dart';
import '../providers/chat_provider.dart';
import '../services/storage_service.dart';

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
                  _exportData(context);
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
                textColor: Colors.red,
              ),
            ],
          ),

          // 账号
          _buildSection(
            context,
            title: '账号',
            children: [
              Consumer<AuthProvider>(
                builder: (context, auth, _) {
                  if (auth.isAuthenticated) {
                    return _buildListTile(
                      context,
                      icon: Icons.logout,
                      title: '退出登录',
                      subtitle: auth.email,
                      onTap: () => _showLogoutDialog(context, auth),
                      textColor: Colors.red,
                    );
                  } else {
                    return _buildListTile(
                      context,
                      icon: Icons.login,
                      title: '登录 / 注册',
                      subtitle: '同步数据到云端',
                      onTap: () => context.go('/login'),
                    );
                  }
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
                      auth.nickname ?? '用户',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
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
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: Colors.green.shade700,
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
      leading: Icon(icon, color: textColor ?? Colors.green),
      title: Text(
        title,
        style: TextStyle(color: textColor),
      ),
      subtitle: subtitle != null ? Text(subtitle) : null,
      trailing: const Icon(Icons.chevron_right, size: 20),
      onTap: onTap,
    );
  }

  Future<void> _exportData(BuildContext context) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('导出数据'),
        content: const Text('将导出所有分析记录、训练方案、训练记录和饮食记录为 JSON 文件。'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('取消'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('导出'),
          ),
        ],
      ),
    );

    if (confirmed != true || !context.mounted) return;

    final messenger = ScaffoldMessenger.of(context);
    messenger.showSnackBar(
      const SnackBar(content: Text('正在准备导出数据...')),
    );

    try {
      final analysis = context.read<AnalysisProvider>().history;
      final plans = context.read<PlanProvider>().plans;
      final workouts = context.read<WorkoutProvider>().records;
      final nutrition = context.read<NutritionProvider>().records;

      final exportData = {
        'exportedAt': DateTime.now().toIso8601String(),
        'analysisRecords': analysis,
        'plans': plans.map((p) => p.toJson()).toList(),
        'workoutRecords': workouts.map((w) => w.toJson()).toList(),
        'nutritionRecords': nutrition.map((n) => n.toJson()).toList(),
      };

      final jsonString = const JsonEncoder.withIndent('  ').convert(exportData);

      final dir = await getTemporaryDirectory();
      final fileName =
          'kb_coach_export_${DateTime.now().millisecondsSinceEpoch}.json';
      final file = File('${dir.path}/$fileName');
      await file.writeAsString(jsonString);

      await Share.shareXFiles(
        [XFile(file.path)],
        text: 'KB教练数据导出',
      );
    } catch (e) {
      messenger.showSnackBar(
        SnackBar(content: Text('导出失败: $e')),
      );
    }
  }

  void _showClearDataDialog(BuildContext context) {
    showDialog(
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
              await StorageService.clear();
              // 重置内存中的数据，避免页面继续展示旧数据
              if (!context.mounted) return;
              context.read<AnalysisProvider>().clearHistory();
              context.read<PlanProvider>().clearPlans();
              context.read<WorkoutProvider>().cancelWorkout();
              context.read<NutritionProvider>().clearError();
              context.read<ChatProvider>().clearChat();
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('数据已清空')),
              );
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red,
            ),
            child: const Text('确定清空'),
          ),
        ],
      ),
    );
  }

  void _showLogoutDialog(BuildContext context, AuthProvider auth) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('退出登录'),
        content: const Text('确定要退出登录吗？'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('取消'),
          ),
          ElevatedButton(
            onPressed: () async {
              Navigator.pop(context);
              await auth.logout();
              if (context.mounted) {
                context.go('/login');
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red,
            ),
            child: const Text('退出'),
          ),
        ],
      ),
    );
  }
}
