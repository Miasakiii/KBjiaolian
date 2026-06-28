import 'package:flutter/material.dart';
import '../../theme/kb_colors.dart';
import '../../theme/kb_spacing.dart';

/// 评分展示 — 对应 miniprogram kb-score (spec §4.2)
class ScoreWidget extends StatelessWidget {
  final num value; // 可传 '--' 时用 ScoreWidget.placeholder
  final String label;
  final num delta; // 0 不显示
  final ScoreVariant variant;
  final String level;

  const ScoreWidget({
    super.key,
    required this.value,
    this.label = '综合评分',
    this.delta = 0,
    this.variant = ScoreVariant.plain,
    this.level = '',
  });

  @override
  Widget build(BuildContext context) {
    final deltaStr = delta == 0
        ? null
        : '${delta > 0 ? '↑ +' : '↓ '}${delta.abs()} 较上次';
    final deltaColor = delta > 0 ? KbColors.brand : KbColors.accentWarn;

    if (variant == ScoreVariant.ring) {
      return Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          _ring(value.toDouble()),
          const SizedBox(width: KbSpacing.sp3),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _label(),
              if (level.isNotEmpty)
                Text(level, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w600, color: KbColors.text1)),
              if (deltaStr != null)
                Text(deltaStr, style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: deltaColor)),
            ],
          ),
        ],
      );
    }
    // plain
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _label(),
        const SizedBox(height: 4),
        Row(
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Text('$value', style: const TextStyle(fontSize: 48, fontWeight: FontWeight.w600, color: KbColors.brand, height: 1)),
            const SizedBox(width: 6),
            const Padding(
              padding: EdgeInsets.only(bottom: 6),
              child: Text('分', style: TextStyle(fontSize: 18, color: KbColors.text3)),
            ),
          ],
        ),
        if (deltaStr != null)
          Padding(
            padding: const EdgeInsets.only(top: 4),
            child: Text(deltaStr, style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: deltaColor)),
          ),
        const SizedBox(height: 8),
        ClipRRect(
          borderRadius: BorderRadius.circular(2),
          child: LinearProgressIndicator(
            value: (value.toDouble() / 100).clamp(0.0, 1.0),
            minHeight: 4,
            backgroundColor: KbColors.lineSoft,
            valueColor: const AlwaysStoppedAnimation(KbColors.brand),
          ),
        ),
      ],
    );
  }

  Widget _label() => Text(label,
      style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: KbColors.text3, letterSpacing: 0.5));

  Widget _ring(double v) {
    return SizedBox(
      width: 80, height: 80,
      child: Stack(
        alignment: Alignment.center,
        children: [
          CircularProgressIndicator(
            value: (v / 100).clamp(0.0, 1.0),
            strokeWidth: 6,
            backgroundColor: KbColors.line,
            valueColor: const AlwaysStoppedAnimation(KbColors.brand),
          ),
          Text('${v.toInt()}', style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w600, color: KbColors.brand)),
        ],
      ),
    );
  }
}

enum ScoreVariant { plain, ring }
