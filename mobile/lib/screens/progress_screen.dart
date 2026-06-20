import 'dart:math';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../providers/analysis_provider.dart';

class ProgressScreen extends StatelessWidget {
  const ProgressScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('进度趋势'),
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: Consumer<AnalysisProvider>(
        builder: (context, provider, _) {
          final history = provider.history;

          if (history.isEmpty) {
            return _buildEmptyState(context);
          }

          final scores = <int>[];
          final dates = <DateTime>[];

          for (final record in history.reversed) {
            if (record is Map) {
              final result = record['result'];
              if (result is Map && result['score'] != null) {
                scores.add((result['score'] as num).toInt());
                final ts = record['timestamp']?.toString();
                if (ts != null) {
                  dates.add(DateTime.tryParse(ts) ?? DateTime.now());
                } else {
                  dates.add(DateTime.now());
                }
              }
            }
          }

          if (scores.isEmpty) {
            return _buildEmptyState(context);
          }

          final minScore = scores.reduce(min);
          final maxScore = scores.reduce(max);
          final avgScore = scores.reduce((a, b) => a + b) / scores.length;

          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildStatCards(context, maxScore, minScore, avgScore),
                const SizedBox(height: 24),
                Text(
                  '体态评分趋势',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: const Color(0xFF166534),
                  ),
                ),
                const SizedBox(height: 12),
                _LineChart(
                  scores: scores,
                  dates: dates,
                ),
                const SizedBox(height: 16),
                Text(
                  '共 ${scores.length} 条记录',
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: Colors.grey,
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildEmptyState(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.show_chart,
            size: 80,
            color: Colors.green.shade200,
          ),
          const SizedBox(height: 16),
          Text(
            '暂无分析记录',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
              color: Colors.grey,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            '完成一次体态分析后，这里将展示你的进步趋势',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              color: Colors.grey.shade400,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 24),
          ElevatedButton.icon(
            onPressed: () => Navigator.of(context).pop(),
            icon: const Icon(Icons.camera_alt_outlined),
            label: const Text('去分析'),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF16a34a),
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(20),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatCards(
    BuildContext context,
    int maxScore,
    int minScore,
    double avgScore,
  ) {
    return Row(
      children: [
        Expanded(
          child: _StatCard(
            icon: '⬆️',
            label: '最高分',
            value: '$maxScore',
            color: const Color(0xFF16a34a),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: _StatCard(
            icon: '⬇️',
            label: '最低分',
            value: '$minScore',
            color: Colors.orange,
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: _StatCard(
            icon: '📊',
            label: '平均分',
            value: avgScore.toStringAsFixed(1),
            color: Colors.blue,
          ),
        ),
      ],
    );
  }
}

class _StatCard extends StatelessWidget {
  final String icon;
  final String label;
  final String value;
  final Color color;

  const _StatCard({
    required this.icon,
    required this.label,
    required this.value,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 8),
        child: Column(
          children: [
            Text(icon, style: const TextStyle(fontSize: 20)),
            const SizedBox(height: 8),
            Text(
              value,
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              label,
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: Colors.grey.shade600,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _LineChart extends StatelessWidget {
  final List<int> scores;
  final List<DateTime> dates;

  const _LineChart({required this.scores, required this.dates});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.only(left: 48, right: 16, top: 16, bottom: 24),
        child: SizedBox(
          height: 220,
          child: CustomPaint(
            painter: _LineChartPainter(scores: scores, dates: dates),
            size: Size.infinite,
          ),
        ),
      ),
    );
  }
}

class _LineChartPainter extends CustomPainter {
  final List<int> scores;
  final List<DateTime> dates;

  _LineChartPainter({required this.scores, required this.dates});

  @override
  void paint(Canvas canvas, Size size) {
    if (scores.isEmpty) return;

    const maxY = 100.0;
    final chartWidth = size.width;
    final chartHeight = size.height;

    final gridPaint = Paint()
      ..color = Colors.grey.shade200
      ..strokeWidth = 1;

    final linePaint = Paint()
      ..color = const Color(0xFF16a34a)
      ..strokeWidth = 2.5
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;

    final dotPaint = Paint()..color = const Color(0xFF16a34a);

    final dotBorderPaint = Paint()
      ..color = Colors.white
      ..style = PaintingStyle.fill;

    final textStyle = TextStyle(
      color: Colors.grey.shade500,
      fontSize: 10,
    );

    const yLabels = ['0', '25', '50', '75', '100'];
    const yValues = [0.0, 25.0, 50.0, 75.0, 100.0];

    for (var i = 0; i < yValues.length; i++) {
      final y = chartHeight - (yValues[i] / maxY) * chartHeight;
      canvas.drawLine(
        Offset(0, y),
        Offset(chartWidth, y),
        gridPaint,
      );

      final tp = TextPainter(
        text: TextSpan(text: yLabels[i], style: textStyle),
        textDirection: TextDirection.ltr,
      )..layout();
      tp.paint(canvas, Offset(-tp.width - 8, y - tp.height / 2));
    }

    if (scores.length == 1) {
      final cx = chartWidth / 2;
      final cy = chartHeight - (scores[0] / maxY) * chartHeight;
      canvas.drawCircle(Offset(cx, cy), 6, dotBorderPaint);
      canvas.drawCircle(Offset(cx, cy), 4, dotPaint);
      return;
    }

    final stepX = chartWidth / (scores.length - 1);
    final points = <Offset>[];
    for (var i = 0; i < scores.length; i++) {
      final x = i * stepX;
      final y = chartHeight - (scores[i] / maxY) * chartHeight;
      points.add(Offset(x, y));
    }

    final path = Path()..moveTo(points[0].dx, points[0].dy);
    for (var i = 1; i < points.length; i++) {
      path.lineTo(points[i].dx, points[i].dy);
    }
    canvas.drawPath(path, linePaint);

    for (final point in points) {
      canvas.drawCircle(point, 5, dotBorderPaint);
      canvas.drawCircle(point, 3.5, dotPaint);
    }

    final dateStyle = TextStyle(
      color: Colors.grey.shade400,
      fontSize: 9,
    );

    if (dates.length == scores.length) {
      final first = dates.first;
      final last = dates.last;

      String formatDate(DateTime d) => '${d.month}/${d.day}';

      final firstTp = TextPainter(
        text: TextSpan(text: formatDate(first), style: dateStyle),
        textDirection: TextDirection.ltr,
      )..layout();
      firstTp.paint(canvas, Offset(0, chartHeight + 4));

      if (points.length > 1) {
        final lastTp = TextPainter(
          text: TextSpan(text: formatDate(last), style: dateStyle),
          textDirection: TextDirection.ltr,
        )..layout();
        lastTp.paint(
          canvas,
          Offset(chartWidth - lastTp.width, chartHeight + 4),
        );
      }
    }
  }

  @override
  bool shouldRepaint(covariant _LineChartPainter oldDelegate) {
    return oldDelegate.scores != scores || oldDelegate.dates != dates;
  }
}
