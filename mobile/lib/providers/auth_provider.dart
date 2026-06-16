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
  String? get nickname => _user?['nickname'] ?? _user?['email'] ?? '用户';
  String? get email => _user?['email'];
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
        final result = await ApiService.getProfile();
        _user = result['user'];
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
      _user = result['user'];
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
    _error = null;
    _isLoading = true;
    notifyListeners();

    try {
      final result = await ApiService.login(
        email: email,
        password: password,
      );
      _isAuthenticated = true;
      _user = result['user'];
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
    await ApiService.logout();
    _isAuthenticated = false;
    _user = null;
    notifyListeners();
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
}
