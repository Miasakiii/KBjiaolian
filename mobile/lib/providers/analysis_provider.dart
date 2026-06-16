import 'package:flutter/material.dart';

import '../models/analysis_result.dart';
import '../services/api_service.dart';
import '../services/storage_service.dart';
import '../services/cloud_storage_service.dart';

class AnalysisProvider extends ChangeNotifier {
  AnalysisResult? _currentResult;
  bool _isAnalyzing = false;
  String? _error;
  List<dynamic> _history = [];

  AnalysisResult? get currentResult => _currentResult;
  bool get isAnalyzing => _isAnalyzing;
  String? get error => _error;
  List<dynamic> get history => _history;
  int? get latestScore => _currentResult?.score;

  AnalysisProvider() {
    _loadHistory();
  }

  Future<void> _loadHistory() async {
    // 先加载本地数据
    _history = StorageService.getAnalysisRecords();

    // 如果已登录，尝试从云端加载
    try {
      if (await ApiService.isAuthenticated()) {
        final cloudRecords = await CloudStorageService.getAnalysisRecords();
        if (cloudRecords.isNotEmpty) {
          _history = cloudRecords;
        }
      }
    } catch (e) {
      debugPrint('云端加载分析记录失败: $e');
    }

    if (_history.isNotEmpty) {
      try {
        _currentResult = AnalysisResult.fromJson(_history.first['result']);
      } catch (e) {
        debugPrint('加载历史记录失败: $e');
      }
    }
    notifyListeners();
  }

  Future<void> analyzePhoto(dynamic imageFile) async {
    _isAnalyzing = true;
    _error = null;
    notifyListeners();

    try {
      final result = await ApiService.analyzePhoto(imageFile);
      _currentResult = AnalysisResult.fromJson(result);

      // 保存记录
      final record = {
        'id': DateTime.now().millisecondsSinceEpoch.toString(),
        'timestamp': DateTime.now().toIso8601String(),
        'result': _currentResult!.toJson(),
      };

      // 保存到本地
      await StorageService.saveAnalysisRecord(record);

      // 保存到云端
      await CloudStorageService.saveAnalysisRecord(record);

      _history = StorageService.getAnalysisRecords();
    } catch (e) {
      _error = e.toString();
      debugPrint('分析失败: $e');
    } finally {
      _isAnalyzing = false;
      notifyListeners();
    }
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }

  void clearHistory() {
    StorageService.saveList('analysis_records', []);
    _history = [];
    _currentResult = null;
    notifyListeners();
  }
}
