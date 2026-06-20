import 'dart:io';
import 'package:flutter/material.dart';

import '../services/api_service.dart';
import '../services/storage_service.dart';
import '../services/cloud_storage_service.dart';

class NutritionProvider extends ChangeNotifier {
  Map<String, dynamic>? _currentAnalysis;
  bool _isAnalyzing = false;
  String? _error;
  List<dynamic> _records = [];

  Map<String, dynamic>? get currentAnalysis => _currentAnalysis;
  bool get isAnalyzing => _isAnalyzing;
  String? get error => _error;
  List<dynamic> get records => _records;

  NutritionProvider() {
    _loadRecords();
  }

  Future<void> _loadRecords() async {
    // 先加载本地数据
    _records = StorageService.getNutritionRecords();

    // 如果已登录，尝试从云端加载
    try {
      if (await ApiService.isAuthenticated()) {
        final cloudRecords = await CloudStorageService.getNutritionRecords();
        if (cloudRecords.isNotEmpty) {
          _records = cloudRecords;
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

      _records = StorageService.getNutritionRecords();
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
      if (record is! Map) continue;
      final createdStr = record['createdAt']?.toString();
      final date = createdStr == null ? null : DateTime.tryParse(createdStr);
      if (date == null) continue;
      if (date.year != today.year || date.month != today.month || date.day != today.day) {
        continue;
      }

      final analysis = record['analysis'];
      if (analysis is! Map) continue;
      totalCalories += _toInt(analysis['totalCalories']);
      totalProtein += _toInt(analysis['totalProtein']);
      totalCarbs += _toInt(analysis['totalCarbs']);
      totalFat += _toInt(analysis['totalFat']);
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

  // 安全转 int：兼容 num/double/String/null
  static int _toInt(dynamic v) {
    if (v is int) return v;
    if (v is num) return v.round();
    if (v is String) return int.tryParse(v) ?? 0;
    return 0;
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
}
