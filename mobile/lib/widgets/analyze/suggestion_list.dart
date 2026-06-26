import 'package:flutter/material.dart';

import '../../models/analysis_result.dart';
import '../../theme/kb_colors.dart';
import '../../theme/kb_spacing.dart';

class SuggestionList extends StatelessWidget {
  final List<Suggestion> suggestions;

  const SuggestionList({super.key, required this.suggestions});

  @override
  Widget build(BuildContext context) {
    if (suggestions.isEmpty) {
      return const SizedBox.shrink();
    }

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(Icons.lightbulb_outline, size: 20, color: KbColors.brand),
                const SizedBox(width: 8),
                Text(
                  '改善建议',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            ...suggestions.asMap().entries.map((entry) {
              return _SuggestionItem(
                index: entry.key + 1,
                suggestion: entry.value,
              );
            }),
          ],
        ),
      ),
    );
  }
}

class _SuggestionItem extends StatelessWidget {
  final int index;
  final Suggestion suggestion;

  const _SuggestionItem({
    required this.index,
    required this.suggestion,
  });

  Color get difficultyColor {
    switch (suggestion.difficulty) {
      case '高级':
        return KbColors.accentWarn;
      case '中级':
        return KbColors.brand600;
      default:
        return KbColors.brand;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: KbColors.brandSoft,
        borderRadius: BorderRadius.circular(KbSpacing.radiusSm),
        border: Border.all(color: KbColors.lineSoft),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 28,
                height: 28,
                decoration: BoxDecoration(
                  color: KbColors.brand,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Center(
                  child: Text(
                    index.toString(),
                    style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.w600,
                      fontSize: 14,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      suggestion.exercise,
                      style: const TextStyle(
                        fontWeight: FontWeight.w600,
                        fontSize: 16,
                      ),
                    ),
                    Text(
                      suggestion.targetMuscle,
                      style: const TextStyle(
                        color: KbColors.text2,
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: difficultyColor.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: difficultyColor.withValues(alpha: 0.3)),
                ),
                child: Text(
                  suggestion.difficulty,
                  style: TextStyle(
                    color: difficultyColor,
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              _InfoChip(label: suggestion.sets),
              const SizedBox(width: 8),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            suggestion.description,
            style: const TextStyle(
              color: KbColors.text2,
              height: 1.5,
            ),
          ),
          if (suggestion.steps.isNotEmpty) ...[
            const SizedBox(height: 12),
            const Text(
              '训练步骤',
              style: TextStyle(
                fontWeight: FontWeight.w600,
                color: KbColors.brand600,
                fontSize: 13,
              ),
            ),
            const SizedBox(height: 8),
            ...suggestion.steps.asMap().entries.map((entry) {
              return Padding(
                padding: const EdgeInsets.only(bottom: 4),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      '${entry.key + 1}. ',
                      style: const TextStyle(
                        color: KbColors.brand,
                        fontWeight: FontWeight.w600,
                        fontSize: 13,
                      ),
                    ),
                    Expanded(
                      child: Text(
                        entry.value,
                        style: const TextStyle(fontSize: 13),
                      ),
                    ),
                  ],
                ),
              );
            }),
          ],
          if (suggestion.tips.isNotEmpty) ...[
            const SizedBox(height: 12),
            const Text(
              '训练要点',
              style: TextStyle(
                fontWeight: FontWeight.w600,
                color: KbColors.brand600,
                fontSize: 13,
              ),
            ),
            const SizedBox(height: 8),
            ...suggestion.tips.map((tip) {
              return Padding(
                padding: const EdgeInsets.only(bottom: 4),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      '• ',
                      style: TextStyle(
                        color: KbColors.brand,
                        fontSize: 13,
                      ),
                    ),
                    Expanded(
                      child: Text(
                        tip,
                        style: const TextStyle(fontSize: 13),
                      ),
                    ),
                  ],
                ),
              );
            }),
          ],
        ],
      ),
    );
  }
}

class _InfoChip extends StatelessWidget {
  final String label;

  const _InfoChip({required this.label});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: KbColors.brandSoft,
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(
        label,
        style: const TextStyle(
          color: KbColors.brand600,
          fontSize: 12,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }
}
