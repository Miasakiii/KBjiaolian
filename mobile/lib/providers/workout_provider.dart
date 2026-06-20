import 'package:flutter/material.dart';

import '../services/api_service.dart';
import '../services/storage_service.dart';
import '../services/cloud_storage_service.dart';

class WorkoutProvider extends ChangeNotifier {
  List<dynamic> _records = [];
  Map<String, dynamic>? _currentWorkout;
  bool _isWorkoutActive = false;
  DateTime? _startTime;

  List<dynamic> get records => _records;
  Map<String, dynamic>? get currentWorkout => _currentWorkout;
  bool get isWorkoutActive => _isWorkoutActive;
  DateTime? get startTime => _startTime;

  WorkoutProvider() {
    _loadRecords();
  }

  Future<void> _loadRecords() async {
    // 先加载本地数据
    _records = StorageService.getWorkoutRecords();

    // 如果已登录，尝试从云端加载
    try {
      if (await ApiService.isAuthenticated()) {
        final cloudRecords = await CloudStorageService.getWorkoutRecords();
        if (cloudRecords.isNotEmpty) {
          _records = cloudRecords;
        }
      }
    } catch (e) {
      debugPrint('云端加载训练记录失败: $e');
    }

    notifyListeners();
  }

  void startWorkout(Map<String, dynamic> plan, int dayIndex) {
    final schedule = (plan['schedule'] as List?) ?? const [];
    if (dayIndex < 0 || dayIndex >= schedule.length) return;
    final day = schedule[dayIndex] as Map? ?? const {};
    final exercisesRaw = (day['exercises'] as List?) ?? const [];

    _currentWorkout = {
      'planId': plan['id'],
      'planName': plan['name'],
      'dayIndex': dayIndex,
      'day': day,
      'exercises': exercisesRaw.map((raw) {
        final e = raw is Map ? Map<String, dynamic>.from(raw) : <String, dynamic>{};
        final setsValue = e['sets'];
        final setsCount = setsValue is int
            ? setsValue
            : (int.tryParse(setsValue?.toString() ?? '') ?? 3);
        return {
          ...e,
          'completedSets': List.generate(
            setsCount,
            (_) => <String, dynamic>{'reps': 0, 'completed': false},
          ),
        };
      }).toList(),
    };
    _isWorkoutActive = true;
    _startTime = DateTime.now();
    notifyListeners();
  }

  void completeSet(int exerciseIndex, int setIndex, int reps) {
    if (_currentWorkout == null) return;

    final exercises = (_currentWorkout!['exercises'] as List?) ?? const [];
    if (exerciseIndex < 0 || exerciseIndex >= exercises.length) return;
    final exercise = exercises[exerciseIndex] as Map? ?? const {};
    final sets = (exercise['completedSets'] as List?) ?? const [];
    if (setIndex < 0 || setIndex >= sets.length) return;

    sets[setIndex] = {'reps': reps, 'completed': true};
    notifyListeners();
  }

  Future<void> finishWorkout({int rating = 4, String notes = ''}) async {
    if (_currentWorkout == null || _startTime == null) return;

    final endTime = DateTime.now();
    final duration = endTime.difference(_startTime!).inMinutes;

    final record = {
      'id': DateTime.now().millisecondsSinceEpoch.toString(),
      'planId': _currentWorkout!['planId'],
      'planName': _currentWorkout!['planName'],
      'dayIndex': _currentWorkout!['dayIndex'],
      'dayName': _currentWorkout!['day']['name'],
      'startTime': _startTime!.toIso8601String(),
      'endTime': endTime.toIso8601String(),
      'duration': duration,
      'exercises': _currentWorkout!['exercises'],
      'rating': rating,
      'notes': notes,
      'createdAt': DateTime.now().toIso8601String(),
    };

    // 保存到本地
    await StorageService.saveWorkoutRecord(record);

    // 保存到云端
    await CloudStorageService.saveWorkoutRecord(record);

    _records = StorageService.getWorkoutRecords();

    _currentWorkout = null;
    _isWorkoutActive = false;
    _startTime = null;
    notifyListeners();
  }

  void cancelWorkout() {
    _currentWorkout = null;
    _isWorkoutActive = false;
    _startTime = null;
    notifyListeners();
  }

  int get totalWorkouts => _records.length;

  int get thisWeekWorkouts {
    final now = DateTime.now();
    // 以本周一 00:00 为起点（locale 无关），修正原逻辑把本周一 now 之前的记录排除掉的问题
    final startOfWeek = DateTime(now.year, now.month, now.day)
        .subtract(Duration(days: now.weekday - 1));
    return _records.where((r) {
      final date = DateTime.tryParse(r['createdAt']?.toString() ?? '');
      if (date == null) return false;
      return date.isAfter(startOfWeek);
    }).length;
  }
}
