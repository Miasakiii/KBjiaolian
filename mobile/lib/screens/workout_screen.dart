import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../providers/workout_provider.dart';
import '../providers/plan_provider.dart';
import '../theme/kb_colors.dart';

class WorkoutScreen extends StatelessWidget {
  const WorkoutScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('训练'),
      ),
      body: Consumer<WorkoutProvider>(
        builder: (context, provider, _) {
          if (provider.isWorkoutActive) {
            return _ActiveWorkout(provider: provider);
          }

          return _WorkoutHome(provider: provider);
        },
      ),
    );
  }
}

class _WorkoutHome extends StatelessWidget {
  final WorkoutProvider provider;

  const _WorkoutHome({required this.provider});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // 统计卡片
          _buildStats(context),
          const SizedBox(height: 24),

          // 开始训练
          _buildStartWorkout(context),
          const SizedBox(height: 24),

          // 训练记录
          _buildHistory(context),
        ],
      ),
    );
  }

  Widget _buildStats(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  Text(
                    '${provider.totalWorkouts}',
                    style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                      fontWeight: FontWeight.w600,
                      color: KbColors.brand,
                    ),
                  ),
                  const Text(
                    '总训练次数',
                    style: TextStyle(color: KbColors.text2),
                  ),
                ],
              ),
            ),
          ),
        ),
        Expanded(
          child: Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  Text(
                    '${provider.thisWeekWorkouts}',
                    style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                      fontWeight: FontWeight.w600,
                      color: KbColors.brand,
                    ),
                  ),
                  const Text(
                    '本周训练',
                    style: TextStyle(color: KbColors.text2),
                  ),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildStartWorkout(BuildContext context) {
    return Consumer<PlanProvider>(
      builder: (context, planProvider, _) {
        final plan = planProvider.currentPlan;

        if (plan == null) {
          return Card(
            child: Padding(
              padding: const EdgeInsets.all(32),
              child: Column(
                children: [
                  const Icon(Icons.fitness_center, size: 48, color: KbColors.text3),
                  const SizedBox(height: 16),
                  const Text('请先生成训练方案'),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: () {
                      context.push('/plan');
                    },
                    child: const Text('生成训练方案'),
                  ),
                ],
              ),
            ),
          );
        }

        final schedule = plan.schedule;

        return Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  plan.name.isNotEmpty ? plan.name : '训练方案',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 16),
                ...schedule.asMap().entries.map((entry) {
                  final day = entry.value;
                  return ListTile(
                    leading: CircleAvatar(
                      backgroundColor: KbColors.brandSoft,
                      child: Text(
                        '${day['day']}',
                        style: const TextStyle(color: KbColors.brand600),
                      ),
                    ),
                    title: Text(day['name'] ?? ''),
                    subtitle: Text('${(day['exercises'] as List?)?.length ?? 0} 个动作'),
                    trailing: const Icon(Icons.play_arrow),
                    onTap: () {
                      provider.startWorkout(plan, entry.key);
                    },
                  );
                }),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildHistory(BuildContext context) {
    final records = provider.records;

    if (records.isEmpty) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            '训练记录',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 24),
          Center(
            child: Column(
              children: [
                const Icon(Icons.fitness_center, size: 64, color: KbColors.line),
                const SizedBox(height: 16),
                const Text(
                  '暂无训练记录',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w600,
                    color: KbColors.text2,
                  ),
                ),
                const SizedBox(height: 8),
                const Text(
                  '完成训练后可查看记录',
                  style: TextStyle(color: KbColors.text3),
                ),
                const SizedBox(height: 16),
                TextButton(
                  onPressed: () => context.go('/plan'),
                  child: const Text('去训练'),
                ),
              ],
            ),
          ),
        ],
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          '训练记录',
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.w600,
          ),
        ),
        const SizedBox(height: 12),
        ...records.take(5).map((record) {
          final date = DateTime.tryParse(record.createdAt) ?? DateTime.now();
          return Card(
            child: ListTile(
              leading: CircleAvatar(
                backgroundColor: KbColors.brandSoft,
                child: Text(
                  '${record.rating}⭐',
                  style: const TextStyle(fontSize: 12),
                ),
              ),
              title: Text(record.dayName),
              subtitle: Text(
                '${date.month}/${date.day} · ${record.duration} 分钟',
              ),
            ),
          );
        }),
      ],
    );
  }
}

class _ActiveWorkout extends StatefulWidget {
  final WorkoutProvider provider;

  const _ActiveWorkout({required this.provider});

  @override
  State<_ActiveWorkout> createState() => _ActiveWorkoutState();
}

class _ActiveWorkoutState extends State<_ActiveWorkout> {
  int _currentExerciseIndex = 0;
  int _rating = 4;
  late final Stream<int> _timerStream;

