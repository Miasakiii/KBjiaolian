import 'package:flutter/material.dart';

import '../models/analysis_result.dart';
import '../services/api_service.dart';
import '../services/storage_service.dart';

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

  /// 今日是否已完成体态分析
  bool get hasAnalyzedToday {
    final now = DateTime.now();
    final todayStart = DateTime(now.year, now.month, now.day);
    for (final r in _history) {
      if (r is Map) {
        final ts = r['timestamp']?.toString() ?? '';
        final date = DateTime.tryParse(ts);
        if (date != null && date.isAfter(todayStart)) return true;
      }
    }
    return false;
  }

  AnalysisProvider() {
    _loadHistory();
  }

  Future<void> _loadHistory() async {
    // 个人版：仅本地存储
    _history = StorageService.getAnalysisRecords();

    if (_history.isNotEmpty) {
      try {
        final first = _history.first;
        // 响应可能是 {result: {...}} 或直接 {...}，兼容两种结构
        final raw = first is Map ? (first['result'] ?? first) : null;
        if (raw is Map) {
          _currentResult = AnalysisResult.fromJson(
            Map<String, dynamic>.from(raw),
          );
        }
      } catch (e) {
        debugPrint('加载历史记录失败: $e');
      }
    }
    notifyListeners();
  }

  Future<void> analyzePhoto(dynamic imageFile) async {
    // 防止重入：UI 已用 isAnalyzing 禁用按钮，但 provider 层也兜底
    if (_isAnalyzing) return;
    _isAnalyzing = true;
    _error = null;
    notifyListeners();

    try {
      final result = await ApiService.analyzePhoto(imageFile);
      _currentResult = AnalysisResult.fromJson(result);

      // 保存到本地
      final record = {
        'id': DateTime.now().millisecondsSinceEpoch.toString(),
        'timestamp': DateTime.now().toIso8601String(),
        'result': _currentResult!.toJson(),
      };
      await StorageService.saveAnalysisRecord(record);

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

  Future<void> clearHistory() async {
    await StorageService.saveList('analysis_records', []);
    _history = [];
    _currentResult = null;
    notifyListeners();
  }
}
