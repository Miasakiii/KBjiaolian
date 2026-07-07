import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../providers/workout_provider.dart';
import '../theme/kb_colors.dart';
import '../widgets/common/empty_widget.dart';

/// 恢复追踪页 — 肌肉恢复进度 + 4 周训练热力图
/// 基于本地 workout records 计算（后端无独立 recovery 端点，训练记录已含所需数据）
class RecoveryScreen extends StatefulWidget {
  const RecoveryScreen({super.key});

  @override
  State<RecoveryScreen> createState() => _RecoveryScreenState();
}

class _RecoveryScreenState extends State<RecoveryScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('恢复追踪')),
      body: Consumer<WorkoutProvider>(
        builder: (context, provider, _) {
          if (provider.records.isEmpty) {
            return const EmptyWidget(
              icon: Icons.self_improvement,
              text: '完成训练后可查看肌肉恢复状态',
            );
          }

          return SingleChildScrollView(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildRecoveryStatus(context, provider),
                const SizedBox(height: 24),
                _buildHeatmap(context, provider),
                const SizedBox(height: 24),
                _buildAdvice(context, provider),
              ],
            ),
          );
        },
      ),
    );
  }

  /// 肌群恢复状态：基于最近训练日期推算恢复进度
  /// 简化模型：训练后 48 小时完全恢复，未恢复时按时间线性递增
  Widget _buildRecoveryStatus(BuildContext context, WorkoutProvider provider) {
    final muscleGroups = _calcMuscleRecovery(provider);
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Row(
              children: [
                Icon(Icons.healing, size: 20, color: KbColors.brand),
                SizedBox(width: 8),
                Text('肌群恢复进度',
                    style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: KbColors.text1,),),
              ],
            ),
            const SizedBox(height: 16),
            ...muscleGroups.map((m) => Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(m.name, style: const TextStyle(fontSize: 13, color: KbColors.text2)),
                          Text('${m.recoveryPercent}%',
                              style: TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w600,
                                  color: m.recoveryPercent >= 100
                                      ? KbColors.brand
                                      : KbColors.accentWarn,),),
                        ],
                      ),
                      const SizedBox(height: 4),
                      ClipRRect(
                        borderRadius: BorderRadius.circular(2),
                        child: LinearProgressIndicator(
                          value: (m.recoveryPercent / 100).clamp(0.0, 1.0),
                          minHeight: 4,
                          backgroundColor: KbColors.lineSoft,
                          valueColor: AlwaysStoppedAnimation(
                            m.recoveryPercent >= 100 ? KbColors.brand : KbColors.accentWarn,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),),
          ],
        ),
      ),
    );
  }

  /// 4 周训练热力图：7x4 网格，颜色深浅表示当日训练强度
  Widget _buildHeatmap(BuildContext context, WorkoutProvider provider) {
    final heatmap = _buildHeatmapData(provider);
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Row(
              children: [
                Icon(Icons.calendar_month, size: 20, color: KbColors.brand),
                SizedBox(width: 8),
                Text('4 周训练热力图',
                    style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: KbColors.text1,),),
              ],
            ),
            const SizedBox(height: 16),
            // 周标签
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: ['一', '二', '三', '四', '五', '六', '日']
                  .map((d) => Text(d, style: const TextStyle(color: KbColors.text3, fontSize: 11)))
                  .toList(),
            ),
            const SizedBox(height: 8),
            // 4 行 x 7 列网格
            ...heatmap.map((week) => Padding(
                  padding: const EdgeInsets.only(bottom: 6),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: week
                        .map((cell) => Container(
                              width: 36,
                              height: 36,
                              decoration: BoxDecoration(
                                color: cell > 0
                                    ? KbColors.brand.withValues(alpha: 0.3 + 0.7 * (cell / 3).clamp(0.0, 1.0))
                                    : KbColors.surface2,
                                        borderRadius: BorderRadius.circular(6),
                              ),
                              alignment: Alignment.center,
                              child: cell > 0
                                  ? Text('$cell',
                                      style: const TextStyle(
                                          fontSize: 11, color: Colors.white,),)
                                  : null,
                            ),)
                        .toList(),
                  ),
                ),),
            const SizedBox(height: 8),
            // 图例
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                const Text('少', style: TextStyle(color: KbColors.text3, fontSize: 11)),
                const SizedBox(width: 4),
                ...List.generate(4, (i) => Container(
                      margin: const EdgeInsets.symmetric(horizontal: 2),
                      width: 12,
                      height: 12,
                      decoration: BoxDecoration(
                        color: KbColors.brand
                            .withValues(alpha: 0.3 + 0.233 * i),
                        borderRadius: BorderRadius.circular(3),
                      ),
                    ),),
                const SizedBox(width: 4),
                const Text('多', style: TextStyle(color: KbColors.text3, fontSize: 11)),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAdvice(BuildContext context, WorkoutProvider provider) {
    final today = _calcMuscleRecovery(provider);
    final unrecovered = today.where((m) => m.recoveryPercent < 100).toList();
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Row(
              children: [
                Icon(Icons.tips_and_updates, size: 20, color: KbColors.brand),
                SizedBox(width: 8),
                Text('今日建议',
                    style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: KbColors.text1,),),
              ],
            ),
            const SizedBox(height: 12),
            if (unrecovered.isEmpty)
              const Text('所有肌群已充分恢复，可以安排全身训练',
                  style: TextStyle(color: KbColors.text2, height: 1.6),)
            else ...[
              const Text('以下肌群尚未完全恢复：',
                  style: TextStyle(color: KbColors.text2),),
              const SizedBox(height: 8),
              ...unrecovered.map((m) => Padding(
                    padding: const EdgeInsets.only(bottom: 4),
                    child: Row(
                      children: [
                        const Icon(Icons.circle, size: 6, color: KbColors.accentWarn),
                        const SizedBox(width: 8),
                        Text('${m.name}：${m.recoveryPercent}% 恢复',
                            style: const TextStyle(color: KbColors.text2, fontSize: 13),),
                      ],
                    ),
                  ),),
              const SizedBox(height: 8),
              const Text('建议避开上述肌群或安排主动恢复',
                  style: TextStyle(color: KbColors.text3, fontSize: 12),),
            ],
          ],
        ),
      ),
    );
  }

  /// 计算各肌群恢复状态
  List<_MuscleRecovery> _calcMuscleRecovery(WorkoutProvider provider) {
    // 收集最近 7 天每个肌群的最后训练时间
    final now = DateTime.now();
    final weekAgo = now.subtract(const Duration(days: 7));
    final muscleLastTrained = <String, DateTime>{};

    for (final r in provider.records) {
      final date = DateTime.tryParse(r.createdAt);
      if (date == null || date.isBefore(weekAgo)) continue;
      final exercises = r.exercises as List? ?? [];
      for (final ex in exercises) {
        if (ex is Map) {
          final muscle = ex['targetMuscle']?.toString() ?? '其他';
          final prev = muscleLastTrained[muscle];
          if (prev == null || date.isAfter(prev)) {
            muscleLastTrained[muscle] = date;
          }
        }
      }
    }

    // 默认肌群列表（若本周有训练则覆盖）
    const defaultMuscles = ['胸部', '背部', '腿部', '肩部', '核心', '手臂'];
    final muscles = <_MuscleRecovery>[];
    for (final m in defaultMuscles) {
      final last = muscleLastTrained[m];
      int percent;
      if (last == null) {
        percent = 100;
      } else {
        final hoursPassed = now.difference(last).inHours;
        // 48 小时完全恢复，线性插值
        percent = ((hoursPassed / 48) * 100).round().clamp(0, 100);
      }
      muscles.add(_MuscleRecovery(m, percent));
    }
    return muscles;
  }

  /// 构建 4 周热力图数据：4 行（周）x 7 列（天），值为当日训练动作数
  List<List<int>> _buildHeatmapData(WorkoutProvider provider) {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final monday = today.subtract(Duration(days: now.weekday - 1));
    final fourWeeksAgoMonday = monday.subtract(const Duration(days: 21));

    // 初始化 4x7 网格
    final grid = List.generate(4, (_) => List.filled(7, 0));

    for (final r in provider.records) {
      final date = DateTime.tryParse(r.createdAt);
      if (date == null || date.isBefore(fourWeeksAgoMonday)) continue;
      final dayDiff = date.difference(fourWeeksAgoMonday).inDays;
      if (dayDiff < 0 || dayDiff >= 28) continue;
      final week = dayDiff ~/ 7;
      final day = dayDiff % 7;
      final count = (r.exercises as List?)?.length ?? 0;
      if (week >= 0 && week < 4) grid[week][day] = grid[week][day] + count;
    }

    return grid;
  }
}

class _MuscleRecovery {
  final String name;
  final int recoveryPercent;
  const _MuscleRecovery(this.name, this.recoveryPercent);
}
