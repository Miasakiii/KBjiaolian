class User {
  final String id;
  final String email;
  final String nickname;
  final int createdAt;

  User({
    required this.id,
    required this.email,
    required this.nickname,
    required this.createdAt,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] as String,
      email: json['email'] as String,
      nickname: json['nickname'] as String,
      createdAt: json['createdAt'] as int,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'nickname': nickname,
      'createdAt': createdAt,
    };
  }

  @override
  String toString() {
    return 'User(id: $id, email: $email, nickname: $nickname)';
  }
}
