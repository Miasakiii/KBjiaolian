import 'dart:convert';
import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class ApiService {
  // 根据平台自动选择 API 地址
  static String get baseUrl {
    if (Platform.isAndroid) {
      return 'http://10.0.2.2:3001/api';
    } else if (Platform.isIOS) {
      return 'http://localhost:3001/api';
    } else {
      return 'http://localhost:3001/api';
    }
  }

  // Token 存储 key
  static const String _tokenKey = 'kb-coach-auth-token';

  // 获取存储的 token
  static Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_tokenKey);
  }

  // 保存 token
  static Future<void> saveToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_tokenKey, token);
  }

  // 清除 token
  static Future<void> clearToken() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_tokenKey);
  }

  // 带认证的请求头
  static Future<Map<String, String>> _getHeaders() async {
    final headers = <String, String>{
      'Content-Type': 'application/json',
    };
    final token = await getToken();
    if (token != null) {
      headers['Authorization'] = 'Bearer $token';
    }
    return headers;
  }

  // 注册
  static Future<Map<String, dynamic>> register({
    required String email,
    required String password,
    String? nickname,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/register'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'email': email,
        'password': password,
        if (nickname != null) 'nickname': nickname,
      }),
    );

    final data = jsonDecode(response.body);
    if (response.statusCode == 201) {
      await saveToken(data['token']);
      return data;
    } else {
      throw Exception(data['error'] ?? '注册失败');
    }
  }

  // 登录
  static Future<Map<String, dynamic>> login({
    required String email,
    required String password,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'email': email,
        'password': password,
      }),
    );

    final data = jsonDecode(response.body);
    if (response.statusCode == 200) {
      await saveToken(data['token']);
      return data;
    } else {
      throw Exception(data['error'] ?? '登录失败');
    }
  }

  // 登出
  static Future<void> logout() async {
    await clearToken();
  }

  // 检查是否已登录
  static Future<bool> isAuthenticated() async {
    final token = await getToken();
    return token != null;
  }

  // 获取用户信息
  static Future<Map<String, dynamic>> getProfile() async {
    final headers = await _getHeaders();
    final response = await http.get(
      Uri.parse('$baseUrl/auth/profile'),
      headers: headers,
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else if (response.statusCode == 401) {
      await clearToken();
      throw Exception('登录已过期');
    } else {
      throw Exception('获取用户信息失败');
    }
  }

  // 通用认证 POST 请求
  static Future<Map<String, dynamic>?> authenticatedPost(
    String path, {
    required Map<String, dynamic> body,
  }) async {
    final headers = await _getHeaders();
    final response = await http.post(
      Uri.parse('$baseUrl$path'),
      headers: headers,
      body: jsonEncode(body),
    );

    if (response.statusCode == 200 || response.statusCode == 201) {
      return jsonDecode(response.body);
    } else if (response.statusCode == 401) {
      throw Exception('请先登录');
    } else {
      debugPrint('API 请求失败: ${response.statusCode} ${response.body}');
      return null;
    }
  }

  // 通用认证 GET 请求（返回列表）
  static Future<List<dynamic>> authenticatedGetList(String path) async {
    final headers = await _getHeaders();
    final response = await http.get(
      Uri.parse('$baseUrl$path'),
      headers: headers,
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      if (data is Map && data.containsKey('records')) {
        return data['records'] ?? [];
      }
      if (data is List) return data;
      return [];
    } else if (response.statusCode == 401) {
      throw Exception('请先登录');
    } else {
      debugPrint('API 请求失败: ${response.statusCode} ${response.body}');
      return [];
    }
  }

  // 体态分析
  static Future<Map<String, dynamic>> analyzePhoto(File imageFile) async {
    final bytes = await imageFile.readAsBytes();
    final base64Image = 'data:image/jpeg;base64,${base64Encode(bytes)}';
    final headers = await _getHeaders();

    final response = await http.post(
      Uri.parse('$baseUrl/analyze'),
      headers: headers,
      body: jsonEncode({'image': base64Image}),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else if (response.statusCode == 401) {
      throw Exception('请先登录');
    } else {
      throw Exception('分析失败: ${response.body}');
    }
  }

  // 生成训练方案
  static Future<Map<String, dynamic>> generatePlan({
    required String goal,
    required String experience,
    required String equipment,
    required int daysPerWeek,
    required int sessionDuration,
    required Map<String, dynamic> analysisResult,
  }) async {
    final headers = await _getHeaders();

    final response = await http.post(
      Uri.parse('$baseUrl/plan/generate'),
      headers: headers,
      body: jsonEncode({
        'goal': goal,
        'experience': experience,
        'equipment': equipment,
        'daysPerWeek': daysPerWeek,
        'sessionDuration': sessionDuration,
        'analysisResult': analysisResult,
      }),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else if (response.statusCode == 401) {
      throw Exception('请先登录');
    } else {
      throw Exception('生成方案失败: ${response.body}');
    }
  }

  // 饮食识别
  static Future<Map<String, dynamic>> analyzeFood(File imageFile) async {
    final bytes = await imageFile.readAsBytes();
    final base64Image = 'data:image/jpeg;base64,${base64Encode(bytes)}';
    final headers = await _getHeaders();

    final response = await http.post(
      Uri.parse('$baseUrl/nutrition/analyze'),
      headers: headers,
      body: jsonEncode({'image': base64Image}),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else if (response.statusCode == 401) {
      throw Exception('请先登录');
    } else {
      throw Exception('识别失败: ${response.body}');
    }
  }

  // AI 对话
  static Future<String> sendMessage(String message, List<Map<String, String>> history) async {
    final headers = await _getHeaders();

    final response = await http.post(
      Uri.parse('$baseUrl/chat'),
      headers: headers,
      body: jsonEncode({
        'message': message,
        'history': history,
      }),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return data['reply'];
    } else if (response.statusCode == 401) {
      throw Exception('请先登录');
    } else {
      throw Exception('对话失败: ${response.body}');
    }
  }

  // 健康检查
  static Future<bool> healthCheck() async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/health'));
      return response.statusCode == 200;
    } catch (e) {
      return false;
    }
  }
}
