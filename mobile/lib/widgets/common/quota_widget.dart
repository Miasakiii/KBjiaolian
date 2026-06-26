import 'package:flutter/material.dart';

import '../../theme/kb_colors.dart';
import '../../theme/kb_spacing.dart';

/// 配额条 — 对应 miniprogram kb-quota (spec §4.2)
/// 横向配额条组，teal 进度条，超量变橙
class QuotaWidget extends StatelessWidget {
  final List<QuotaItem> items;

  const QuotaWidget({super.key, required this.items});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: items.map((item) {
        final percent = item.total > 0
            ? (item.remaining / item.total).clamp(0.0, 1.0)
            : 0.0;
        final over = item.remaining > item.total;
        final barColor = over ? KbColors.accentWarn : KbColors.brand;
        return Padding(
          padding: const EdgeInsets.only(bottom: KbSpacing.sp2),
          child: Column(
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(item.label,
                      style: const TextStyle(
                          fontSize: 12, color: KbColors.text2)),
                  Text('${item.remaining} / ${item.total}',
                      style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: over ? KbColors.accentWarn : KbColors.brand)),
                ],
              ),
              const SizedBox(height: 4),
              ClipRRect(
                borderRadius: BorderRadius.circular(2),
                child: LinearProgressIndicator(
                  value: percent,
                  minHeight: 3,
                  backgroundColor: KbColors.lineSoft,
                  valueColor: AlwaysStoppedAnimation(barColor),
                ),
              ),
            ],
          ),
        );
      }).toList(),
    );
  }
}

/// 配额项数据模型
class QuotaItem {
  final String label;
  final int remaining;
  final int total;

  const QuotaItem({
    required this.label,
    required this.remaining,
    required this.total,
  });
}
