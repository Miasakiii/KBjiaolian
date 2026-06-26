import 'package:flutter/material.dart';

import '../../theme/kb_colors.dart';
import '../../theme/kb_spacing.dart';

/// 空态 — 对应 miniprogram kb-empty (spec §4.2)
/// 统一空态：图标 + 文字 + 可选 CTA 按钮
class EmptyWidget extends StatelessWidget {
  final IconData icon;
  final String text;
  final String? cta;
  final VoidCallback? onCta;

  const EmptyWidget({
    super.key,
    this.icon = Icons.info_outline,
    this.text = '暂无数据',
    this.cta,
    this.onCta,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(
            horizontal: KbSpacing.sp5, vertical: KbSpacing.sp6),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 48, color: KbColors.text3.withValues(alpha: 0.4)),
            const SizedBox(height: KbSpacing.sp3),
            Text(text,
                style: const TextStyle(
                    fontSize: 12, color: KbColors.text3)),
            if (cta != null) ...[
              const SizedBox(height: KbSpacing.sp3),
              ElevatedButton(
                onPressed: onCta,
                style: ElevatedButton.styleFrom(
                  backgroundColor: KbColors.brand,
                  foregroundColor: Colors.white,
                  padding:
                      const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
                  shape: RoundedRectangleBorder(
                    borderRadius:
                        BorderRadius.circular(KbSpacing.radiusSm),
                  ),
                ),
                child: Text(cta!,
                    style: const TextStyle(
                        fontSize: 14, fontWeight: FontWeight.w600)),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
