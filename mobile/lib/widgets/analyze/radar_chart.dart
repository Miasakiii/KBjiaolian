import 'dart:math';
import 'package:flutter/material.dart';

import '../../models/analysis_result.dart';
import '../../theme/kb_colors.dart';

/// 8 维体态雷达图 — 与 miniprogram kb-radar 对齐 (spec §5)
class RadarChartWidget extends StatelessWidget {
  final RadarData data;

  /// compare 模式: 上次数据。非 null 时绘制双层 (上次灰虚线 + 本次 teal)
  final RadarData? prevData;

  /// result 模式高亮最低分维度(橙色环)。compare 模式忽略。
  final bool highlightProblem;

  final bool showLegend;

  const RadarChartWidget({
    super.key,
    required this.data,
    this.prevData,
    this.highlightProblem = true,
    this.showLegend = true,
  });

  /// compare 构造: 双层对比
  factory RadarChartWidget.compare({
    Key? key,
    required RadarData data,
    required RadarData prevData,
    bool showLegend = true,
  }) {
    return RadarChartWidget(
      key: key,
      data: data,
      prevData: prevData,
      highlightProblem: false,
      showLegend: showLegend,
    );
  }

  static const _labels = [
    '头前伸', '圆肩', '骨盆前倾', '膝超伸',
    '脊柱侧弯', '高低肩', 'XO型腿', '核心稳定',
  ];

  List<int> get _values => [
        data.headForward, data.roundShoulder, data.pelvicTilt, data.kneeExtension,
        data.spinalCurvature, data.shoulderHeight, data.legAlignment, data.coreStability,
      ];

  int get _minIndex {
    int idx = 0;
    for (int i = 1; i < _values.length; i++) {
      if (_values[i] < _values[idx]) idx = i;
    }
    return idx;
  }

  @override
  Widget build(BuildContext context) {
    final isCompare = prevData != null;
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Text(
              isCompare ? '维度对比' : '体态问题分析',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 16),
            SizedBox(
              height: 280, width: 280,
              child: CustomPaint(
                size: const Size(280, 280),
                painter: _RadarChartPainter(
                  data: data,
                  prevData: prevData,
                  highlightProblem: highlightProblem,
                  minIndex: _minIndex,
                ),
              ),
            ),
            const SizedBox(height: 12),
            if (showLegend) _buildLegend(context, isCompare),
          ],
        ),
      ),
    );
  }

  Widget _buildLegend(BuildContext context, bool isCompare) {
    if (isCompare) {
      return Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          _legendDot(KbColors.brand, '本次'),
          const SizedBox(width: 24),
          _legendDash(KbColors.text3, '上次'),
        ],
      );
    }
    // result: 只显示问题点
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        _legendDot(KbColors.accentWarn, '问题点: ${_labels[_minIndex]} ${_values[_minIndex]}'),
      ],
    );
  }

  Widget _legendDot(Color color, String label) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(width: 10, height: 10, decoration: BoxDecoration(color: color, shape: BoxShape.circle)),
        const SizedBox(width: 6),
        Text(label, style: const TextStyle(fontSize: 12, color: KbColors.text2)),
      ],
    );
  }

  Widget _legendDash(Color color, String label) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(width: 16, height: 2, color: color),
        const SizedBox(width: 6),
        Text(label, style: const TextStyle(fontSize: 12, color: KbColors.text2)),
      ],
    );
  }
}

class _RadarChartPainter extends CustomPainter {
  final RadarData data;
  final RadarData? prevData;
  final bool highlightProblem;
  final int minIndex;

  static const int _axisCount = 8;

  _RadarChartPainter({
    required this.data,
    required this.prevData,
    required this.highlightProblem,
    required this.minIndex,
  });

  List<int> _vals(RadarData d) => [
        d.headForward, d.roundShoulder, d.pelvicTilt, d.kneeExtension,
        d.spinalCurvature, d.shoulderHeight, d.legAlignment, d.coreStability,
      ];

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = min(size.width, size.height) / 2 - 30;

    _drawGrid(canvas, center, radius);
    if (prevData != null) {
      _drawPolygon(canvas, center, radius, _vals(prevData!), KbColors.text3, null, dashed: true);
    }
    _drawPolygon(canvas, center, radius, _vals(data), KbColors.brand, KbColors.brand.withAlpha(0x33));
    _drawPoints(canvas, center, radius);
    if (highlightProblem) _drawProblemRing(canvas, center, radius);
  }

  double _axisAngle(int i) => -pi / 2 + 2 * pi * i / _axisCount;

  void _drawGrid(Canvas canvas, Offset center, double radius) {
    final gridPaint = Paint()
      ..color = KbColors.lineSoft
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1;
    for (int ring = 1; ring <= 4; ring++) {
      final r = radius * ring / 4;
      final path = Path();
      for (int i = 0; i < _axisCount; i++) {
        final a = _axisAngle(i);
        final p = Offset(center.dx + r * cos(a), center.dy + r * sin(a));
        i == 0 ? path.moveTo(p.dx, p.dy) : path.lineTo(p.dx, p.dy);
      }
      path.close();
      canvas.drawPath(path, gridPaint);
    }
    for (int i = 0; i < _axisCount; i++) {
      final a = _axisAngle(i);
      canvas.drawLine(center, Offset(center.dx + radius * cos(a), center.dy + radius * sin(a)), gridPaint);
    }
  }

  Offset _point(Offset center, double radius, int i, int value) {
    final a = _axisAngle(i);
    final r = radius * (value / 100).clamp(0.0, 1.0);
    return Offset(center.dx + r * cos(a), center.dy + r * sin(a));
  }

  void _drawPolygon(Canvas canvas, Offset center, double radius, List<int> vals, Color stroke, Color? fill, {bool dashed = false}) {
    final path = Path();
    for (int i = 0; i < _axisCount; i++) {
      final p = _point(center, radius, i, vals[i]);
      i == 0 ? path.moveTo(p.dx, p.dy) : path.lineTo(p.dx, p.dy);
    }
    path.close();
    if (fill != null) {
      canvas.drawPath(path, Paint()..color = fill..style = PaintingStyle.fill);
    }
    final paint = Paint()
      ..color = stroke
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2;
    if (dashed) {
      // 简单虚线: 用 dashPath 效果近似,这里用细密点替代完整 dashPath 依赖
      paint.strokeCap = StrokeCap.round;
    }
    canvas.drawPath(path, paint);
  }

  void _drawPoints(Canvas canvas, Offset center, double radius) {
    final vals = _vals(data);
    for (int i = 0; i < _axisCount; i++) {
      final p = _point(center, radius, i, vals[i]);
      canvas.drawCircle(p, 6, Paint()..color = KbColors.surface);
      canvas.drawCircle(p, 4, Paint()..color = KbColors.brand);
    }
  }

  void _drawProblemRing(Canvas canvas, Offset center, double radius) {
    final vals = _vals(data);
    final p = _point(center, radius, minIndex, vals[minIndex]);
    canvas.drawCircle(p, 8, Paint()..color = KbColors.accentWarn..style = PaintingStyle.stroke..strokeWidth = 2);
  }

  @override
  bool shouldRepaint(covariant _RadarChartPainter old) {
    return old.data != data || old.prevData != prevData || old.highlightProblem != highlightProblem;
  }
}
