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
    ),);
  }

  // 个人版：聊天历史仅存内存（可选后续接本地持久化）
  Future<void> loadHistory() async {
    // 个人版无云端历史，保留空实现兼容 ChatScreen initState 调用
  }

  Future<void> sendMessage(String content) async {
    if (content.trim().isEmpty || _isLoading) return;

    // 添加用户消息
    _messages.add(ChatMessage(
      role: 'user',
      content: content,
      timestamp: DateTime.now(),
    ),);
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

      // 流式响应：先插入一个空的 assistant 消息，逐块追加内容
      final assistantMsg = ChatMessage(
        role: 'assistant',
        content: '',
        timestamp: DateTime.now(),
      );
      _messages.add(assistantMsg);
      final assistantIdx = _messages.length - 1;
      notifyListeners();

      final stream = ApiService.sendMessageStream(content, history);
      await for (final delta in stream) {
        // 不可变替换：重建消息对象触发 UI 更新
        _messages[assistantIdx] = ChatMessage(
          role: 'assistant',
          content: _messages[assistantIdx].content + delta,
          timestamp: _messages[assistantIdx].timestamp,
        );
        notifyListeners();
      }

      // 若流式失败返回空，兜底用非流式
      if (_messages[assistantIdx].content.isEmpty) {
        final reply = await ApiService.sendMessage(content, history);
        _messages[assistantIdx] = ChatMessage(
          role: 'assistant',
          content: reply,
          timestamp: _messages[assistantIdx].timestamp,
        );
        notifyListeners();
      }
    } catch (e) {
      _error = e.toString();
      // 移除可能残留的空 assistant 占位
      if (_messages.isNotEmpty &&
          _messages.last.role == 'assistant' &&
          _messages.last.content.isEmpty) {
        _messages.removeLast();
      }
      _messages.add(ChatMessage(
        role: 'assistant',
        content: '抱歉，出现了问题。请稍后重试。',
        timestamp: DateTime.now(),
      ),);
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
    ),);
    notifyListeners();
    // 个人版：无云端历史，仅清内存
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
}
