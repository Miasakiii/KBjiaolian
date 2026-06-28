import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../theme/kb_colors.dart';

class StatCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final String value;
  final String subtitle;

  const StatCard({
    super.key,
    required this.icon,
    required this.title,
    required this.value,
    required this.subtitle,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          children: [
            Icon(icon, size: 24, color: KbColors.brand),
            const SizedBox(height: 10),
            Text(
              value,
              style: const TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.w600,
                color: KbColors.text1,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              title,
              style: const TextStyle(
                fontSize: 12,
                color: KbColors.brand,
                fontWeight: FontWeight.w400,
              ),
            ),
            Text(
              subtitle,
              style: const TextStyle(
                color: KbColors.text3,
                fontSize: 10,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
