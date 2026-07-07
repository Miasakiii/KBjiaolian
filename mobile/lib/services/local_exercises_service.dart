import 'dart:async';
import 'dart:convert';
import 'package:flutter/services.dart' show rootBundle;

/// 本地动作库服务 —— 从 assets/exercises.json 加载 1324 条动作数据到内存，
/// 提供列表/详情/搜索/元数据查询，完全离线，无需后端。
///
/// 数据来源：https://github.com/hasaneyldrm/exercises-dataset
class LocalExercisesService {
  static const String _assetPath = 'assets/exercises.json';

  static List<Map<String, dynamic>>? _cache;
  static Future<void>? _loadingFuture;

  /// 确保数据已加载（多次调用安全，只加载一次）
  static Future<void> ensureLoaded() {
    if (_cache != null) return Future.value();
    if (_loadingFuture != null) return _loadingFuture!;
    _loadingFuture = _load();
    return _loadingFuture!;
  }

  static Future<void> _load() async {
    try {
      final raw = await rootBundle.loadString(_assetPath);
      final List<dynamic> list = jsonDecode(raw);
      _cache = list.cast<Map<String, dynamic>>();
    } catch (e) {
      _loadingFuture = null; // 允许重试
      rethrow;
    }
  }

  /// 获取元数据（筛选选项聚合）
  static Future<Map<String, dynamic>> getMeta() async {
    await ensureLoaded();
    final data = _cache!;

    final bodyPartCounts = <String, int>{};
    final equipmentCounts = <String, int>{};
    final targetCounts = <String, int>{};

    for (final ex in data) {
      final bp = (ex['body_part'] ?? ex['category']) as String?;
      if (bp != null && bp.isNotEmpty) {
        bodyPartCounts[bp] = (bodyPartCounts[bp] ?? 0) + 1;
      }
      final eq = ex['equipment'] as String?;
      if (eq != null && eq.isNotEmpty) {
        equipmentCounts[eq] = (equipmentCounts[eq] ?? 0) + 1;
      }
      final tg = ex['target'] as String?;
      if (tg != null && tg.isNotEmpty) {
        targetCounts[tg] = (targetCounts[tg] ?? 0) + 1;
      }
    }

    // 按数量降序排序
    List<Map<String, dynamic>> toList(Map<String, int> m) {
      final entries = m.entries.toList()
        ..sort((a, b) => b.value.compareTo(a.value));
      return entries
          .map((e) => {'value': e.key, 'count': e.value})
          .toList();
    }

    return {
      'bodyParts': toList(bodyPartCounts),
      'equipment': toList(equipmentCounts),
      'targets': toList(targetCounts),
    };
  }

  /// 分页列表 + 筛选
  static Future<Map<String, dynamic>> list({
    String? bodyPart,
    String? equipment,
    String? target,
    int page = 1,
    int pageSize = 20,
  }) async {
    await ensureLoaded();
    final data = _cache!;

    // 筛选
    List<Map<String, dynamic>> filtered = data.where((ex) {
      if (bodyPart != null && bodyPart.isNotEmpty) {
        final bp = (ex['body_part'] ?? ex['category']) as String?;
        if (bp != bodyPart) return false;
      }
      if (equipment != null && equipment.isNotEmpty) {
        if (ex['equipment'] != equipment) return false;
      }
      if (target != null && target.isNotEmpty) {
        if (ex['target'] != target) return false;
      }
      return true;
    }).toList();

    // 按名称排序
    filtered.sort((a, b) {
      final na = (a['name'] as String?) ?? '';
      final nb = (b['name'] as String?) ?? '';
      return na.toLowerCase().compareTo(nb.toLowerCase());
    });

    final total = filtered.length;
    final totalPages = (total / pageSize).ceil();
    final start = (page - 1) * pageSize;
    final end = start + pageSize > total ? total : start + pageSize;
    final items = start >= total ? <Map<String, dynamic>>[] : filtered.sublist(start, end);

    return {
      'page': page,
      'pageSize': pageSize,
      'total': total,
      'totalPages': totalPages,
      'items': items.map(_formatListItem).toList(),
    };
  }

  /// 搜索（名称/目标肌群/肌群模糊匹配）
  static Future<Map<String, dynamic>> search({
    required String q,
    int page = 1,
    int pageSize = 20,
  }) async {
    await ensureLoaded();
    final data = _cache!;
    final query = q.toLowerCase().trim();
    if (query.isEmpty) {
      return {'q': q, 'page': page, 'pageSize': pageSize, 'total': 0, 'totalPages': 0, 'items': <dynamic>[]};
    }

    // 前缀匹配优先
    final prefixMatches = <Map<String, dynamic>>[];
    final otherMatches = <Map<String, dynamic>>[];

    for (final ex in data) {
      final name = ((ex['name'] as String?) ?? '').toLowerCase();
      final target = ((ex['target'] as String?) ?? '').toLowerCase();
      final muscleGroup = ((ex['muscle_group'] as String?) ?? '').toLowerCase();

      bool match = false;
      bool prefix = false;
      if (name.contains(query)) {
        match = true;
        if (name.startsWith(query)) prefix = true;
      } else if (target.contains(query) || muscleGroup.contains(query)) {
        match = true;
      }

      if (match) {
        if (prefix) {
          prefixMatches.add(ex);
        } else {
          otherMatches.add(ex);
        }
      }
    }

    final all = [...prefixMatches, ...otherMatches];
    final total = all.length;
    final totalPages = (total / pageSize).ceil();
    final start = (page - 1) * pageSize;
    final end = start + pageSize > total ? total : start + pageSize;
    final items = start >= total ? <Map<String, dynamic>>[] : all.sublist(start, end);

    return {
      'q': q,
      'page': page,
      'pageSize': pageSize,
      'total': total,
      'totalPages': totalPages,
      'items': items.map(_formatListItem).toList(),
    };
  }

  /// 详情
  static Future<Map<String, dynamic>?> getById(String id) async {
    await ensureLoaded();
    final data = _cache!;
    for (final ex in data) {
      if (ex['id']?.toString() == id) {
        return _formatDetailItem(ex);
      }
    }
    return null;
  }

  static Map<String, dynamic> _formatListItem(Map<String, dynamic> ex) {
    return {
      'id': ex['id'],
      'name': ex['name'],
      'bodyPart': ex['body_part'] ?? ex['category'],
      'equipment': ex['equipment'],
      'target': ex['target'],
      'muscleGroup': ex['muscle_group'],
    };
  }

  static Map<String, dynamic> _formatDetailItem(Map<String, dynamic> ex) {
    final secondary = ex['secondary_muscles'];
    return {
      'id': ex['id'],
      'name': ex['name'],
      'category': ex['category'],
      'bodyPart': ex['body_part'] ?? ex['category'],
      'equipment': ex['equipment'],
      'target': ex['target'],
      'muscleGroup': ex['muscle_group'],
      'secondaryMuscles': secondary is List ? secondary : [],
      'instructions': ex['instructions'] ?? {},
      'mediaId': ex['media_id'],
      'createdAt': ex['created_at'],
    };
  }
}