  @override
  void initState() {
    super.initState();
    // 在 initState 创建 stream 避免每次 build 都重置订阅
    _timerStream = Stream.periodic(const Duration(seconds: 1), (i) => i);
  }

  @override
  Widget build(BuildContext context) {
    final workout = widget.provider.currentWorkout;
    // 防御 currentWorkout 可能在 _ActiveWorkout 构造后被置 null（如 cancelWorkout）
    if (workout == null) {
      return const Center(child: Text('训练已结束'));
    }
    final exercises = (workout['exercises'] as List?) ?? const [];
    if (exercises.isEmpty || _currentExerciseIndex >= exercises.length) {
      return const Center(child: Text('没有动作数据'));
    }
    final currentExercise = exercises[_currentExerciseIndex] as Map? ?? const {};
    final completedSets = (currentExercise['completedSets'] as List?)
            ?.where((s) => s is Map && s['completed'] == true)
            .length ??
        0;
    final totalSets = (currentExercise['completedSets'] as List?)?.length ?? 0;

    return Column(
      children: [
        // 进度指示
        LinearProgressIndicator(
          value: exercises.isEmpty ? 0 : (_currentExerciseIndex + 1) / exercises.length,
          backgroundColor: KbColors.brandSoft,
        ),

        // 计时器
        Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.timer, color: KbColors.brand),
              const SizedBox(width: 8),
              StreamBuilder<int>(
                stream: _timerStream,
                builder: (context, _) {
                  final startTime = widget.provider.startTime;
                  if (startTime == null) {
                    return const Text('--:--');
                  }
                  final duration = DateTime.now().difference(startTime);
                  return Text(
                    '${duration.inMinutes.toString().padLeft(2, '0')}:${(duration.inSeconds % 60).toString().padLeft(2, '0')}',
                    style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                      fontWeight: FontWeight.w600,
                      fontFamily: 'monospace',
                    ),
                  );
                },
              ),
            ],
          ),
        ),

        // 当前动作
        Expanded(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      children: [
                        Text(
                          '动作 ${_currentExerciseIndex + 1}/${exercises.length}',
                          style: const TextStyle(color: KbColors.text2),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          currentExercise['name'] ?? '',
                          style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(currentExercise['targetMuscle'] ?? ''),
                        const SizedBox(height: 16),
                        Text(
                          '$completedSets/$totalSets 组完成',
                          style: const TextStyle(
                            color: KbColors.brand600,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16),

                // 组列表
                ...((currentExercise['completedSets'] as List?) ?? const []).asMap().entries.map((entry) {
                  final setIndex = entry.key;
                  final set = entry.value as Map? ?? const {};
                  final isCompleted = set['completed'] == true;

                  return Card(
                    color: isCompleted ? KbColors.brandSoft : null,
                    child: ListTile(
                      leading: CircleAvatar(
                        backgroundColor: isCompleted ? KbColors.brand : KbColors.line,
                        child: isCompleted
                            ? const Icon(Icons.check, color: Colors.white)
                            : Text('${setIndex + 1}'),
                      ),
                      title: Text('第 ${setIndex + 1} 组'),
                      subtitle: Text('${currentExercise['reps'] ?? '10'} 次'),
                      trailing: isCompleted
                          ? const Icon(Icons.check_circle, color: KbColors.brand)
                          : ElevatedButton(
                              onPressed: () {
                                widget.provider.completeSet(
                                  _currentExerciseIndex,
                                  setIndex,
                                  int.tryParse(currentExercise['reps']?.toString().split('-').first ?? '10') ?? 10,
                                );
                                setState(() {});
                              },
                              child: const Text('完成'),
                            ),
                    ),
                  );
                }),
              ],
            ),
          ),
        ),

        // 操作按钮
        Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              if (_currentExerciseIndex < exercises.length - 1)
                Expanded(
                  child: ElevatedButton(
                    onPressed: () {
                      setState(() {
                        _currentExerciseIndex++;
                      });
                    },
                    child: const Text('下一个动作'),
                  ),
                )
              else
                Expanded(
                  child: ElevatedButton(
                    onPressed: _showFinishDialog,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: KbColors.brand,
                    ),
                    child: const Text('完成训练'),
                  ),
                ),
            ],
          ),
        ),
      ],
    );
  }

  void _showFinishDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('训练完成！'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('给这次训练打个分吧'),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: List.generate(5, (index) {
                return IconButton(
                  icon: Text(
                    index < _rating ? '⭐' : '☆',
                    style: const TextStyle(fontSize: 32),
                  ),
                  onPressed: () {
                    setState(() => _rating = index + 1);
                  },
                );
              }),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('取消'),
          ),
          ElevatedButton(
            onPressed: () {
              widget.provider.finishWorkout(rating: _rating);
              Navigator.pop(context);
            },
            child: const Text('保存'),
          ),
        ],
      ),
    );
  }
}
