export interface AnalysisResult {
  score: number;
  summary: string;
  issues: Issue[];
  radar: RadarData;
  suggestions: Suggestion[];
}

export interface HistoryRecord {
  id: string;
  timestamp: number;
  imagePreview: string;
  result: AnalysisResult;
}

export interface Issue {
  name: string;
  severity: 'mild' | 'moderate' | 'severe';
}

export interface RadarData {
  headForward: number;
  roundShoulder: number;
  pelvicTilt: number;
  kneeExtension: number;
}

export interface Suggestion {
  exercise: string;
  sets: string;
  description: string;
  targetMuscle: string;
  difficulty: '初级' | '中级' | '高级';
  steps: string[];
  tips: string[];
}
