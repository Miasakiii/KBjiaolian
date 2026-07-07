import 'package:flutter/material.dart';

import '../services/storage_service.dart';

/// 个人版 AuthProvider —— 无登录态，永真。
/// user 信息存本地（昵称/性别/年龄等），保留旧字段与方法签名兼容 UI 调用。
class AuthProvider extends ChangeNotifier {
  bool _isAuthenticated = true; // 个人版恒真
  bool _isLoading = false;
  Map<String, dynamic>? _user;
  String? _error;

  bool get isAuthenticated => _isAuthenticated;
  bool get isLoading => _isLoading;
  Map<String, dynamic>? get user => _user;
  String get nickname => _user?['nickname'] as String? ?? '个人用户';
  String? get email => _user?['email'] as String?;
  String? get error => _error;

  AuthProvider() {
    _loadLocalUser();
  }

  // 从本地存储加载用户资料
  Future<void> _loadLocalUser() async {
    _isLoading = true;
    notifyListeners();
    try {
      final saved = StorageService.getJson('user_profile');
      if (saved != null) _user = saved;
    } catch (e) {
      debugPrint('加载本地用户资料失败: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // 更新本地用户资料（个人资料编辑页调用）
  Future<void> updateProfile(Map<String, dynamic> profile) async {
    _user = {...?_user, ...profile};
    await StorageService.saveJson('user_profile', _user!);
    notifyListeners();
  }

  // 兼容旧调用：个人版登录/注册/登出均为 no-op
  Future<bool> login({required String email, required String password}) async => true;
  Future<bool> register({required String email, required String password, String? nickname}) async => true;
  Future<void> logout() async {}

  Future<bool> forgotPassword({required String email}) async => false;
  Future<bool> resetPassword({
    required String email,
    required String code,
    required String newPassword,
  }) async => false;

  void clearError() {
    _error = null;
    notifyListeners();
  }
}
