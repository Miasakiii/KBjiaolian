class AnalysisResult {
  final int score;
  final String summary;
  final List<Issue> issues;
  final RadarData radar;
  final List<Suggestion> suggestions;

  AnalysisResult({
    required this.score,
    required this.summary,
    required this.issues,
    required this.radar,
    required this.suggestions,
  });

  factory AnalysisResult.fromJson(Map<String, dynamic> json) {
    return AnalysisResult(
      score: json['score'] ?? 0,
      summary: json['summary'] ?? '',
      issues: (json['issues'] as List?)
          ?.map((e) => Issue.fromJson(e))
          .toList() ?? [],
      radar: RadarData.fromJson(json['radar'] ?? {}),
      suggestions: (json['suggestions'] as List?)
          ?.map((e) => Suggestion.fromJson(e))
          .toList() ?? [],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'score': score,
      'summary': summary,
      'issues': issues.map((e) => e.toJson()).toList(),
      'radar': radar.toJson(),
      'suggestions': suggestions.map((e) => e.toJson()).toList(),
    };
  }
}

class Issue {
  final String name;
  final String severity;

  Issue({required this.name, required this.severity});

  factory Issue.fromJson(Map<String, dynamic> json) {
    return Issue(
      name: json['name'] ?? '',
      severity: json['severity'] ?? 'moderate',
    );
  }

  Map<String, dynamic> toJson() => {'name': name, 'severity': severity};
}

class RadarData {
  final int headForward;
  final int roundShoulder;
  final int pelvicTilt;
  final int kneeExtension;

  RadarData({
    required this.headForward,
    required this.roundShoulder,
    required this.pelvicTilt,
    required this.kneeExtension,
  });

  factory RadarData.fromJson(Map<String, dynamic> json) {
    return RadarData(
      headForward: json['headForward'] ?? 0,
      roundShoulder: json['roundShoulder'] ?? 0,
      pelvicTilt: json['pelvicTilt'] ?? 0,
      kneeExtension: json['kneeExtension'] ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'headForward': headForward,
      'roundShoulder': roundShoulder,
      'pelvicTilt': pelvicTilt,
      'kneeExtension': kneeExtension,
    };
  }
}

class Suggestion {
  final String exercise;
  final String sets;
  final String description;
  final String targetMuscle;
  final String difficulty;
  final List<String> steps;
  final List<String> tips;

  Suggestion({
    required this.exercise,
    required this.sets,
    required this.description,
    required this.targetMuscle,
    required this.difficulty,
    required this.steps,
    required this.tips,
  });

  factory Suggestion.fromJson(Map<String, dynamic> json) {
    return Suggestion(
      exercise: json['exercise'] ?? '',
      sets: json['sets'] ?? '',
      description: json['description'] ?? '',
      targetMuscle: json['targetMuscle'] ?? '',
      difficulty: json['difficulty'] ?? '初级',
      steps: List<String>.from(json['steps'] ?? []),
      tips: List<String>.from(json['tips'] ?? []),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'exercise': exercise,
      'sets': sets,
      'description': description,
      'targetMuscle': targetMuscle,
      'difficulty': difficulty,
      'steps': steps,
      'tips': tips,
    };
  }
}
