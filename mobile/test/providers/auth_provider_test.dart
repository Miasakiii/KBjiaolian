import 'package:flutter_test/flutter_test.dart';
import 'package:mockito/annotations.dart';
import 'package:mockito/mockito.dart';
import 'package:kb_coach/providers/auth_provider.dart';
import 'package:kb_coach/services/api_service.dart';
import 'package:kb_coach/models/user.dart';

import 'auth_provider_test.mocks.dart';

@GenerateMocks([ApiService])
void main() {
  late AuthProvider authProvider;
  late MockApiService mockApiService;

  setUp(() {
    mockApiService = MockApiService();
    authProvider = AuthProvider(apiService: mockApiService);
  });

  group('AuthProvider', () {
    test('初始状态应该是未认证', () {
      expect(authProvider.isAuthenticated, false);
      expect(authProvider.user, null);
      expect(authProvider.isLoading, false);
    });

    test('login 应该设置用户和认证状态', () async {
      final user = User(
        id: 1,
        username: 'testuser',
        nickname: '测试用户',
        createdAt: DateTime.now(),
      );

      when(mockApiService.login('testuser', 'password123'))
          .thenAnswer((_) async => {'token': 'test-token', 'user': user.toJson()});

      await authProvider.login('testuser', 'password123');

      expect(authProvider.isAuthenticated, true);
      expect(authProvider.user?.username, 'testuser');
      expect(authProvider.user?.nickname, '测试用户');
    });

    test('login 应该在失败时抛出异常', () async {
      when(mockApiService.login('testuser', 'wrong-password'))
          .thenThrow(Exception('用户名或密码错误'));

      expect(
        () => authProvider.login('testuser', 'wrong-password'),
        throwsException,
      );

      expect(authProvider.isAuthenticated, false);
      expect(authProvider.user, null);
    });

    test('register 应该创建新用户', () async {
      final user = User(
        id: 2,
        username: 'newuser',
        nickname: '新用户',
        createdAt: DateTime.now(),
      );

      when(mockApiService.register('newuser', 'password123', '新用户'))
          .thenAnswer((_) async => {'token': 'new-token', 'user': user.toJson()});

      await authProvider.register('newuser', 'password123', '新用户');

      expect(authProvider.isAuthenticated, true);
      expect(authProvider.user?.username, 'newuser');
    });

    test('logout 应该清除用户状态', () async {
      // 先登录
      final user = User(
        id: 1,
        username: 'testuser',
        nickname: '测试用户',
        createdAt: DateTime.now(),
      );

      when(mockApiService.login('testuser', 'password123'))
          .thenAnswer((_) async => {'token': 'test-token', 'user': user.toJson()});

      await authProvider.login('testuser', 'password123');
      expect(authProvider.isAuthenticated, true);

      // 登出
      await authProvider.logout();

      expect(authProvider.isAuthenticated, false);
      expect(authProvider.user, null);
    });

    test('updateProfile 应该更新用户信息', () async {
      // 先登录
      final user = User(
        id: 1,
        username: 'testuser',
        nickname: '测试用户',
        createdAt: DateTime.now(),
      );

      when(mockApiService.login('testuser', 'password123'))
          .thenAnswer((_) async => {'token': 'test-token', 'user': user.toJson()});

      await authProvider.login('testuser', 'password123');

      // 更新资料
      when(mockApiService.updateProfile({'nickname': '新昵称'}))
          .thenAnswer((_) async => User(
                id: 1,
                username: 'testuser',
                nickname: '新昵称',
                createdAt: user.createdAt,
              ).toJson());

      await authProvider.updateProfile({'nickname': '新昵称'});

      expect(authProvider.user?.nickname, '新昵称');
    });

    test('isLoading 应该在异步操作期间为 true', () async {
      final user = User(
        id: 1,
        username: 'testuser',
        nickname: '测试用户',
        createdAt: DateTime.now(),
      );

      when(mockApiService.login('testuser', 'password123'))
          .thenAnswer((_) async {
        await Future.delayed(const Duration(milliseconds: 100));
        return {'token': 'test-token', 'user': user.toJson()};
      });

      // 在异步操作期间检查 isLoading
      final loginFuture = authProvider.login('testuser', 'password123');

      // 等待一小段时间让异步操作开始
      await Future.delayed(const Duration(milliseconds: 50));

      expect(authProvider.isLoading, true);

      await loginFuture;

      expect(authProvider.isLoading, false);
    });
  });
}
