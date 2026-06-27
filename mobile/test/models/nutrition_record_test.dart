import 'package:flutter_test/flutter_test.dart';
import 'package:kb_coach/models/nutrition_record.dart';

void main() {
  group('NutritionRecord Model', () {
    test('should create NutritionRecord from JSON', () {
      final json = {
        'id': 'nr-001',
        'mealType': 'lunch',
        'analysis': {
          'totalCalories': 520,
          'totalProtein': 35,
          'totalCarbs': 60,
          'totalFat': 12,
        },
        'createdAt': '2024-06-10T12:00:00',
      };

      final record = NutritionRecord.fromJson(json);

      expect(record.id, 'nr-001');
      expect(record.mealType, 'lunch');
      expect(record.totalCalories, 520);
      expect(record.totalProtein, 35);
      expect(record.totalCarbs, 60);
      expect(record.totalFat, 12);
      expect(record.createdAt, '2024-06-10T12:00:00');
    });

    test('should convert NutritionRecord to JSON', () {
      final record = NutritionRecord(
        id: 'nr-002',
        mealType: 'dinner',
        analysis: {
          'totalCalories': 680,
          'totalProtein': 40,
        },
        createdAt: '2024-06-10T19:00:00',
      );

      final json = record.toJson();

      expect(json['id'], 'nr-002');
      expect(json['mealType'], 'dinner');
      expect((json['analysis'] as Map)['totalCalories'], 680);
      expect(json['createdAt'], '2024-06-10T19:00:00');
    });

    test('should handle missing fields with defaults', () {
      final json = <String, dynamic>{
        'id': 'nr-003',
      };

      final record = NutritionRecord.fromJson(json);

      expect(record.id, 'nr-003');
      expect(record.mealType, 'lunch');
      expect(record.analysis, isEmpty);
      expect(record.totalCalories, 0);
      expect(record.totalProtein, 0);
      expect(record.createdAt, '');
    });

    test('should handle string numbers in analysis', () {
      final record = NutritionRecord(
        id: 'nr-004',
        mealType: 'breakfast',
        analysis: {
          'totalCalories': '350',
          'totalProtein': 20.5,
        },
        createdAt: '2024-06-10T08:00:00',
      );

      expect(record.totalCalories, 350);
      expect(record.totalProtein, 21); // 20.5.round() = 21 (Dart rounds to even, but 20.5 -> 20 in Dart)
    });

    test('should handle toString', () {
      final record = NutritionRecord(
        id: 'nr-005',
        mealType: 'snack',
        analysis: {'totalCalories': 200},
        createdAt: '2024-06-10T15:00:00',
      );

      final str = record.toString();

      expect(str, contains('NutritionRecord'));
      expect(str, contains('nr-005'));
      expect(str, contains('snack'));
      expect(str, contains('200'));
    });
  });
}
