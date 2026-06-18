export interface AnalysisResult {
  score: number;
  summary: string;
  issues: Issue[];
  radar: RadarData;
  bodyMetrics?: BodyMetrics;
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
  description?: string;
}

export interface BodyMetrics {
  postureType: string;
  riskLevel: '低' | '中' | '高';
  affectedAreas: string[];
}

// 8 维度雷达图数据
export interface RadarData {
  headForward: number;     // 头前伸
  roundShoulder: number;   // 圆肩
  pelvicTilt: number;      // 骨盆前倾
  kneeExtension: number;   // 膝超伸
  spineCurve: number;      // 脊柱侧弯
  shoulderHeight: number;  // 高低肩
  legAlignment: number;    // X/O 型腿
  coreStability: number;   // 核心稳定性
}

export interface Suggestion {
  exercise: string;
  sets: string;
  description: string;
  targetMuscle: string;
  difficulty: '初级' | '中级' | '高级';
  priority?: '高' | '中' | '低';
  steps: string[];
  tips: string[];
}

// 前后对比结果
export interface ComparisonResult {
  scoreChange: number;
  overallAssessment: string;
  improvedAreas: string[];
  worsenedAreas: string[];
  unchangedAreas: string[];
  radarComparison: Record<string, { before: number; after: number; change: number }>;
  recommendations: string[];
  encouragement: string;
  beforeDate: number;
  afterDate: number;
}
