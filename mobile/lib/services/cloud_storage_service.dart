import 'package:flutter/foundation.dart';

/// 个人版 CloudStorageService —— 无云端，所有方法 no-op / 返回空。
/// 保留类与方法签名，避免 Provider 编译断裂（Provider 已不再调用其云端分支）。
class CloudStorageService {
  static Future<bool> saveAnalysisRecord(Map<String, dynamic> record) async => false;
  static Future<List<dynamic>> getAnalysisRecords() async => [];
  static Future<bool> savePlan(Map<String, dynamic> plan) async => false;
  static Future<List<dynamic>> getPlans() async => [];
  static Future<bool> saveWorkoutRecord(Map<String, dynamic> record) async => false;
  static Future<List<dynamic>> getWorkoutRecords() async => [];
  static Future<bool> saveNutritionRecord(Map<String, dynamic> record) async => false;
  static Future<List<dynamic>> getNutritionRecords() async => [];

  static Future<void> syncLocalToCloud({
    required List<dynamic> localAnalyses,
    required List<dynamic> localPlans,
    required List<dynamic> localWorkouts,
    required List<dynamic> localNutrition,
  }) async {
    debugPrint('个人版无云端同步');
  }
}
