class TrainingPlan {
  final String id;
  final String name;
  final String goal;
  final String experience;
  final String equipment;
  final int daysPerWeek;
  final int sessionDuration;
  final List<Map<String, dynamic>> schedule;
  final Map<String, dynamic> nutrition;
  final String notes;
  final int durationWeeks;
  final int createdAt;

  TrainingPlan({
    required this.id,
    required this.name,
    required this.goal,
    required this.experience,
    required this.equipment,
    required this.daysPerWeek,
    required this.sessionDuration,
    required this.schedule,
    required this.nutrition,
    required this.notes,
    required this.durationWeeks,
    required this.createdAt,
  });

  factory TrainingPlan.fromJson(Map<String, dynamic> json) {
    return TrainingPlan(
      id: json['id'] as String,
      name: json['name'] as String? ?? '',
      goal: json['goal'] as String? ?? '',
      experience: json['experience'] as String? ?? '',
      equipment: json['equipment'] as String? ?? '',
      daysPerWeek: json['daysPerWeek'] as int? ?? 0,
      sessionDuration: json['sessionDuration'] as int? ?? 0,
      schedule: (json['schedule'] as List<dynamic>?)
              ?.map((e) => e as Map<String, dynamic>)
              .toList() ??
          [],
      nutrition: json['nutrition'] as Map<String, dynamic>? ?? {},
      notes: json['notes'] as String? ?? '',
      durationWeeks: json['durationWeeks'] as int? ?? 0,
      createdAt: json['createdAt'] as int? ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'goal': goal,
      'experience': experience,
      'equipment': equipment,
      'daysPerWeek': daysPerWeek,
      'sessionDuration': sessionDuration,
      'schedule': schedule,
      'nutrition': nutrition,
      'notes': notes,
      'durationWeeks': durationWeeks,
      'createdAt': createdAt,
    };
  }

  @override
  String toString() {
    return 'TrainingPlan(id: $id, name: $name, goal: $goal)';
  }
}
