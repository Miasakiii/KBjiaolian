class NutritionRecord {
  final String id;
  final String? imagePreview;
  final String mealType;
  final List<Map<String, dynamic>> foods;
  final int totalCalories;
  final int totalProtein;
  final int totalCarbs;
  final int totalFat;
  final String tips;
  final String notes;
  final int createdAt;

  NutritionRecord({
    required this.id,
    this.imagePreview,
    required this.mealType,
    required this.foods,
    required this.totalCalories,
    required this.totalProtein,
    required this.totalCarbs,
    required this.totalFat,
    required this.tips,
    required this.notes,
    required this.createdAt,
  });

  factory NutritionRecord.fromJson(Map<String, dynamic> json) {
    return NutritionRecord(
      id: json['id'] as String,
      imagePreview: json['imagePreview'] as String?,
      mealType: json['mealType'] as String? ?? 'lunch',
      foods: (json['foods'] as List<dynamic>?)
              ?.map((e) => e as Map<String, dynamic>)
              .toList() ??
          [],
      totalCalories: json['totalCalories'] as int? ?? 0,
      totalProtein: json['totalProtein'] as int? ?? 0,
      totalCarbs: json['totalCarbs'] as int? ?? 0,
      totalFat: json['totalFat'] as int? ?? 0,
      tips: json['tips'] as String? ?? '',
      notes: json['notes'] as String? ?? '',
      createdAt: json['createdAt'] as int? ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'imagePreview': imagePreview,
      'mealType': mealType,
      'foods': foods,
      'totalCalories': totalCalories,
      'totalProtein': totalProtein,
      'totalCarbs': totalCarbs,
      'totalFat': totalFat,
      'tips': tips,
      'notes': notes,
      'createdAt': createdAt,
    };
  }

  @override
  String toString() {
    return 'NutritionRecord(id: $id, mealType: $mealType, totalCalories: $totalCalories)';
  }
}
