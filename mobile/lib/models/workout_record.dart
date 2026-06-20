class WorkoutRecord {
  final String id;
  final String? planId;
  final String planName;
  final int dayIndex;
  final String dayName;
  final String startTime;
  final String endTime;
  final int duration;
  final List<Map<String, dynamic>> exercises;
  final int rating;
  final String notes;
  final String createdAt;

  WorkoutRecord({
    required this.id,
    this.planId,
    required this.planName,
    required this.dayIndex,
    required this.dayName,
    required this.startTime,
    required this.endTime,
    required this.duration,
    required this.exercises,
    required this.rating,
    required this.notes,
    required this.createdAt,
  });

  factory WorkoutRecord.fromJson(Map<String, dynamic> json) {
    return WorkoutRecord(
      id: json['id'] as String? ?? '',
      planId: json['planId'] as String?,
      planName: json['planName'] as String? ?? '',
      dayIndex: json['dayIndex'] as int? ?? 0,
      dayName: json['dayName'] as String? ?? '',
      startTime: json['startTime'] as String? ?? '',
      endTime: json['endTime'] as String? ?? '',
      duration: json['duration'] as int? ?? 0,
      exercises: (json['exercises'] as List<dynamic>?)
              ?.map((e) => e as Map<String, dynamic>)
              .toList() ??
          [],
      rating: json['rating'] as int? ?? 0,
      notes: json['notes'] as String? ?? '',
      createdAt: json['createdAt'] as String? ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'planId': planId,
      'planName': planName,
      'dayIndex': dayIndex,
      'dayName': dayName,
      'startTime': startTime,
      'endTime': endTime,
      'duration': duration,
      'exercises': exercises,
      'rating': rating,
      'notes': notes,
      'createdAt': createdAt,
    };
  }

  @override
  String toString() {
    return 'WorkoutRecord(id: $id, planName: $planName, dayName: $dayName, duration: $duration)';
  }
}
