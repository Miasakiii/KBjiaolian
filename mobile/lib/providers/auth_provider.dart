import 'package:flutter/material.dart';

import '../services/api_service.dart';

class AuthProvider extends ChangeNotifier {
  bool _isAuthenticated = false;
  bool _isLoading = true;
  Map<String, dynamic>? _user;
  String? _error;

  bool get isAuthenticated => _isAuthenticated;
  bool get isLoading => _isLoading;
  Map<String, dynamic>? get user => _user;
  String get nickname => _user?['nickname'] as String? ?? _user?['email'] as String? ?? '用户';
  String? get email => _user?['email'] as String?;
  String? get error => _error;

  AuthProvider() {
    _checkAuth();
  }

  Future<void> _checkAuth() async {
    _isLoading = true;
    notifyListeners();

    try {
      _isAuthenticated = await ApiService.isAuthenticated();
      if (_isAuthenticated) {
        // 后端 /auth/profile 直接返回用户对象（不带 user 包装）
        final result = await ApiService.getProfile();
        final user = result['user'];
        if (user is Map<String, dynamic>) {
          _user = user;
        } else if (result.isNotEmpty) {
          _user = result;
        } else {
          // profile 为空时退化为最小信息
          _user = <String, dynamic>{};
        }
      }
    } catch (e) {
      _isAuthenticated = false;
      _user = null;
      debugPrint('检查认证状态失败: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> register({
    required String email,
    required String password,
    String? nickname,
  }) async {
    if (_isLoading) return false; // 防止重复请求
    _error = null;
    _isLoading = true;
    notifyListeners();

    try {
      final result = await ApiService.register(
        email: email,
        password: password,
        nickname: nickname,
      );
      _isAuthenticated = true;
      final user = result['user'];
      _user = user is Map<String, dynamic>
          ? Map<String, dynamic>.from(user)
          : <String, dynamic>{'email': email};
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString().replaceFirst('Exception: ', '');
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> login({
    required String email,
    required String password,
  }) async {
    if (_isLoading) return false; // 防止重复请求
    _error = null;
    _isLoading = true;
    notifyListeners();

    try {
      final result = await ApiService.login(
        email: email,
        password: password,
      );
      _isAuthenticated = true;
      final user = result['user'];
      _user = user is Map<String, dynamic>
          ? Map<String, dynamic>.from(user)
          : <String, dynamic>{'email': email};
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString().replaceFirst('Exception: ', '');
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<void> logout() async {
    try {
      await ApiService.logout();
    } catch (e) {
      debugPrint('登出错误: $e');
    } finally {
      _isAuthenticated = false;
      _user = null;
      _error = null;
      notifyListeners();
    }
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
}
