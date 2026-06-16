import 'package:flutter_test/flutter_test.dart';
import 'package:kb_coach/models/nutrition_record.dart';

void main() {
  group('NutritionRecord Model', () {
    test('should create NutritionRecord from JSON', () {
      final json = {
        'id': 'nutrition-123',
        'imagePreview': 'data:image/jpeg;base64,...',
        'mealType': 'lunch',
        'foods': [
          {'name': '鸡胸肉', 'calories': 165, 'protein': 31},
          {'name': '米饭', 'calories': 130, 'protein': 2.7},
        ],
        'totalCalories': 295,
        'totalProtein': 33.7,
        'totalCarbs': 45,
        'totalFat': 5,
        'tips': '蛋白质摄入充足',
        'notes': '午餐记录',
        'createdAt': 1718000000000,
      };

      final nutrition = NutritionRecord.fromJson(json);

      expect(nutrition.id, 'nutrition-123');
      expect(nutrition.imagePreview, 'data:image/jpeg;base64,...');
      expect(nutrition.mealType, 'lunch');
      expect(nutrition.foods.length, 2);
      expect(nutrition.totalCalories, 295);
      expect(nutrition.totalProtein, 33.7);
      expect(nutrition.totalCarbs, 45);
      expect(nutrition.totalFat, 5);
      expect(nutrition.tips, '蛋白质摄入充足');
      expect(nutrition.notes, '午餐记录');
      expect(nutrition.createdAt, 1718000000000);
    });

    test('should convert NutritionRecord to JSON', () {
      final nutrition = NutritionRecord(
        id: 'nutrition-123',
        imagePreview: 'data:image/jpeg;base64,...',
        mealType: 'lunch',
        foods: [
          {'name': '鸡胸肉', 'calories': 165, 'protein': 31},
        ],
        totalCalories: 295,
        totalProtein: 33.7,
        totalCarbs: 45,
        totalFat: 5,
        tips: '蛋白质摄入充足',
        notes: '午餐记录',
        createdAt: 1718000000000,
      );

      final json = nutrition.toJson();

      expect(json['id'], 'nutrition-123');
      expect(json['imagePreview'], 'data:image/jpeg;base64,...');
      expect(json['mealType'], 'lunch');
      expect(json['foods'].length, 1);
      expect(json['totalCalories'], 295);
      expect(json['totalProtein'], 33.7);
      expect(json['totalCarbs'], 45);
      expect(json['totalFat'], 5);
      expect(json['tips'], '蛋白质摄入充足');
      expect(json['notes'], '午餐记录');
      expect(json['createdAt'], 1718000000000);
    });

    test('should handle missing fields with defaults', () {
      final json = <String, dynamic>{
        'id': 'nutrition-456',
      };

      final nutrition = NutritionRecord.fromJson(json);

      expect(nutrition.id, 'nutrition-456');
      expect(nutrition.imagePreview, isNull);
      expect(nutrition.mealType, 'lunch');
      expect(nutrition.foods, isEmpty);
      expect(nutrition.totalCalories, 0);
      expect(nutrition.totalProtein, 0);
      expect(nutrition.totalCarbs, 0);
      expect(nutrition.totalFat, 0);
      expect(nutrition.tips, '');
      expect(nutrition.notes, '');
      expect(nutrition.createdAt, 0);
    });

    test('should handle toString', () {
      final nutrition = NutritionRecord(
        id: 'nutrition-123',
        imagePreview: null,
        mealType: 'lunch',
        foods: [],
        totalCalories: 295,
        totalProtein: 33.7,
        totalCarbs: 45,
        totalFat: 5,
        tips: '',
        notes: '',
        createdAt: 1718000000000,
      );

      final string = nutrition.toString();

      expect(string, contains('NutritionRecord'));
      expect(string, contains('nutrition-123'));
      expect(string, contains('lunch'));
      expect(string, contains('295'));
    });
  });
}
