import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../theme/kb_colors.dart';

/// 训练完成总结页 — 替代原 workout_screen 内的 Dialog
class WorkoutCompleteScreen extends StatelessWidget {
  final int durationMinutes;
  final int totalExercises;
  final int totalSets;
 final int rating;

  const WorkoutCompleteScreen({
    super.key,
    required this.durationMinutes,
    required this.totalExercises,
    required this.totalSets,
    required this.rating,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            children: [
              const Spacer(),
              // 成功图标
              Container(
                width: 88,
                height: 88,
                decoration: const BoxDecoration(
                  color: KbColors.brandSoft,
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.check_circle,
                    size: 56, color: KbColors.brand,),
              ),
              const SizedBox(height: 24),
              const Text(
                '训练完成！',
                style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.w600,
                  color: KbColors.text1,
                ),
              ),
              const SizedBox(height: 8),
              const Text('保持节奏，明天继续',
                  style: TextStyle(color: KbColors.text2),),
              const SizedBox(height: 32),
              // 统计卡片
              Row(
                children: [
                  _buildStat('训练时长', '$durationMinutes 分钟'),
                  const SizedBox(width: 12),
                  _buildStat('完成动作', '$totalExercises 个'),
                  const SizedBox(width: 12),
                  _buildStat('总组数', '$totalSets 组'),
                ],
              ),
              const SizedBox(height: 24),
              // 评分
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(
                  5,
                  (i) => Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 4),
                    child: Icon(
                      i < rating ? Icons.star : Icons.star_border,
                      size: 36,
                      color: i < rating ? KbColors.accentWarn : KbColors.line,
                    ),
                  ),
                ),
              ),
              const Spacer(),
              // 操作按钮
              ElevatedButton(
                onPressed: () => context.go('/'),
                style: ElevatedButton.styleFrom(
                  minimumSize: const Size.fromHeight(48),
                ),
                child: const Text('返回首页'),
              ),
              const SizedBox(height: 12),
              OutlinedButton(
                onPressed: () => context.go('/recovery'),
                child: const Text('查看恢复状态'),
              ),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStat(String label, String value) {
    return Expanded(
      child: Card(
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 16),
          child: Column(
            children: [
              Text(value,
                  style: const TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.w600,
                      color: KbColors.brand,),),
              const SizedBox(height: 4),
              Text(label,
                  style: const TextStyle(color: KbColors.text3, fontSize: 12),),
            ],
          ),
        ),
      ),
    );
  }
}
