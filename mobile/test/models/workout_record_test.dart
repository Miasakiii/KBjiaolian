import 'package:flutter_test/flutter_test.dart';
import 'package:kb_coach/models/workout_record.dart';

void main() {
  group('WorkoutRecord Model', () {
    test('should create WorkoutRecord from JSON', () {
      final json = {
        'id': 'workout-123',
        'planId': 'plan-456',
        'planName': '增肌计划',
        'dayNumber': 1,
        'dayName': '胸+三头',
        'startTime': 1718000000000,
        'endTime': 1718003600000,
        'duration': 60,
        'exercises': [
          {'name': '卧推', 'sets': 4, 'reps': 10},
          {'name': '飞鸟', 'sets': 3, 'reps': 12},
        ],
        'rating': 4,
        'notes': '感觉不错',
        'createdAt': 1718003600000,
      };

      final workout = WorkoutRecord.fromJson(json);

      expect(workout.id, 'workout-123');
      expect(workout.planId, 'plan-456');
      expect(workout.planName, '增肌计划');
      expect(workout.dayNumber, 1);
      expect(workout.dayName, '胸+三头');
      expect(workout.startTime, 1718000000000);
      expect(workout.endTime, 1718003600000);
      expect(workout.duration, 60);
      expect(workout.exercises.length, 2);
      expect(workout.rating, 4);
      expect(workout.notes, '感觉不错');
      expect(workout.createdAt, 1718003600000);
    });

    test('should convert WorkoutRecord to JSON', () {
      final workout = WorkoutRecord(
        id: 'workout-123',
        planId: 'plan-456',
        planName: '增肌计划',
        dayNumber: 1,
        dayName: '胸+三头',
        startTime: 1718000000000,
        endTime: 1718003600000,
        duration: 60,
        exercises: [
          {'name': '卧推', 'sets': 4, 'reps': 10},
        ],
        rating: 4,
        notes: '感觉不错',
        createdAt: 1718003600000,
      );

      final json = workout.toJson();

      expect(json['id'], 'workout-123');
      expect(json['planId'], 'plan-456');
      expect(json['planName'], '增肌计划');
      expect(json['dayNumber'], 1);
      expect(json['dayName'], '胸+三头');
      expect(json['startTime'], 1718000000000);
      expect(json['endTime'], 1718003600000);
      expect(json['duration'], 60);
      expect(json['exercises'].length, 1);
      expect(json['rating'], 4);
      expect(json['notes'], '感觉不错');
      expect(json['createdAt'], 1718003600000);
    });

    test('should handle missing fields with defaults', () {
      final json = <String, dynamic>{
        'id': 'workout-789',
      };

      final workout = WorkoutRecord.fromJson(json);

      expect(workout.id, 'workout-789');
      expect(workout.planId, isNull);
      expect(workout.planName, '');
      expect(workout.dayNumber, 0);
      expect(workout.dayName, '');
      expect(workout.startTime, 0);
      expect(workout.endTime, 0);
      expect(workout.duration, 0);
      expect(workout.exercises, isEmpty);
      expect(workout.rating, 0);
      expect(workout.notes, '');
      expect(workout.createdAt, 0);
    });

    test('should handle toString', () {
      final workout = WorkoutRecord(
        id: 'workout-123',
        planId: 'plan-456',
        planName: '增肌计划',
        dayNumber: 1,
        dayName: '胸+三头',
        startTime: 1718000000000,
        endTime: 1718003600000,
        duration: 60,
        exercises: [],
        rating: 4,
        notes: '',
        createdAt: 1718003600000,
      );

      final string = workout.toString();

      expect(string, contains('WorkoutRecord'));
      expect(string, contains('workout-123'));
      expect(string, contains('增肌计划'));
      expect(string, contains('胸+三头'));
      expect(string, contains('60'));
    });
  });
}
