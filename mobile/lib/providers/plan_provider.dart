import 'package:flutter/material.dart';

import '../services/api_service.dart';
import '../services/storage_service.dart';
import '../services/cloud_storage_service.dart';

class PlanProvider extends ChangeNotifier {
  Map<String, dynamic>? _currentPlan;
  bool _isGenerating = false;
  String? _error;
  List<dynamic> _plans = [];

  Map<String, dynamic>? get currentPlan => _currentPlan;
  bool get isGenerating => _isGenerating;
  String? get error => _error;
  List<dynamic> get plans => _plans;

  PlanProvider() {
    _loadPlans();
  }

  Future<void> _loadPlans() async {
    // 先加载本地数据
    _plans = StorageService.getPlans();

    // 如果已登录，尝试从云端加载
    try {
      if (await ApiService.isAuthenticated()) {
        final cloudPlans = await CloudStorageService.getPlans();
        if (cloudPlans.isNotEmpty) {
          _plans = cloudPlans;
        }
      }
    } catch (e) {
      debugPrint('云端加载训练方案失败: $e');
    }

    if (_plans.isNotEmpty) {
      _currentPlan = _plans.first;
    }
    notifyListeners();
  }

  Future<void> generatePlan({
    required String goal,
    required String experience,
    required String equipment,
    required int daysPerWeek,
    required int sessionDuration,
    required Map<String, dynamic> analysisResult,
  }) async {
    _isGenerating = true;
    _error = null;
    notifyListeners();

    try {
      final result = await ApiService.generatePlan(
        goal: goal,
        experience: experience,
        equipment: equipment,
        daysPerWeek: daysPerWeek,
        sessionDuration: sessionDuration,
        analysisResult: analysisResult,
      );

      _currentPlan = result;

      // 保存到本地
      await StorageService.savePlan(result);

      // 保存到云端
      await CloudStorageService.savePlan(result);

      _plans = StorageService.getPlans();
    } catch (e) {
      _error = e.toString();
      debugPrint('生成方案失败: $e');
    } finally {
      _isGenerating = false;
      notifyListeners();
    }
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }

  Future<void> clearPlans() async {
    await StorageService.saveList('training_plans', []);
    _plans = [];
    _currentPlan = null;
    notifyListeners();
  }
}
