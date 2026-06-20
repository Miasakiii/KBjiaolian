import 'dart:math';
import 'package:flutter/material.dart';

import '../../models/analysis_result.dart';

class RadarChartWidget extends StatelessWidget {
  final RadarData data;

  const RadarChartWidget({super.key, required this.data});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            Text(
              '体态问题分析',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 20),
            SizedBox(
              height: 200,
              child: CustomPaint(
                size: const Size(200, 200),
                painter: _RadarChartPainter(data: data),
              ),
            ),
            const SizedBox(height: 16),
            _buildLegend(),
          ],
        ),
      ),
    );
  }

  Widget _buildLegend() {
    final items = [
      _LegendItem('头前伸', data.headForward, Colors.orange),
      _LegendItem('圆肩', data.roundShoulder, Colors.red),
      _LegendItem('骨盆前倾', data.pelvicTilt, Colors.purple),
      _LegendItem('膝超伸', data.kneeExtension, Colors.blue),
    ];

    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceAround,
      children: items.map((item) {
        return Column(
          children: [
            Text(
              '${item.value}%',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: item.color,
              ),
            ),
            Text(
              item.label,
              style: TextStyle(
                fontSize: 12,
                color: Colors.grey.shade600,
              ),
            ),
          ],
        );
      }).toList(),
    );
  }
}

class _LegendItem {
  final String label;
  final int value;
  final Color color;

  _LegendItem(this.label, this.value, this.color);
}

class _RadarChartPainter extends CustomPainter {
  final RadarData data;

  _RadarChartPainter({required this.data});

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = min(size.width, size.height) / 2 - 20;

    // 画背景网格
    _drawGrid(canvas, center, radius);

    // 画数据区域
    _drawData(canvas, center, radius);

    // 画数据点
    _drawPoints(canvas, center, radius);
  }

  void _drawGrid(Canvas canvas, Offset center, double radius) {
    final paint = Paint()
      ..color = Colors.grey.shade200
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1;

    // 画同心圆
    for (int i = 1; i <= 4; i++) {
      final r = radius * i / 4;
      canvas.drawCircle(center, r, paint);
    }

    // 画轴线
    final angles = [-pi / 2, 0, pi / 2, pi];
    for (final angle in angles) {
      final endPoint = Offset(
        center.dx + radius * cos(angle),
        center.dy + radius * sin(angle),
      );
      canvas.drawLine(center, endPoint, paint);
    }
  }

  void _drawData(Canvas canvas, Offset center, double radius) {
    final values = [
      data.headForward / 100,
      data.roundShoulder / 100,
      data.pelvicTilt / 100,
      data.kneeExtension / 100,
    ];

    final angles = [-pi / 2, 0, pi / 2, pi];
    final path = Path();

    for (int i = 0; i < values.length; i++) {
      final angle = angles[i];
      final r = radius * values[i];
      final point = Offset(
        center.dx + r * cos(angle),
        center.dy + r * sin(angle),
      );

      if (i == 0) {
        path.moveTo(point.dx, point.dy);
      } else {
        path.lineTo(point.dx, point.dy);
      }
    }

    path.close();

    // 填充
    final fillPaint = Paint()
      ..color = Colors.green.withValues(alpha: 0.2)
      ..style = PaintingStyle.fill;
    canvas.drawPath(path, fillPaint);

    // 边框
    final strokePaint = Paint()
      ..color = Colors.green
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2;
    canvas.drawPath(path, strokePaint);
  }

  void _drawPoints(Canvas canvas, Offset center, double radius) {
    final values = [
      data.headForward / 100,
      data.roundShoulder / 100,
      data.pelvicTilt / 100,
      data.kneeExtension / 100,
    ];

    final angles = [-pi / 2, 0, pi / 2, pi];
    final paint = Paint()
      ..color = Colors.green
      ..style = PaintingStyle.fill;

    for (int i = 0; i < values.length; i++) {
      final angle = angles[i];
      final r = radius * values[i];
      final point = Offset(
        center.dx + r * cos(angle),
        center.dy + r * sin(angle),
      );

      // 白色背景
      canvas.drawCircle(point, 6, Paint()..color = Colors.white);
      // 绿色点
      canvas.drawCircle(point, 4, paint);
    }
  }

  @override
  bool shouldRepaint(covariant _RadarChartPainter old) {
    // 数据未变时不重绘，避免无谓的 CPU 开销
    return old.data.headForward != data.headForward ||
        old.data.roundShoulder != data.roundShoulder ||
        old.data.pelvicTilt != data.pelvicTilt ||
        old.data.kneeExtension != data.kneeExtension;
  }
}
