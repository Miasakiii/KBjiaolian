import 'dart:math';
import 'package:flutter/material.dart';

import '../../models/analysis_result.dart';

class RadarChartWidget extends StatelessWidget {
  final RadarData data;

  const RadarChartWidget({super.key, required this.data});

  static const _labels = [
    '头前伸',
    '圆肩',
    '骨盆前倾',
    '膝超伸',
    '脊柱侧弯',
    '高低肩',
    'XO型腿',
    '核心稳定',
  ];

  static const _colors = [
    Colors.orange,
    Colors.red,
    Colors.purple,
    Colors.blue,
    Colors.teal,
    Colors.indigo,
    Colors.brown,
    Colors.green,
  ];

  List<int> get _values => [
        data.headForward,
        data.roundShoulder,
        data.pelvicTilt,
        data.kneeExtension,
        data.spinalCurvature,
        data.shoulderHeight,
        data.legAlignment,
        data.coreStability,
      ];

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Text(
              '体态问题分析',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
            const SizedBox(height: 16),
            SizedBox(
              height: 280,
              width: 280,
              child: CustomPaint(
                size: const Size(280, 280),
                painter: _RadarChartPainter(data: data),
              ),
            ),
            const SizedBox(height: 12),
            _buildLegend(),
          ],
        ),
      ),
    );
  }

  Widget _buildLegend() {
    return Wrap(
      spacing: 12,
      runSpacing: 8,
      alignment: WrapAlignment.center,
      children: List.generate(_labels.length, (i) {
        return Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 10,
              height: 10,
              decoration: BoxDecoration(
                color: _colors[i],
                shape: BoxShape.circle,
              ),
            ),
            const SizedBox(width: 4),
            Text(
              '${_labels[i]} ${_values[i]}%',
              style: TextStyle(fontSize: 11, color: Colors.grey.shade700),
            ),
          ],
        );
      }),
    );
  }
}

class _RadarChartPainter extends CustomPainter {
  final RadarData data;

  static const int _axisCount = 8;

  _RadarChartPainter({required this.data});

  List<int> get _values => [
        data.headForward,
        data.roundShoulder,
        data.pelvicTilt,
        data.kneeExtension,
        data.spinalCurvature,
        data.shoulderHeight,
        data.legAlignment,
        data.coreStability,
      ];

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = min(size.width, size.height) / 2 - 30;

    _drawGrid(canvas, center, radius);
    _drawData(canvas, center, radius);
    _drawPoints(canvas, center, radius);
  }

  double _axisAngle(int index) => -pi / 2 + 2 * pi * index / _axisCount;

  void _drawGrid(Canvas canvas, Offset center, double radius) {
    final gridPaint = Paint()
      ..color = Colors.grey.shade200
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1;

    for (int ring = 1; ring <= 4; ring++) {
      final r = radius * ring / 4;
      final path = Path();
      for (int i = 0; i < _axisCount; i++) {
        final angle = _axisAngle(i);
        final point = Offset(center.dx + r * cos(angle), center.dy + r * sin(angle));
        if (i == 0) {
          path.moveTo(point.dx, point.dy);
        } else {
          path.lineTo(point.dx, point.dy);
        }
      }
      path.close();
      canvas.drawPath(path, gridPaint);
    }

    for (int i = 0; i < _axisCount; i++) {
      final angle = _axisAngle(i);
      final endPoint = Offset(
        center.dx + radius * cos(angle),
        center.dy + radius * sin(angle),
      );
      canvas.drawLine(center, endPoint, gridPaint);
    }
  }

  void _drawData(Canvas canvas, Offset center, double radius) {
    final path = Path();
    for (int i = 0; i < _axisCount; i++) {
      final angle = _axisAngle(i);
      final r = radius * (_values[i] / 100).clamp(0.0, 1.0);
      final point = Offset(center.dx + r * cos(angle), center.dy + r * sin(angle));
      if (i == 0) {
        path.moveTo(point.dx, point.dy);
      } else {
        path.lineTo(point.dx, point.dy);
      }
    }
    path.close();

    final fillPaint = Paint()
      ..color = Colors.green.withValues(alpha: 0.2)
      ..style = PaintingStyle.fill;
    canvas.drawPath(path, fillPaint);

    final strokePaint = Paint()
      ..color = Colors.green
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2;
    canvas.drawPath(path, strokePaint);
  }

  void _drawPoints(Canvas canvas, Offset center, double radius) {
    final fillPaint = Paint()
      ..color = Colors.green
      ..style = PaintingStyle.fill;
    final bgPaint = Paint()..color = Colors.white;

    for (int i = 0; i < _axisCount; i++) {
      final angle = _axisAngle(i);
      final r = radius * (_values[i] / 100).clamp(0.0, 1.0);
      final point = Offset(center.dx + r * cos(angle), center.dy + r * sin(angle));
      canvas.drawCircle(point, 6, bgPaint);
      canvas.drawCircle(point, 4, fillPaint);
    }
  }

  @override
  bool shouldRepaint(covariant _RadarChartPainter old) {
    return old.data.headForward != data.headForward ||
        old.data.roundShoulder != data.roundShoulder ||
        old.data.pelvicTilt != data.pelvicTilt ||
        old.data.kneeExtension != data.kneeExtension ||
        old.data.spinalCurvature != data.spinalCurvature ||
        old.data.shoulderHeight != data.shoulderHeight ||
        old.data.legAlignment != data.legAlignment ||
        old.data.coreStability != data.coreStability;
  }
}
