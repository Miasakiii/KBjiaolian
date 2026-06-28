import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../theme/kb_colors.dart';

class FeatureChip extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;

  const FeatureChip({
    super.key,
    required this.icon,
    required this.label,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return ActionChip(
      avatar: Icon(icon, size: 16, color: KbColors.brand),
      label: Text(
        label,
        style: const TextStyle(
          fontSize: 13,
          fontWeight: FontWeight.w400,
          color: KbColors.text1,
        ),
      ),
      onPressed: onTap,
      backgroundColor: KbColors.surface,
      side: const BorderSide(color: KbColors.lineSoft),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(20),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 4),
    );
  }
}
