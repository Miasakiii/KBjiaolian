import 'package:flutter/material.dart';

import '../services/storage_service.dart';
import '../theme/kb_colors.dart';

class GoalScreen extends StatefulWidget {
  const GoalScreen({super.key});

  @override
  State<GoalScreen> createState() => _GoalScreenState();
}

class _GoalScreenState extends State<GoalScreen> {
  double _targetWeight = 65;
  double _targetBodyFat = 20;
  double _weeklyWorkouts = 3;

  @override
  void initState() {
    super.initState();
    _loadGoals();
  }

  void _loadGoals() {
    final goals = StorageService.getGoals();
    if (goals != null && goals.isNotEmpty) {
      setState(() {
        _targetWeight = (goals['targetWeight'] as num?)?.toDouble() ?? 65;
        _targetBodyFat = (goals['targetBodyFat'] as num?)?.toDouble() ?? 20;
        _weeklyWorkouts = (goals['weeklyWorkouts'] as num?)?.toDouble() ?? 3;
      });
    }
  }

  Future<void> _save() async {
    await StorageService.saveGoals({
      'targetWeight': _targetWeight,
      'targetBodyFat': _targetBodyFat,
      'weeklyWorkouts': _weeklyWorkouts.round(),
    });

    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('训练目标已保存')),
    );
    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('训练目标'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildSlider(
                    label: '目标体重',
                    value: _targetWeight,
                    min: 40,
                    max: 120,
                    unit: 'kg',
                    decimals: 1,
                    onChanged: (v) => setState(() => _targetWeight = v),
                  ),
                  const Divider(),
                  _buildSlider(
                    label: '目标体脂率',
                    value: _targetBodyFat,
                    min: 5,
                    max: 40,
                    unit: '%',
                    decimals: 1,
                    onChanged: (v) => setState(() => _targetBodyFat = v),
                  ),
                  const Divider(),
                  _buildSlider(
                    label: '每周训练天数',
                    value: _weeklyWorkouts,
                    min: 1,
                    max: 7,
                    unit: '天',
                    decimals: 0,
                    onChanged: (v) => setState(() => _weeklyWorkouts = v),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 24),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: _save,
              style: ElevatedButton.styleFrom(
                backgroundColor: KbColors.brand,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              child: const Text(
                '保存目标',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSlider({
    required String label,
    required double value,
    required double min,
    required double max,
    required String unit,
    required int decimals,
    required ValueChanged<double> onChanged,
  }) {
    final displayValue = decimals == 0
        ? value.round().toString()
        : value.toStringAsFixed(decimals);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              label,
              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w500),
            ),
            Text(
              '$displayValue $unit',
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
                color: KbColors.brand600,
              ),
            ),
          ],
        ),
        Slider(
          value: value,
          min: min,
          max: max,
          divisions: ((max - min) * (decimals == 0 ? 1 : 10)).round(),
          activeColor: KbColors.brand,
          onChanged: onChanged,
        ),
      ],
    );
  }
}
