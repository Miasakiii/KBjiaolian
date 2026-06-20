import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

class StorageService {
  static late SharedPreferences _prefs;

  static Future<void> init() async {
    _prefs = await SharedPreferences.getInstance();
  }

  // 通用存储方法
  static Future<void> save(String key, dynamic value) async {
    if (value is String) {
      await _prefs.setString(key, value);
    } else if (value is int) {
      await _prefs.setInt(key, value);
    } else if (value is double) {
      await _prefs.setDouble(key, value);
    } else if (value is bool) {
      await _prefs.setBool(key, value);
    } else {
      await _prefs.setString(key, jsonEncode(value));
    }
  }

  static dynamic get(String key, {dynamic defaultValue}) {
    return _prefs.get(key) ?? defaultValue;
  }

  static String getString(String key, {String defaultValue = ''}) {
    return _prefs.getString(key) ?? defaultValue;
  }

  static int getInt(String key, {int defaultValue = 0}) {
    return _prefs.getInt(key) ?? defaultValue;
  }

  static bool getBool(String key, {bool defaultValue = false}) {
    return _prefs.getBool(key) ?? defaultValue;
  }

  static Future<void> remove(String key) async {
    await _prefs.remove(key);
  }

  static Future<void> clear() async {
    await _prefs.clear();
  }

  // JSON 存储
  static Future<void> saveJson(String key, Map<String, dynamic> value) async {
    await _prefs.setString(key, jsonEncode(value));
  }

  static Map<String, dynamic>? getJson(String key) {
    final str = _prefs.getString(key);
    if (str == null || str.isEmpty) return null;
    try {
      final decoded = jsonDecode(str);
      if (decoded is Map<String, dynamic>) return decoded;
      if (decoded is Map) return Map<String, dynamic>.from(decoded);
      return null;
    } catch (e) {
      debugPrint('StorageService.getJson 解码 $key 失败: $e');
      return null;
    }
  }

  // 列表存储
  static Future<void> saveList(String key, List<dynamic> value) async {
    await _prefs.setString(key, jsonEncode(value));
  }

  static List<dynamic> getList(String key) {
    final str = _prefs.getString(key);
    if (str == null || str.isEmpty) return [];
    try {
      final decoded = jsonDecode(str);
      if (decoded is List) return decoded;
      return [];
    } catch (e) {
      debugPrint('StorageService.getList 解码 $key 失败: $e');
      return [];
    }
  }

  // 分析记录
  static Future<void> saveAnalysisRecord(Map<String, dynamic> record) async {
    final records = getAnalysisRecords();
    records.insert(0, record);
    await saveList('analysis_records', records);
  }

  static List<dynamic> getAnalysisRecords() {
    return getList('analysis_records');
  }

  // 训练记录
  static Future<void> saveWorkoutRecord(Map<String, dynamic> record) async {
    final records = getWorkoutRecords();
    records.insert(0, record);
    await saveList('workout_records', records);
  }

  static List<dynamic> getWorkoutRecords() {
    return getList('workout_records');
  }

  // 饮食记录
  static Future<void> saveNutritionRecord(Map<String, dynamic> record) async {
    final records = getNutritionRecords();
    records.insert(0, record);
    await saveList('nutrition_records', records);
  }

  static List<dynamic> getNutritionRecords() {
    return getList('nutrition_records');
  }

  // 训练方案
  static Future<void> savePlan(Map<String, dynamic> plan) async {
    final plans = getPlans();
    plans.insert(0, plan);
    await saveList('plans', plans);
  }

  static List<dynamic> getPlans() {
    return getList('plans');
  }

  // 用户配置
  static Future<void> saveUserProfile(Map<String, dynamic> profile) async {
    await saveJson('user_profile', profile);
  }

  static Map<String, dynamic> getUserProfile() {
    return getJson('user_profile') ?? {};
  }

  // 用户目标
  static Future<void> saveUserGoals(Map<String, dynamic> goals) async {
    await saveJson('user_goals', goals);
  }

  static Map<String, dynamic> getUserGoals() {
    return getJson('user_goals') ?? {};
  }
}
