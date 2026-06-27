// 共享类型定义

// === Express Request 增强 ===
// 让所有路由处理器中的 req.userId 自动获得类型

declare module 'express-serve-static-core' {
  interface Request {
    userId?: string;
  }
}

// === 自定义错误 ===
export interface AppError extends Error {
  statusCode?: number;
  quotaExceeded?: boolean;
  action?: string;
}

// === 数据库行类型 ===
export interface UserRow {
  id: string;
  email: string;
  password: string;
  nickname: string | null;
  plan: 'free' | 'pro_monthly' | 'pro_yearly';
  plan_expires_at: number | null;
  open_id: string | null;
  created_at: number;
  updated_at: number;
}

export interface OrderRow {
  id: string;
  user_id: string;
  plan: string;
  amount: number;
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_method: string | null;
  trade_no: string | null;
  paid_at: number | null;
  created_at: number;
}

export interface AnalysisRecordRow {
  id: string;
  user_id: string;
  image_preview: string | null;
  score: number | null;
  summary: string | null;
  issues: string | null;
  radar: string | null;
  suggestions: string | null;
  created_at: number;
}

export interface WorkoutRecordRow {
  id: string;
  user_id: string;
  plan_id: string | null;
  plan_name: string | null;
  day_number: number | null;
  day_name: string | null;
  start_time: number | null;
  end_time: number | null;
  duration: number | null;
  exercises: string | null;
  rating: number | null;
  notes: string | null;
  created_at: number;
}

export interface NutritionRecordRow {
  id: string;
  user_id: string;
  image_preview: string | null;
  meal_type: string | null;
  foods: string | null;
  total_calories: number | null;
  total_protein: number | null;
  total_carbs: number | null;
  total_fat: number | null;
  tips: string | null;
  notes: string | null;
  created_at: number;
}

export interface TrainingPlanRow {
  id: string;
  user_id: string;
  name: string | null;
  goal: string | null;
  experience: string | null;
  equipment: string | null;
  days_per_week: number | null;
  session_duration: number | null;
  schedule: string | null;
  nutrition: string | null;
  notes: string | null;
  duration_weeks: number | null;
  created_at: number;
}

export interface VerificationCodeRow {
  id: number;
  email: string;
  code: string;
  type: 'register' | 'reset';
  used: number;
  expires_at: number;
  attempts: number;
  created_at: number;
}

export interface PasswordResetRow {
  id: number;
  user_id: string;
  token: string;
  expires_at: number;
  used: number;
  created_at: number;
}

export interface ChatHistoryRow {
  id: number;
  user_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: number;
}

export interface UsageLogRow {
  id: number;
  user_id: string;
  action: string;
  created_at: number;
}

// === AI 结果类型 ===
export interface AnalysisIssue {
  name: string;
  severity: 'mild' | 'moderate' | 'severe';
  description: string;
}

export interface AnalysisRadar {
  headForward?: number;
  roundShoulder?: number;
  pelvicTilt?: number;
  kneeExtension?: number;
  spineCurve?: number;
  shoulderHeight?: number;
  legAlignment?: number;
  coreStability?: number;
  [key: string]: number | undefined;
}

export interface AnalysisSuggestion {
  exercise: string;
  sets: string;
  description: string;
  targetMuscle?: string;
  difficulty?: string;
  priority?: string;
  steps?: string[];
  tips?: string[];
}

export interface AnalysisResult {
  score: number;
  summary: string;
  issues: AnalysisIssue[];
  radar: AnalysisRadar;
  suggestions: AnalysisSuggestion[];
  bodyMetrics?: {
    postureType: string;
    riskLevel: string;
    affectedAreas: string[];
  };
}

export interface ComparisonResult {
  scoreChange: number;
  overallAssessment: string;
  improvedAreas: string[];
  worsenedAreas: string[];
  unchangedAreas: string[];
  radarComparison: Record<string, unknown>;
  recommendations: string[];
  encouragement: string;
}

export interface FoodItem {
  name: string;
  portion: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface NutritionResult {
  foods: FoodItem[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  tips: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// === 套餐配置类型 ===
export type PlanId = 'free' | 'pro_monthly' | 'pro_yearly';

export interface PlanConfig {
  id: PlanId;
  name: string;
  price: number;
  limits: {
    analyzePerDay: number;
    planPerDay: number;
    nutritionPerDay: number;
    chatPerDay: number;
  };
  features: string[];
}

// === 训练方案参数 ===
export interface PlanParams {
  goal: string;
  experience: string;
  equipment: string;
  daysPerWeek: number;
  sessionDuration: number;
}
