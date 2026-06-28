import 'package:flutter/material.dart';

import '../../models/analysis_result.dart';
import '../../theme/kb_colors.dart';

class ScoreCard extends StatelessWidget {
  final int score;
  final List<Issue> issues;

  const ScoreCard({
    super.key,
    required this.score,
    required this.issues,
  });

  Color get scoreColor {
    if (score >= 80) return KbColors.brand;
    return KbColors.accentWarn;
  }

  String get scoreLabel {
    if (score >= 90) return '优秀';
    if (score >= 80) return '良好';
    if (score >= 70) return '中等';
    if (score >= 60) return '较差';
    return '差';
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  '体态评分',
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.w600,
                    color: KbColors.brand,
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  decoration: BoxDecoration(
                    color: scoreColor.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Row(
                    children: [
                      Text(
                        score.toString(),
                        style: TextStyle(
                          fontSize: 32,
                          fontWeight: FontWeight.w600,
                          color: scoreColor,
                        ),
                      ),
                      Text(
                        '/100',
                        style: TextStyle(
                          fontSize: 16,
                          color: scoreColor.withValues(alpha: 0.7),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Align(
              alignment: Alignment.centerLeft,
              child: Text(
                scoreLabel,
                style: TextStyle(
                  color: scoreColor,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
            if (issues.isNotEmpty) ...[
              const SizedBox(height: 16),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: issues.map((issue) {
                  Color chipColor;
                  switch (issue.severity) {
                    case 'severe':
                    case 'moderate':
                      chipColor = KbColors.accentWarn;
                      break;
                    case 'mild':
                      chipColor = KbColors.brand;
                      break;
                    default:
                      // 未知 severity 用灰色，区别于 mild
                      chipColor = KbColors.text3;
                  }

                  return Chip(
                    label: Text(
                      issue.name,
                      style: TextStyle(
                        color: chipColor,
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    backgroundColor: chipColor.withValues(alpha: 0.1),
                    side: BorderSide(color: chipColor.withValues(alpha: 0.3)),
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  );
                }).toList(),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
