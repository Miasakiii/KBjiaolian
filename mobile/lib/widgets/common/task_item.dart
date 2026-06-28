import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../theme/kb_colors.dart';

class TaskItem extends StatelessWidget {
  final IconData icon;
  final String title;
  final bool completed;
  final VoidCallback onTap;

  const TaskItem({
    super.key,
    required this.icon,
    required this.title,
    required this.completed,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 10),
        child: Row(
          children: [
            Icon(
              icon,
              size: 18,
              color: completed ? KbColors.brand : KbColors.text3,
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                title,
                style: TextStyle(
                  fontSize: 14,
                  color: completed ? KbColors.brand : KbColors.text1,
                  decoration: completed ? TextDecoration.lineThrough : null,
                  fontWeight: FontWeight.w400,
                ),
              ),
            ),
            Icon(
              completed ? Icons.check_circle : Icons.arrow_forward_ios,
              size: 16,
              color: completed ? KbColors.brand : KbColors.line,
            ),
          ],
        ),
      ),
    );
  }
}
