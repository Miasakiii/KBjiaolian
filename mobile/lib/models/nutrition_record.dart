class NutritionRecord {
  final String id;
  final String mealType;
  final Map<String, dynamic> analysis;
  final String createdAt;

  NutritionRecord({
    required this.id,
    required this.mealType,
    required this.analysis,
    required this.createdAt,
  });

  factory NutritionRecord.fromJson(Map<String, dynamic> json) {
    return NutritionRecord(
      id: json['id'] as String? ?? '',
      mealType: json['mealType'] as String? ?? 'lunch',
      analysis: json['analysis'] as Map<String, dynamic>? ?? {},
      createdAt: json['createdAt'] as String? ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'mealType': mealType,
      'analysis': analysis,
      'createdAt': createdAt,
    };
  }

  int get totalCalories => _toInt(analysis['totalCalories']);
  int get totalProtein => _toInt(analysis['totalProtein']);
  int get totalCarbs => _toInt(analysis['totalCarbs']);
  int get totalFat => _toInt(analysis['totalFat']);

  static int _toInt(dynamic v) {
    if (v is int) return v;
    if (v is num) return v.round();
    if (v is String) return int.tryParse(v) ?? 0;
    return 0;
  }

  @override
  String toString() {
    return 'NutritionRecord(id: $id, mealType: $mealType, totalCalories: $totalCalories)';
  }
}
