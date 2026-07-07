import 'dart:io';
import 'package:flutter/material.dart';

import '../models/nutrition_record.dart';
import '../services/api_service.dart';
import '../services/storage_service.dart';

class NutritionProvider extends ChangeNotifier {
  Map<String, dynamic>? _currentAnalysis;
  bool _isAnalyzing = false;
  String? _error;
  List<NutritionRecord> _records = [];

  Map<String, dynamic>? get currentAnalysis => _currentAnalysis;
  bool get isAnalyzing => _isAnalyzing;
  String? get error => _error;
  List<NutritionRecord> get records => _records;

  NutritionProvider() {
    _loadRecords();
  }

  Future<void> _loadRecords() async {
    // 个人版：仅本地存储
    final rawRecords = StorageService.getNutritionRecords();
    _records = rawRecords
        .map((e) => NutritionRecord.fromJson(e as Map<String, dynamic>))
        .toList();

    notifyListeners();
  }

  Future<void> analyzeFood(File imageFile, String mealType) async {
    _isAnalyzing = true;
    _error = null;
    notifyListeners();

    try {
      final result = await ApiService.analyzeFood(imageFile);
      _currentAnalysis = result;

      final record = {
        'id': DateTime.now().millisecondsSinceEpoch.toString(),
        'mealType': mealType,
        'analysis': result,
        'createdAt': DateTime.now().toIso8601String(),
      };

      // 保存到本地
      await StorageService.saveNutritionRecord(record);

      final rawRecords = StorageService.getNutritionRecords();
      _records = rawRecords
          .map((e) => NutritionRecord.fromJson(e as Map<String, dynamic>))
          .toList();
    } catch (e) {
      _error = e.toString();
      debugPrint('食物识别失败: $e');
    } finally {
      _isAnalyzing = false;
      notifyListeners();
    }
  }

  Map<String, dynamic> get todayNutrition {
    final today = DateTime.now();
    int totalCalories = 0;
    int totalProtein = 0;
    int totalCarbs = 0;
    int totalFat = 0;
    int count = 0;

    for (final record in _records) {
      final date = DateTime.tryParse(record.createdAt);
      if (date == null) continue;
      if (date.year != today.year || date.month != today.month || date.day != today.day) {
        continue;
      }

      totalCalories += record.totalCalories;
      totalProtein += record.totalProtein;
      totalCarbs += record.totalCarbs;
      totalFat += record.totalFat;
      count++;
    }

    return {
      'calories': totalCalories,
      'protein': totalProtein,
      'carbs': totalCarbs,
      'fat': totalFat,
      'recordCount': count,
    };
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
}
