import 'package:flutter/material.dart';

import '../../models/analysis_result.dart';

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
                const Text('🎯', style: TextStyle(fontSize: 20)),
                const SizedBox(width: 8),
                Text(
                  '改善建议',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
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
        return Colors.red;
      case '中级':
        return Colors.orange;
      default:
        return Colors.green;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.green.shade50,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.green.shade100),
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
                  color: Colors.green,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Center(
                  child: Text(
                    index.toString(),
                    style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
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
                      style: TextStyle(
                        color: Colors.grey.shade600,
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
            style: TextStyle(
              color: Colors.grey.shade700,
              height: 1.5,
            ),
          ),
          if (suggestion.steps.isNotEmpty) ...[
            const SizedBox(height: 12),
            Text(
              '训练步骤',
              style: TextStyle(
                fontWeight: FontWeight.w600,
                color: Colors.green.shade800,
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
                      style: TextStyle(
                        color: Colors.green.shade600,
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
            Text(
              '训练要点',
              style: TextStyle(
                fontWeight: FontWeight.w600,
                color: Colors.green.shade800,
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
                    Text(
                      '• ',
                      style: TextStyle(
                        color: Colors.green.shade600,
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
        color: Colors.green.shade100,
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(
        label,
        style: TextStyle(
          color: Colors.green.shade700,
          fontSize: 12,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }
}
