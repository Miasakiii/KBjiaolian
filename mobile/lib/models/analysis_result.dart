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
  final int spinalCurvature;
  final int shoulderHeight;
  final int legAlignment;
  final int coreStability;

  RadarData({
    required this.headForward,
    required this.roundShoulder,
    required this.pelvicTilt,
    required this.kneeExtension,
    required this.spinalCurvature,
    required this.shoulderHeight,
    required this.legAlignment,
    required this.coreStability,
  });

  factory RadarData.fromJson(Map<String, dynamic> json) {
    return RadarData(
      headForward: json['headForward'] ?? 0,
      roundShoulder: json['roundShoulder'] ?? 0,
      pelvicTilt: json['pelvicTilt'] ?? 0,
      kneeExtension: json['kneeExtension'] ?? 0,
      spinalCurvature: json['spinalCurvature'] ?? 0,
      shoulderHeight: json['shoulderHeight'] ?? 0,
      legAlignment: json['legAlignment'] ?? 0,
      coreStability: json['coreStability'] ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'headForward': headForward,
      'roundShoulder': roundShoulder,
      'pelvicTilt': pelvicTilt,
      'kneeExtension': kneeExtension,
      'spinalCurvature': spinalCurvature,
      'shoulderHeight': shoulderHeight,
      'legAlignment': legAlignment,
      'coreStability': coreStability,
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
      exercise: json['exercise']?.toString() ?? '',
      sets: json['sets']?.toString() ?? '',
      description: json['description']?.toString() ?? '',
      targetMuscle: json['targetMuscle']?.toString() ?? '',
      difficulty: json['difficulty']?.toString() ?? '初级',
      steps: (json['steps'] as List?)?.map((e) => e.toString()).toList() ?? const [],
      tips: (json['tips'] as List?)?.map((e) => e.toString()).toList() ?? const [],
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
