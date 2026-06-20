import 'package:flutter/material.dart';

import '../services/api_service.dart';

class ChatMessage {
  final String role;
  final String content;
  final DateTime timestamp;

  ChatMessage({
    required this.role,
    required this.content,
    required this.timestamp,
  });

  Map<String, dynamic> toJson() => {
    'role': role,
    'content': content,
    'timestamp': timestamp.toIso8601String(),
  };

  factory ChatMessage.fromJson(Map<String, dynamic> json) {
    return ChatMessage(
      role: (json['role'] ?? 'user').toString(),
      content: (json['content'] ?? '').toString(),
      timestamp: DateTime.tryParse(json['timestamp']?.toString() ?? '') ?? DateTime.now(),
    );
  }
}

class ChatProvider extends ChangeNotifier {
  final List<ChatMessage> _messages = [];
  bool _isLoading = false;
  String? _error;

  List<ChatMessage> get messages => _messages;
  bool get isLoading => _isLoading;
  String? get error => _error;

  ChatProvider() {
    // 添加欢迎消息
    _messages.add(ChatMessage(
      role: 'assistant',
      content: '你好！我是 KB教练 💪\n\n**我可以帮你：**\n- 🏋️ 训练动作和计划\n- 🍎 营养和饮食建议\n- 🧘 体态改善指导\n- ⚠️ 运动安全提醒\n\n有什么想问的？',
      timestamp: DateTime.now(),
    ));
  }

  // 加载聊天历史（从云端）
  Future<void> loadHistory() async {
    try {
      if (await ApiService.isAuthenticated()) {
        final history = await ApiService.authenticatedGetList('/data/chat');
        if (history.isNotEmpty) {
          _messages.clear();
          for (final msg in history) {
            _messages.add(ChatMessage.fromJson(msg));
          }
          notifyListeners();
        }
      }
    } catch (e) {
      debugPrint('加载聊天历史失败: $e');
    }
  }

  Future<void> sendMessage(String content) async {
    if (content.trim().isEmpty || _isLoading) return;

    // 添加用户消息
    _messages.add(ChatMessage(
      role: 'user',
      content: content,
      timestamp: DateTime.now(),
    ));
    notifyListeners();

    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      // 准备历史消息：跳过欢迎消息（首条 assistant）；排除刚刚插入的用户消息
      final history = <Map<String, String>>[];
      if (_messages.length > 1) {
        // skip(1) 跳过欢迎消息；take 排除最后一条用户消息
        final skipCount = (_messages.length - 1).clamp(0, _messages.length);
        for (final m in _messages.skip(1).take(skipCount - 1 < 0 ? 0 : skipCount - 1)) {
          history.add({'role': m.role, 'content': m.content});
        }
      }

      final reply = await ApiService.sendMessage(content, history);

      _messages.add(ChatMessage(
        role: 'assistant',
        content: reply,
        timestamp: DateTime.now(),
      ));
    } catch (e) {
      _error = e.toString();
      _messages.add(ChatMessage(
        role: 'assistant',
        content: '抱歉，出现了问题。请稍后重试。',
        timestamp: DateTime.now(),
      ));
      debugPrint('对话失败: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> clearChat() async {
    _messages.clear();
    _messages.add(ChatMessage(
      role: 'assistant',
      content: '你好！我是 KB教练 💪\n\n**我可以帮你：**\n- 🏋️ 训练动作和计划\n- 🍎 营养和饮食建议\n- 🧘 体态改善指导\n- ⚠️ 运动安全提醒\n\n有什么想问的？',
      timestamp: DateTime.now(),
    ));
    notifyListeners();

    // 同步清空云端聊天历史
    try {
      if (await ApiService.isAuthenticated()) {
        await ApiService.authenticatedDelete('/data/chat');
      }
    } catch (e) {
      debugPrint('清空云端聊天历史失败: $e');
    }
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
}
