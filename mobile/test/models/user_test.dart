import 'package:flutter_test/flutter_test.dart';
import 'package:kb_coach/models/user.dart';

void main() {
  group('User Model', () {
    test('should create User from JSON', () {
      final json = {
        'id': '123',
        'email': 'test@example.com',
        'nickname': 'Test User',
        'createdAt': 1718000000000,
      };

      final user = User.fromJson(json);

      expect(user.id, '123');
      expect(user.email, 'test@example.com');
      expect(user.nickname, 'Test User');
      expect(user.createdAt, 1718000000000);
    });

    test('should convert User to JSON', () {
      final user = User(
        id: '123',
        email: 'test@example.com',
        nickname: 'Test User',
        createdAt: 1718000000000,
      );

      final json = user.toJson();

      expect(json['id'], '123');
      expect(json['email'], 'test@example.com');
      expect(json['nickname'], 'Test User');
      expect(json['createdAt'], 1718000000000);
    });

    test('should handle toString', () {
      final user = User(
        id: '123',
        email: 'test@example.com',
        nickname: 'Test User',
        createdAt: 1718000000000,
      );

      final string = user.toString();

      expect(string, contains('User'));
      expect(string, contains('123'));
      expect(string, contains('test@example.com'));
    });

    test('should create User with all required fields', () {
      final user = User(
        id: '456',
        email: 'user@example.com',
        nickname: 'User',
        createdAt: 1718000000000,
      );

      expect(user.id, '456');
      expect(user.email, 'user@example.com');
      expect(user.nickname, 'User');
      expect(user.createdAt, 1718000000000);
    });
  });
}
