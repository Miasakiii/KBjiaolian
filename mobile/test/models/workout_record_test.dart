import 'package:flutter_test/flutter_test.dart';
import 'package:kb_coach/models/workout_record.dart';

void main() {
  group('WorkoutRecord Model', () {
    test('should create WorkoutRecord from JSON', () {
      final json = {
        'id': 'workout-123',
        'planId': 'plan-456',
        'planName': '增肌计划',
        'dayIndex': 1,
        'dayName': '胸+三头',
        'startTime': '2024-06-10T10:00:00',
        'endTime': '2024-06-10T11:00:00',
        'duration': 60,
        'exercises': [
          {'name': '卧推', 'sets': 4, 'reps': 10},
          {'name': '飞鸟', 'sets': 3, 'reps': 12},
        ],
        'rating': 4,
        'notes': '感觉不错',
        'createdAt': '2024-06-10T11:00:00',
      };

      final workout = WorkoutRecord.fromJson(json);

      expect(workout.id, 'workout-123');
      expect(workout.planId, 'plan-456');
      expect(workout.planName, '增肌计划');
      expect(workout.dayIndex, 1);
      expect(workout.dayName, '胸+三头');
      expect(workout.startTime, '2024-06-10T10:00:00');
      expect(workout.endTime, '2024-06-10T11:00:00');
      expect(workout.duration, 60);
      expect(workout.exercises.length, 2);
      expect(workout.rating, 4);
      expect(workout.notes, '感觉不错');
      expect(workout.createdAt, '2024-06-10T11:00:00');
    });

    test('should convert WorkoutRecord to JSON', () {
      final workout = WorkoutRecord(
        id: 'workout-123',
        planId: 'plan-456',
        planName: '增肌计划',
        dayIndex: 1,
        dayName: '胸+三头',
        startTime: '2024-06-10T10:00:00',
        endTime: '2024-06-10T11:00:00',
        duration: 60,
        exercises: [
          {'name': '卧推', 'sets': 4, 'reps': 10},
        ],
        rating: 4,
        notes: '感觉不错',
        createdAt: '2024-06-10T11:00:00',
      );

      final json = workout.toJson();

      expect(json['id'], 'workout-123');
      expect(json['planId'], 'plan-456');
      expect(json['planName'], '增肌计划');
      expect(json['dayIndex'], 1);
      expect(json['dayName'], '胸+三头');
      expect(json['startTime'], '2024-06-10T10:00:00');
      expect(json['endTime'], '2024-06-10T11:00:00');
      expect(json['duration'], 60);
      expect(json['exercises'].length, 1);
      expect(json['rating'], 4);
      expect(json['notes'], '感觉不错');
      expect(json['createdAt'], '2024-06-10T11:00:00');
    });

    test('should handle missing fields with defaults', () {
      final json = <String, dynamic>{
        'id': 'workout-789',
      };

      final workout = WorkoutRecord.fromJson(json);

      expect(workout.id, 'workout-789');
      expect(workout.planId, isNull);
      expect(workout.planName, '');
      expect(workout.dayIndex, 0);
      expect(workout.dayName, '');
      expect(workout.startTime, '');
      expect(workout.endTime, '');
      expect(workout.duration, 0);
      expect(workout.exercises, isEmpty);
      expect(workout.rating, 0);
      expect(workout.notes, '');
      expect(workout.createdAt, '');
    });

    test('should handle toString', () {
      final workout = WorkoutRecord(
        id: 'workout-123',
        planId: 'plan-456',
        planName: '增肌计划',
        dayIndex: 1,
        dayName: '胸+三头',
        startTime: '2024-06-10T10:00:00',
        endTime: '2024-06-10T11:00:00',
        duration: 60,
        exercises: [],
        rating: 4,
        notes: '',
        createdAt: '2024-06-10T11:00:00',
      );

      final str = workout.toString();

      expect(str, contains('WorkoutRecord'));
      expect(str, contains('workout-123'));
      expect(str, contains('增肌计划'));
      expect(str, contains('胸+三头'));
      expect(str, contains('60'));
    });
  });
}
