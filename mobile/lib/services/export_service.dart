import 'dart:convert';
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:path_provider/path_provider.dart';
import 'package:provider/provider.dart';
import 'package:share_plus/share_plus.dart';

import '../providers/analysis_provider.dart';
import '../providers/plan_provider.dart';
import '../providers/workout_provider.dart';
import '../providers/nutrition_provider.dart';

/// 数据导出服务，供首页和设置页共用。
class ExportService {
  /// 清除临时目录中的导出缓存文件。
  /// 应在退出登录、清空数据、个人资料保存后调用。
  static Future<void> clearExportCache() async {
    try {
      final dir = await getTemporaryDirectory();
      final tempDir = Directory(dir.path);
      await for (final entity in tempDir.list()) {
        if (entity is File &&
            entity.path.contains('kb_coach_export_')) {
          await entity.delete();
        }
      }
    } catch (e) {
      debugPrint('清除导出缓存失败: $e');
    }
  }

  /// 弹出确认对话框，确认后收集所有Provider数据，写入临时文件并分享。
  static Future<void> exportData(BuildContext context) async {
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
}
