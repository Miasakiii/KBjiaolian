import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../providers/analysis_provider.dart';
import '../services/api_service.dart';

class CompareScreen extends StatefulWidget {
  const CompareScreen({super.key});

  @override
  State<CompareScreen> createState() => _CompareScreenState();
}

class _CompareScreenState extends State<CompareScreen> {
  Map<String, dynamic>? _beforeRecord;
  Map<String, dynamic>? _afterRecord;
  bool _loading = false;
  Map<String, dynamic>? _result;

  void _pickRecord({required bool isBefore}) {
    final history = context.read<AnalysisProvider>().history;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (context) => DraggableScrollableSheet(
        initialChildSize: 0.6,
        maxChildSize: 0.9,
        minChildSize: 0.4,
        expand: false,
        builder: (context, scrollController) {
          return Column(
            children: [
              const SizedBox(height: 12),
              Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: Colors.grey.shade300,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              const SizedBox(height: 16),
              Text(
                isBefore ? '选择"之前"的记录' : '选择"之后"的记录',
                style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              Expanded(
                child: history.isEmpty
                    ? const Center(child: Text('暂无历史记录'))
                    : ListView.builder(
                        controller: scrollController,
                        itemCount: history.length,
                        itemBuilder: (context, index) {
                          final record = history[index];
                          final rawResult = record['result'];
                          final result = rawResult is Map
                              ? Map<String, dynamic>.from(rawResult)
                              : <String, dynamic>{};
                          final date = DateTime.tryParse(
                                  record['timestamp']?.toString() ?? '') ??
                              DateTime.now();
                          final score = (result['score'] is num)
                              ? (result['score'] as num).toInt()
                              : 0;

                          return ListTile(
                            leading: CircleAvatar(
                              backgroundColor:
                                  _getScoreColor(score).withValues(alpha: 0.1),
                              child: Text(
                                '$score',
                                style: TextStyle(
                                  color: _getScoreColor(score),
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                            title: Text('体态评分: $score'),
                            subtitle: Text(
                              '${date.year}/${date.month}/${date.day} ${date.hour}:${date.minute.toString().padLeft(2, '0')}',
                            ),
                            onTap: () {
                              Navigator.pop(context);
                              setState(() {
                                if (isBefore) {
                                  _beforeRecord = Map<String, dynamic>.from(record);
                                } else {
                                  _afterRecord = Map<String, dynamic>.from(record);
                                }
                                _result = null;
                              });
                            },
                          );
                        },
                      ),
              ),
            ],
          );
        },
      ),
    );
  }

  Future<void> _doCompare() async {
    if (_beforeRecord == null || _afterRecord == null) return;

    final beforeId = _beforeRecord!['id']?.toString();
    final afterId = _afterRecord!['id']?.toString();
    if (beforeId == null || afterId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('记录缺少ID，无法对比')),
      );
      return;
    }

    setState(() => _loading = true);
    try {
      final result = await ApiService.compareAnalysis(
        beforeId: beforeId,
        afterId: afterId,
      );
      setState(() => _result = result);
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('对比失败: $e')),
      );
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Color _getScoreColor(int score) {
    if (score >= 80) return Colors.green;
    if (score >= 60) return Colors.orange;
    return Colors.red;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('前后对比'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            _buildPickCard(
              label: '之前',
              record: _beforeRecord,
              onTap: () => _pickRecord(isBefore: true),
            ),
            const SizedBox(height: 12),
            _buildPickCard(
              label: '之后',
              record: _afterRecord,
              onTap: () => _pickRecord(isBefore: false),
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: (_beforeRecord != null && _afterRecord != null && !_loading)
                    ? _doCompare
                    : null,
                icon: _loading
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                      )
                    : const Icon(Icons.compare_arrows),
                label: Text(_loading ? '对比中...' : '开始对比'),
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 14),
                ),
              ),
            ),
            if (_result != null) ...[
              const SizedBox(height: 24),
              _buildResultSection(),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildPickCard({
    required String label,
    required Map<String, dynamic>? record,
    required VoidCallback onTap,
  }) {
    final rawResult = record?['result'];
    final result =
        rawResult is Map ? Map<String, dynamic>.from(rawResult) : <String, dynamic>{};
    final score = (result['score'] is num) ? (result['score'] as num).toInt() : 0;
    final date = DateTime.tryParse(record?['timestamp']?.toString() ?? '');

    return Card(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: record != null
                      ? _getScoreColor(score).withValues(alpha: 0.1)
                      : Colors.grey.shade100,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Center(
                  child: record != null
                      ? Text(
                          '$score',
                          style: TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                            color: _getScoreColor(score),
                          ),
                        )
                      : Icon(Icons.add, color: Colors.grey.shade400),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      label,
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.grey.shade500,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      record != null
                          ? (date != null
                              ? '${date.year}/${date.month}/${date.day} ${date.hour}:${date.minute.toString().padLeft(2, '0')}'
                              : '已选择')
                          : '点击选择记录',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: record != null ? null : Colors.grey.shade400,
                      ),
                    ),
                  ],
                ),
              ),
              Icon(Icons.chevron_right, color: Colors.grey.shade400),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildResultSection() {
    final summary = _result!['summary']?.toString();
    final changes = _result!['changes'];
    final changesList = (changes is List) ? changes : [];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (summary != null && summary.isNotEmpty) ...[
          Text(
            '对比总结',
            style: Theme.of(context)
                .textTheme
                .titleMedium
                ?.copyWith(fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.blue.shade50,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Text(summary),
          ),
          const SizedBox(height: 24),
        ],
        if (changesList.isNotEmpty) ...[
          Text(
            '变化详情',
            style: Theme.of(context)
                .textTheme
                .titleMedium
                ?.copyWith(fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          ...changesList.whereType<Map>().map((change) {
            final direction = change['direction']?.toString() ?? '';
            final text = change['text']?.toString() ?? change['description']?.toString() ?? '';
            final isPositive = direction == 'better' || direction == 'improved';
            final isNegative = direction == 'worse' || direction == 'declined';

            return Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Icon(
                    isPositive
                        ? Icons.arrow_upward
                        : isNegative
                            ? Icons.arrow_downward
                            : Icons.remove,
                    size: 20,
                    color: isPositive
                        ? Colors.green
                        : isNegative
                            ? Colors.red
                            : Colors.grey,
                  ),
                  const SizedBox(width: 8),
                  Expanded(child: Text(text)),
                ],
              ),
            );
          }),
        ],
      ],
    );
  }
}
