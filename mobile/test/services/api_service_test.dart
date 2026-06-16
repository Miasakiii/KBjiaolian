import 'package:flutter_test/flutter_test.dart';
import 'package:mockito/annotations.dart';
import 'package:mockito/mockito.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

import 'package:kb_coach/services/api_service.dart';
import 'package:kb_coach/config/api_config.dart';

import 'api_service_test.mocks.dart';

@GenerateMocks([http.Client])
void main() {
  late ApiService apiService;
  late MockClient mockClient;

  setUp(() {
    mockClient = MockClient();
    apiService = ApiService(client: mockClient);
  });

  group('ApiService', () {
    group('login', () {
      test('应该返回 token 和用户数据', () async {
        final responseData = {
          'token': 'test-token',
          'user': {
            'id': 1,
            'username': 'testuser',
            'nickname': '测试用户',
          },
        };

        when(mockClient.post(
          Uri.parse('${ApiConfig.baseUrl}/auth/login'),
          headers: anyNamed('headers'),
          body: anyNamed('body'),
        )).thenAnswer((_) async => http.Response(
              jsonEncode(responseData),
              200,
            ));

        final result = await apiService.login('testuser', 'password123');

        expect(result['token'], 'test-token');
        expect(result['user']['username'], 'testuser');
      });

      test('应该在 401 时抛出异常', () async {
        when(mockClient.post(
          Uri.parse('${ApiConfig.baseUrl}/auth/login'),
          headers: anyNamed('headers'),
          body: anyNamed('body'),
        )).thenAnswer((_) async => http.Response(
              jsonEncode({'error': '用户名或密码错误'}),
              401,
            ));

        expect(
          () => apiService.login('testuser', 'wrong-password'),
          throwsException,
        );
      });
    });

    group('register', () {
      test('应该返回新用户数据', () async {
        final responseData = {
          'token': 'new-token',
          'user': {
            'id': 2,
            'username': 'newuser',
            'nickname': '新用户',
          },
        };

        when(mockClient.post(
          Uri.parse('${ApiConfig.baseUrl}/auth/register'),
          headers: anyNamed('headers'),
          body: anyNamed('body'),
        )).thenAnswer((_) async => http.Response(
              jsonEncode(responseData),
              201,
            ));

        final result = await apiService.register('newuser', 'password123', '新用户');

        expect(result['token'], 'new-token');
        expect(result['user']['username'], 'newuser');
      });
    });

    group('getPlans', () {
      test('应该返回训练计划列表', () async {
        final responseData = {
          'data': [
            {
              'id': 1,
              'title': '增肌计划',
              'content': '计划内容',
              'duration': 30,
            },
          ],
          'pagination': {
            'page': 1,
            'limit': 10,
            'total': 1,
            'totalPages': 1,
          },
        };

        when(mockClient.get(
          Uri.parse('${ApiConfig.baseUrl}/plans?page=1&limit=10'),
          headers: anyNamed('headers'),
        )).thenAnswer((_) async => http.Response(
              jsonEncode(responseData),
              200,
            ));

        final result = await apiService.getPlans(page: 1, limit: 10);

        expect(result['data'].length, 1);
        expect(result['data'][0]['title'], '增肌计划');
      });
    });

    group('createPlan', () {
      test'应该创建新计划', () async {
        final responseData = {
          'id': 2,
          'title': '新计划',
          'content': '计划内容',
          'duration': 30,
        };

        when(mockClient.post(
          Uri.parse('${ApiConfig.baseUrl}/plans'),
          headers: anyNamed('headers'),
          body: anyNamed('body'),
        )).thenAnswer((_) async => http.Response(
              jsonEncode(responseData),
              201,
            ));

        final result = await apiService.createPlan({
          'title': '新计划',
          'content': '计划内容',
          'duration': 30,
        });

        expect(result['id'], 2);
        expect(result['title'], '新计划');
      });
    });

    group('analyze', () {
      test('应该返回分析结果', () async {
        final responseData = {
          'analysis': '分析结果内容',
          'score': 85,
        };

        when(mockClient.post(
          Uri.parse('${ApiConfig.baseUrl}/analyze'),
          headers: anyNamed('headers'),
          body: anyNamed('body'),
        )).thenAnswer((_) async => http.Response(
              jsonEncode(responseData),
              200,
            ));

        final result = await apiService.analyze(
          type: 'posture',
          imageData: 'base64-encoded-image',
        );

        expect(result['analysis'], '分析结果内容');
        expect(result['score'], 85);
      });

      test('应该在超时时抛出异常', () async {
        when(mockClient.post(
          Uri.parse('${ApiConfig.baseUrl}/analyze'),
          headers: anyNamed('headers'),
          body: anyNamed('body'),
        )).thenAnswer((_) async {
          await Future.delayed(const Duration(seconds: 61));
          return http.Response('', 200);
        });

        expect(
          () => apiService.analyze(
            type: 'posture',
            imageData: 'base64-encoded-image',
          ),
          throwsException,
        );
      }, timeout: const Timeout(Duration(seconds: 70)));
    });

    group('getWorkouts', () {
      test('应该返回训练记录', () async {
        final responseData = {
          'data': [
            {
              'id': 1,
              'type': 'strength',
              'duration': 45,
              'exercises': ['深蹲', '卧推'],
            },
          ],
        };

        when(mockClient.get(
          Uri.parse('${ApiConfig.baseUrl}/workouts'),
          headers: anyNamed('headers'),
        )).thenAnswer((_) async => http.Response(
              jsonEncode(responseData),
              200,
            ));

        final result = await apiService.getWorkouts();

        expect(result['data'].length, 1);
        expect(result['data'][0]['type'], 'strength');
      });
    });

    group('getNutrition', () {
      test'应该返回营养记录', () async {
        final responseData = {
          'data': [
            {
              'id': 1,
              'meal': 'lunch',
              'foods': [
                {'name': '鸡胸肉', 'calories': 165, 'protein': 31},
              ],
            },
          ],
        };

        when(mockClient.get(
          Uri.parse('${ApiConfig.baseUrl}/nutrition'),
          headers: anyNamed('headers'),
        )).thenAnswer((_) async => http.Response(
              jsonEncode(responseData),
              200,
            ));

        final result = await apiService.getNutrition();

        expect(result['data'].length, 1);
        expect(result['data'][0]['meal'], 'lunch');
      });
    });

    group('sendChat', () {
      test('应该返回 AI 回复', () async {
        final responseData = {
          'reply': 'AI 回复内容',
        };

        when(mockClient.post(
          Uri.parse('${ApiConfig.baseUrl}/chat'),
          headers: anyNamed('headers'),
          body: anyNamed('body'),
        )).thenAnswer((_) async => http.Response(
              jsonEncode(responseData),
              200,
            ));

        final result = await apiService.sendChat('如何进行深蹲训练？');

        expect(result['reply'], 'AI 回复内容');
      });
    });
  });
}
