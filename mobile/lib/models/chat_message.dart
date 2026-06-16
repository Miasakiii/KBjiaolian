class ChatMessage {
  final String role;
  final String content;
  final int timestamp;

  ChatMessage({
    required this.role,
    required this.content,
    required this.timestamp,
  });

  factory ChatMessage.fromJson(Map<String, dynamic> json) {
    return ChatMessage(
      role: json['role'] as String,
      content: json['content'] as String,
      timestamp: json['timestamp'] as int? ?? DateTime.now().millisecondsSinceEpoch,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'role': role,
      'content': content,
      'timestamp': timestamp,
    };
  }

  @override
  String toString() {
    return 'ChatMessage(role: $role, content: ${content.substring(0, content.length > 50 ? 50 : content.length)}...)';
  }
}
