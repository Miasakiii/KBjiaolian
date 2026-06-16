import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../providers/plan_provider.dart';
import '../providers/analysis_provider.dart';

class PlanScreen extends StatefulWidget {
  const PlanScreen({super.key});

  @override
  State<PlanScreen> createState() => _PlanScreenState();
}

class _PlanScreenState extends State<PlanScreen> {
  String _goal = 'posture_fix';
  String _experience = 'beginner';
  String _equipment = 'bodyweight';
  int _daysPerWeek = 4;
  int _sessionDuration = 60;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('训练方案'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // 偏好设置
            _buildPreferences(),
            const SizedBox(height: 16),

            // 生成按钮
            _buildGenerateButton(),
            const SizedBox(height: 24),

            // 方案结果
            _buildPlanResult(),
          ],
        ),
      ),
    );
  }

  Widget _buildPreferences() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              '训练偏好',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),

            // 训练目标
            Text('训练目标', style: Theme.of(context).textTheme.titleSmall),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              children: [
                _ChoiceChip(
                  label: '增肌塑形',
                  selected: _goal == 'muscle_gain',
                  onSelected: () => setState(() => _goal = 'muscle_gain'),
                ),
                _ChoiceChip(
                  label: '减脂瘦身',
                  selected: _goal == 'fat_loss',
                  onSelected: () => setState(() => _goal = 'fat_loss'),
                ),
                _ChoiceChip(
                  label: '体态矫正',
                  selected: _goal == 'posture_fix',
                  onSelected: () => setState(() => _goal = 'posture_fix'),
                ),
                _ChoiceChip(
                  label: '康复训练',
                  selected: _goal == 'rehab',
                  onSelected: () => setState(() => _goal = 'rehab'),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // 经验水平
            Text('经验水平', style: Theme.of(context).textTheme.titleSmall),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              children: [
                _ChoiceChip(
                  label: '新手',
                  selected: _experience == 'beginner',
                  onSelected: () => setState(() => _experience = 'beginner'),
                ),
                _ChoiceChip(
                  label: '中级',
                  selected: _experience == 'intermediate',
                  onSelected: () => setState(() => _experience = 'intermediate'),
                ),
                _ChoiceChip(
                  label: '高级',
                  selected: _experience == 'advanced',
                  onSelected: () => setState(() => _experience = 'advanced'),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // 训练设备
            Text('训练设备', style: Theme.of(context).textTheme.titleSmall),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              children: [
                _ChoiceChip(
                  label: '健身房',
                  selected: _equipment == 'gym',
                  onSelected: () => setState(() => _equipment = 'gym'),
                ),
                _ChoiceChip(
                  label: '哑铃',
                  selected: _equipment == 'dumbbell',
                  onSelected: () => setState(() => _equipment = 'dumbbell'),
                ),
                _ChoiceChip(
                  label: '徒手',
                  selected: _equipment == 'bodyweight',
                  onSelected: () => setState(() => _equipment = 'bodyweight'),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // 每周天数
            Text('每周训练: $_daysPerWeek 天', style: Theme.of(context).textTheme.titleSmall),
            Slider(
              value: _daysPerWeek.toDouble(),
              min: 3,
              max: 6,
              divisions: 3,
              label: '$_daysPerWeek 天',
              onChanged: (value) {
                setState(() => _daysPerWeek = value.round());
              },
            ),
            const SizedBox(height: 16),

            // 每次时长
            Text('每次时长: $_sessionDuration 分钟', style: Theme.of(context).textTheme.titleSmall),
            Slider(
              value: _sessionDuration.toDouble(),
              min: 30,
              max: 90,
              divisions: 4,
              label: '$_sessionDuration 分钟',
              onChanged: (value) {
                setState(() => _sessionDuration = value.round());
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildGenerateButton() {
    return Consumer<PlanProvider>(
      builder: (context, provider, _) {
        return ElevatedButton(
          onPressed: provider.isGenerating ? null : _generatePlan,
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 16),
            child: provider.isGenerating
                ? const Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      ),
                      SizedBox(width: 12),
                      Text('生成中...'),
                    ],
                  )
                : const Text('生成训练方案'),
          ),
        );
      },
    );
  }

  Future<void> _generatePlan() async {
    final analysisProvider = context.read<AnalysisProvider>();
    final planProvider = context.read<PlanProvider>();

    if (analysisProvider.currentResult == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('请先完成体态分析')),
      );
      return;
    }

    await planProvider.generatePlan(
      goal: _goal,
      experience: _experience,
      equipment: _equipment,
      daysPerWeek: _daysPerWeek,
      sessionDuration: _sessionDuration,
      analysisResult: analysisProvider.currentResult!.toJson(),
    );

    if (planProvider.error != null && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('生成失败: ${planProvider.error}')),
      );
    }
  }

  Widget _buildPlanResult() {
    return Consumer<PlanProvider>(
      builder: (context, provider, _) {
        final plan = provider.currentPlan;
        if (plan == null) {
          return Card(
            child: Padding(
              padding: const EdgeInsets.all(32),
              child: Column(
                children: [
                  Text('📋', style: TextStyle(fontSize: 48, color: Colors.green.shade200)),
                  const SizedBox(height: 16),
                  Text(
                    '设置偏好后生成训练方案',
                    style: TextStyle(color: Colors.green.shade600),
                  ),
                ],
              ),
            ),
          );
        }

        final schedule = plan['schedule'] as List? ?? [];

        return Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      plan['name'] ?? '训练方案',
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text('周期: ${plan['durationWeeks'] ?? 0} 周'),
                    Text('每周: ${plan['daysPerWeek'] ?? 0} 天'),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),
            ...schedule.asMap().entries.map((entry) {
              final day = entry.value;
              final exercises = day['exercises'] as List? ?? [];

              return Card(
                margin: const EdgeInsets.only(bottom: 12),
                child: ExpansionTile(
                  title: Text('Day ${day['day']}: ${day['name'] ?? ''}'),
                  subtitle: Text('${exercises.length} 个动作'),
                  children: exercises.map((exercise) {
                    return ListTile(
                      title: Text(exercise['name'] ?? ''),
                      subtitle: Text('${exercise['sets']} 组 × ${exercise['reps']}'),
                      trailing: Text(exercise['targetMuscle'] ?? ''),
                    );
                  }).toList(),
                ),
              );
            }),
          ],
        );
      },
    );
  }
}

class _ChoiceChip extends StatelessWidget {
  final String label;
  final bool selected;
  final VoidCallback onSelected;

  const _ChoiceChip({
    required this.label,
    required this.selected,
    required this.onSelected,
  });

  @override
  Widget build(BuildContext context) {
    return ChoiceChip(
      label: Text(label),
      selected: selected,
      onSelected: (_) => onSelected(),
      selectedColor: Colors.green.shade100,
      checkmarkColor: Colors.green,
    );
  }
}
