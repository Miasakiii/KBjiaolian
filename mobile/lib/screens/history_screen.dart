import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../providers/analysis_provider.dart';

class HistoryScreen extends StatelessWidget {
  const HistoryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('分析历史'),
        actions: [
          IconButton(
            icon: const Icon(Icons.delete_outline),
            onPressed: () {
              showDialog(
                context: context,
                builder: (context) => AlertDialog(
                  title: const Text('清空历史'),
                  content: const Text('确定要清空所有分析历史吗？'),
                  actions: [
                    TextButton(
                      onPressed: () => Navigator.pop(context),
                      child: const Text('取消'),
                    ),
                    TextButton(
                      onPressed: () {
                        context.read<AnalysisProvider>().clearHistory();
                        Navigator.pop(context);
                      },
                      child: const Text('确定'),
                    ),
                  ],
                ),
              );
            },
          ),
        ],
      ),
      body: Consumer<AnalysisProvider>(
        builder: (context, provider, _) {
          final records = provider.history;

          if (records.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text('📭', style: TextStyle(fontSize: 64, color: Colors.grey.shade300)),
                  const SizedBox(height: 16),
                  Text(
                    '暂无历史记录',
                    style: TextStyle(
                      fontSize: 18,
                      color: Colors.grey.shade600,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    '完成体态分析后，记录会自动保存',
                    style: TextStyle(color: Colors.grey.shade500),
                  ),
                ],
              ),
            );
          }

          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: records.length,
            itemBuilder: (context, index) {
              final record = records[index];
              final result = record['result'];
              final date = DateTime.parse(record['timestamp']);

              return Card(
                margin: const EdgeInsets.only(bottom: 12),
                child: ListTile(
                  leading: CircleAvatar(
                    backgroundColor: _getScoreColor(result['score']).withValues(alpha: 0.1),
                    child: Text(
                      '${result['score']}',
                      style: TextStyle(
                        color: _getScoreColor(result['score']),
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  title: Text(
                    '体态评分: ${result['score']}',
                    style: const TextStyle(fontWeight: FontWeight.w600),
                  ),
                  subtitle: Text(
                    '${date.year}/${date.month}/${date.day} ${date.hour}:${date.minute.toString().padLeft(2, '0')}',
                  ),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () {
                    _showDetail(context, result);
                  },
                ),
              );
            },
          );
        },
      ),
    );
  }

  Color _getScoreColor(int score) {
    if (score >= 80) return Colors.green;
    if (score >= 60) return Colors.orange;
    return Colors.red;
  }

  void _showDetail(BuildContext context, Map<String, dynamic> result) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (context) => DraggableScrollableSheet(
        initialChildSize: 0.7,
        maxChildSize: 0.9,
        minChildSize: 0.5,
        expand: false,
        builder: (context, scrollController) {
          return SingleChildScrollView(
            controller: scrollController,
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Center(
                  child: Container(
                    width: 40,
                    height: 4,
                    decoration: BoxDecoration(
                      color: Colors.grey.shade300,
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                ),
                const SizedBox(height: 24),

                // 评分
                Center(
                  child: Column(
                    children: [
                      Text(
                        '${result['score']}',
                        style: TextStyle(
                          fontSize: 64,
                          fontWeight: FontWeight.bold,
                          color: _getScoreColor(result['score']),
                        ),
                      ),
                      Text(
                        '体态评分',
                        style: TextStyle(
                          fontSize: 18,
                          color: Colors.grey.shade600,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),

                // 总结
                if (result['summary'] != null && result['summary'].isNotEmpty) ...[
                  Text(
                    '分析总结',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(result['summary']),
                  const SizedBox(height: 24),
                ],

                // 问题
                if (result['issues'] != null) ...[
                  Text(
                    '体态问题',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: (result['issues'] as List).map((issue) {
                      return Chip(
                        label: Text(issue['name']),
                        backgroundColor: Colors.orange.shade50,
                      );
                    }).toList(),
                  ),
                ],
              ],
            ),
          );
        },
      ),
    );
  }
}
