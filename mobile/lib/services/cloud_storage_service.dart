import 'package:flutter/foundation.dart';

import 'api_service.dart';

class CloudStorageService {
  // 保存分析记录
  static Future<bool> saveAnalysisRecord(Map<String, dynamic> record) async {
    try {
      final response = await ApiService.authenticatedPost(
        '/data/analysis',
        body: record,
      );
      return response != null;
    } catch (e) {
      debugPrint('云端保存分析记录失败: $e');
      return false;
    }
  }

  // 获取分析记录
  static Future<List<dynamic>> getAnalysisRecords() async {
    try {
      return await ApiService.authenticatedGetList('/data/analysis');
    } catch (e) {
      debugPrint('云端获取分析记录失败: $e');
      return [];
    }
  }

  // 保存训练方案
  static Future<bool> savePlan(Map<String, dynamic> plan) async {
    try {
      final response = await ApiService.authenticatedPost(
        '/data/plans',
        body: plan,
      );
      return response != null;
    } catch (e) {
      debugPrint('云端保存训练方案失败: $e');
      return false;
    }
  }

  // 获取训练方案
  static Future<List<dynamic>> getPlans() async {
    try {
      return await ApiService.authenticatedGetList('/data/plans');
    } catch (e) {
      debugPrint('云端获取训练方案失败: $e');
      return [];
    }
  }

  // 保存训练记录
  static Future<bool> saveWorkoutRecord(Map<String, dynamic> record) async {
    try {
      final response = await ApiService.authenticatedPost(
        '/data/workouts',
        body: record,
      );
      return response != null;
    } catch (e) {
      debugPrint('云端保存训练记录失败: $e');
      return false;
    }
  }

  // 获取训练记录
  static Future<List<dynamic>> getWorkoutRecords() async {
    try {
      return await ApiService.authenticatedGetList('/data/workouts');
    } catch (e) {
      debugPrint('云端获取训练记录失败: $e');
      return [];
    }
  }

  // 保存饮食记录
  static Future<bool> saveNutritionRecord(Map<String, dynamic> record) async {
    try {
      final response = await ApiService.authenticatedPost(
        '/data/nutrition',
        body: record,
      );
      return response != null;
    } catch (e) {
      debugPrint('云端保存饮食记录失败: $e');
      return false;
    }
  }

  // 获取饮食记录
  static Future<List<dynamic>> getNutritionRecords() async {
    try {
      return await ApiService.authenticatedGetList('/data/nutrition');
    } catch (e) {
      debugPrint('云端获取饮食记录失败: $e');
      return [];
    }
  }

  // 同步本地数据到云端
  static Future<void> syncLocalToCloud({
    required List<dynamic> localAnalyses,
    required List<dynamic> localPlans,
    required List<dynamic> localWorkouts,
    required List<dynamic> localNutrition,
  }) async {
    debugPrint('开始同步本地数据到云端...');

    for (final record in localAnalyses) {
      await saveAnalysisRecord(record);
    }
    for (final plan in localPlans) {
      await savePlan(plan);
    }
    for (final record in localWorkouts) {
      await saveWorkoutRecord(record);
    }
    for (final record in localNutrition) {
      await saveNutritionRecord(record);
    }

    debugPrint('本地数据同步完成');
  }
}
