import 'dart:convert';
import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class ApiService {
  // 优先使用编译时通过 --dart-define=API_BASE_URL=... 注入的地址
  // 开发默认仍指向本机后端方便调试；生产构建时务必通过 --dart-define 指定 HTTPS 地址
  static const String _envBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: '',
  );

  static String get baseUrl {
    if (_envBaseUrl.isNotEmpty) return _envBaseUrl;
    // 开发回退：根据平台选择本机地址
    if (Platform.isAndroid) {
      return 'http://10.0.2.2:3001/api';
    } else if (Platform.isIOS) {
      return 'http://localhost:3001/api';
    } else {
      return 'http://localhost:3001/api';
    }
  }

  // 请求默认超时
  static const Duration _defaultTimeout = Duration(seconds: 30);

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

  // 安全解析 JSON：网络异常/非 JSON/空响应/格式错误都转为友好异常
  static Map<String, dynamic> _parseJsonObject(http.Response response) {
    if (response.body.isEmpty) {
      throw Exception('服务器返回空响应（${response.statusCode}）');
    }
    dynamic decoded;
    try {
      decoded = jsonDecode(response.body);
    } catch (_) {
      throw Exception('服务器返回了非 JSON 响应（${response.statusCode}）');
    }
    if (decoded is! Map<String, dynamic>) {
      throw Exception('响应格式错误（${response.statusCode}）');
    }
    return decoded;
  }

  // 提取并抛出包含 error 字段的内容
  static Never _throwFromResponse(Map<String, dynamic> data, int statusCode, String fallback) {
    final err = data['error'];
    throw Exception(err != null ? err.toString() : '$fallback（$statusCode）');
  }

  // 注册
  static Future<Map<String, dynamic>> register({
    required String email,
    required String password,
    String? nickname,
  }) async {
    final response = await http
        .post(
          Uri.parse('$baseUrl/auth/register'),
          headers: {'Content-Type': 'application/json'},
          body: jsonEncode({
            'email': email,
            'password': password,
            if (nickname != null) 'nickname': nickname,
          }),
        )
        .timeout(_defaultTimeout);

    final data = _parseJsonObject(response);
    if (response.statusCode == 201) {
      await saveToken(data['token']);
      return data;
    } else {
      _throwFromResponse(data, response.statusCode, '注册失败');
    }
  }

  // 登录
  static Future<Map<String, dynamic>> login({
    required String email,
    required String password,
  }) async {
    final response = await http
        .post(
          Uri.parse('$baseUrl/auth/login'),
          headers: {'Content-Type': 'application/json'},
          body: jsonEncode({
            'email': email,
            'password': password,
          }),
        )
        .timeout(_defaultTimeout);

    final data = _parseJsonObject(response);
    if (response.statusCode == 200) {
      await saveToken(data['token']);
      return data;
    } else {
      _throwFromResponse(data, response.statusCode, '登录失败');
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
    final response = await http
        .get(
          Uri.parse('$baseUrl/auth/profile'),
          headers: headers,
        )
        .timeout(_defaultTimeout);

    final data = _parseJsonObject(response);
    if (response.statusCode == 200) {
      return data;
    } else if (response.statusCode == 401) {
      await clearToken();
      throw Exception('登录已过期');
    } else {
      _throwFromResponse(data, response.statusCode, '获取用户信息失败');
    }
  }

  // 通用认证 POST 请求
  static Future<Map<String, dynamic>?> authenticatedPost(
    String path, {
    required Map<String, dynamic> body,
  }) async {
    final headers = await _getHeaders();
    final response = await http
        .post(
          Uri.parse('$baseUrl$path'),
          headers: headers,
          body: jsonEncode(body),
        )
        .timeout(_defaultTimeout);

    if (response.statusCode == 200 || response.statusCode == 201) {
      return _parseJsonObject(response);
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
    final response = await http
        .get(
          Uri.parse('$baseUrl$path'),
          headers: headers,
        )
        .timeout(_defaultTimeout);

    if (response.statusCode == 200) {
      if (response.body.isEmpty) return [];
      dynamic decoded;
      try {
        decoded = jsonDecode(response.body);
      } catch (_) {
        return [];
      }
      if (decoded is Map && decoded.containsKey('records')) {
        final records = decoded['records'];
        return records is List ? records : <dynamic>[];
      }
      if (decoded is List) return decoded;
      return [];
    } else if (response.statusCode == 401) {
      throw Exception('请先登录');
    } else {
      debugPrint('API 请求失败: ${response.statusCode} ${response.body}');
      return [];
    }
  }

  // 通用认证 DELETE 请求
  static Future<bool> authenticatedDelete(String path) async {
    final headers = await _getHeaders();
    final response = await http
        .delete(
          Uri.parse('$baseUrl$path'),
          headers: headers,
        )
        .timeout(_defaultTimeout);

    if (response.statusCode == 200 || response.statusCode == 204) {
      return true;
    } else if (response.statusCode == 401) {
      throw Exception('请先登录');
    } else {
      debugPrint('API 请求失败: ${response.statusCode} ${response.body}');
      return false;
    }
  }

  // 体态分析
  static Future<Map<String, dynamic>> analyzePhoto(File imageFile) async {
    final bytes = await imageFile.readAsBytes();
    final base64Image = 'data:image/jpeg;base64,${base64Encode(bytes)}';
    final headers = await _getHeaders();

    final response = await http
        .post(
          Uri.parse('$baseUrl/analyze'),
          headers: headers,
          body: jsonEncode({'image': base64Image}),
        )
        .timeout(const Duration(seconds: 90));

    final data = _parseJsonObject(response);
    if (response.statusCode == 200) {
      return data;
    } else if (response.statusCode == 401) {
      throw Exception('请先登录');
    } else {
      _throwFromResponse(data, response.statusCode, '分析失败');
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

    final response = await http
        .post(
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
        )
        .timeout(const Duration(seconds: 90));

    final data = _parseJsonObject(response);
    if (response.statusCode == 200) {
      return data;
    } else if (response.statusCode == 401) {
      throw Exception('请先登录');
    } else {
      _throwFromResponse(data, response.statusCode, '生成方案失败');
    }
  }

  // 饮食识别
  static Future<Map<String, dynamic>> analyzeFood(File imageFile) async {
    final bytes = await imageFile.readAsBytes();
    final base64Image = 'data:image/jpeg;base64,${base64Encode(bytes)}';
    final headers = await _getHeaders();

    final response = await http
        .post(
          Uri.parse('$baseUrl/nutrition/analyze'),
          headers: headers,
          body: jsonEncode({'image': base64Image}),
        )
        .timeout(const Duration(seconds: 90));

    final data = _parseJsonObject(response);
    if (response.statusCode == 200) {
      return data;
    } else if (response.statusCode == 401) {
      throw Exception('请先登录');
    } else {
      _throwFromResponse(data, response.statusCode, '识别失败');
    }
  }

  // AI 对话
  static Future<String> sendMessage(String message, List<Map<String, String>> history) async {
    final headers = await _getHeaders();

    final response = await http
        .post(
          Uri.parse('$baseUrl/chat'),
          headers: headers,
          body: jsonEncode({
            'message': message,
            'history': history,
          }),
        )
        .timeout(_defaultTimeout);

    final data = _parseJsonObject(response);
    if (response.statusCode == 200) {
      final reply = data['reply'];
      if (reply is! String || reply.isEmpty) {
        throw Exception('服务器返回内容为空');
      }
      return reply;
    } else if (response.statusCode == 401) {
      throw Exception('请先登录');
    } else {
      _throwFromResponse(data, response.statusCode, '对话失败');
    }
  }

  // 健康检查
  static Future<bool> healthCheck() async {
    try {
      final response = await http
          .get(Uri.parse('$baseUrl/health'))
          .timeout(_defaultTimeout);
      return response.statusCode == 200;
    } catch (e) {
      return false;
    }
  }

  // 渐进式训练方案（基于历史数据自适应）
  static Future<Map<String, dynamic>> generateProgressivePlan({
    required String goal,
    required String experience,
    required String equipment,
    required int daysPerWeek,
    required int sessionDuration,
    required Map<String, dynamic> analysisResult,
  }) async {
    final headers = await _getHeaders();

    final response = await http
        .post(
          Uri.parse('$baseUrl/plan/progressive'),
          headers: headers,
          body: jsonEncode({
            'goal': goal,
            'experience': experience,
            'equipment': equipment,
            'daysPerWeek': daysPerWeek,
            'sessionDuration': sessionDuration,
            'analysisResult': analysisResult,
          }),
        )
        .timeout(const Duration(seconds: 90));

    final data = _parseJsonObject(response);
    if (response.statusCode == 200) {
      return data;
    } else if (response.statusCode == 401) {
      throw Exception('请先登录');
    } else {
      _throwFromResponse(data, response.statusCode, '生成方案失败');
    }
  }

  // 获取渐进式训练建议
  static Future<Map<String, dynamic>> getProgressionAdvice({
    String experience = 'beginner',
  }) async {
    final headers = await _getHeaders();

    final response = await http
        .get(
          Uri.parse('$baseUrl/plan/progression').replace(
            queryParameters: {'experience': experience},
          ),
          headers: headers,
        )
        .timeout(_defaultTimeout);

    final data = _parseJsonObject(response);
    if (response.statusCode == 200) {
      return data;
    } else if (response.statusCode == 401) {
      throw Exception('请先登录');
    } else {
      _throwFromResponse(data, response.statusCode, '获取建议失败');
    }
  }

  // 前后对比分析
  static Future<Map<String, dynamic>> compareAnalysis({
    required String beforeId,
    required String afterId,
  }) async {
    final headers = await _getHeaders();

    final response = await http
        .post(
          Uri.parse('$baseUrl/analyze/compare'),
          headers: headers,
          body: jsonEncode({
            'beforeId': beforeId,
            'afterId': afterId,
          }),
        )
        .timeout(const Duration(seconds: 90));

    final data = _parseJsonObject(response);
    if (response.statusCode == 200) {
      return data;
    } else if (response.statusCode == 401) {
      throw Exception('请先登录');
    } else {
      _throwFromResponse(data, response.statusCode, '对比分析失败');
    }
  }
}
