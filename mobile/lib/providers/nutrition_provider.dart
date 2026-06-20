import 'dart:io';
import 'package:flutter/material.dart';

import '../models/nutrition_record.dart';
import '../services/api_service.dart';
import '../services/storage_service.dart';
import '../services/cloud_storage_service.dart';

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
    // 先加载本地数据
    final rawRecords = StorageService.getNutritionRecords();
    _records = rawRecords
        .map((e) => NutritionRecord.fromJson(e as Map<String, dynamic>))
        .toList();

    // 如果已登录，尝试从云端加载
    try {
      if (await ApiService.isAuthenticated()) {
        final cloudRecords = await CloudStorageService.getNutritionRecords();
        if (cloudRecords.isNotEmpty) {
          _records = cloudRecords
              .map((e) => NutritionRecord.fromJson(e as Map<String, dynamic>))
              .toList();
        }
      }
    } catch (e) {
      debugPrint('云端加载饮食记录失败: $e');
    }

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

      // 保存到云端
      await CloudStorageService.saveNutritionRecord(record);

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
