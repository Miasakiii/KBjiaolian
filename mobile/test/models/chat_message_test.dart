import 'package:flutter_test/flutter_test.dart';
import 'package:kb_coach/models/chat_message.dart';

void main() {
  group('ChatMessage Model', () {
    test('should create ChatMessage from JSON', () {
      final json = {
        'role': 'user',
        'content': '你好，我想咨询健身问题',
        'timestamp': 1718000000000,
      };

      final message = ChatMessage.fromJson(json);

      expect(message.role, 'user');
      expect(message.content, '你好，我想咨询健身问题');
      expect(message.timestamp, 1718000000000);
    });

    test('should create assistant message from JSON', () {
      final json = {
        'role': 'assistant',
        'content': '你好！我是KB教练，很高兴为你解答健身问题。',
        'timestamp': 1718000001000,
      };

      final message = ChatMessage.fromJson(json);

      expect(message.role, 'assistant');
      expect(message.content, '你好！我是KB教练，很高兴为你解答健身问题。');
      expect(message.timestamp, 1718000001000);
    });

    test('should convert ChatMessage to JSON', () {
      final message = ChatMessage(
        role: 'user',
        content: '如何增肌？',
        timestamp: 1718000000000,
      );

      final json = message.toJson();

      expect(json['role'], 'user');
      expect(json['content'], '如何增肌？');
      expect(json['timestamp'], 1718000000000);
    });

    test('should handle missing timestamp with default', () {
      final json = <String, dynamic>{
        'role': 'user',
        'content': '测试消息',
      };

      final message = ChatMessage.fromJson(json);

      expect(message.role, 'user');
      expect(message.content, '测试消息');
      expect(message.timestamp, isPositive);
    });

    test('should handle toString', () {
      final message = ChatMessage(
        role: 'user',
        content: '这是一条测试消息，用于验证toString方法是否正常工作',
        timestamp: 1718000000000,
      );

      final string = message.toString();

      expect(string, contains('ChatMessage'));
      expect(string, contains('user'));
      expect(string, contains('这是一条测试消息'));
    });

    test('should truncate long content in toString', () {
      final longContent = 'A' * 100;
      final message = ChatMessage(
        role: 'user',
        content: longContent,
        timestamp: 1718000000000,
      );

      final string = message.toString();

      expect(string, contains('ChatMessage'));
      expect(string.length, lessThan(longContent.length + 50));
    });

    test('should create message with all required fields', () {
      final message = ChatMessage(
        role: 'assistant',
        content: '增肌需要合理的训练和饮食计划',
        timestamp: 1718000002000,
      );

      expect(message.role, 'assistant');
      expect(message.content, '增肌需要合理的训练和饮食计划');
      expect(message.timestamp, 1718000002000);
    });
  });
}
