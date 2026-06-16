export type TrainingGoal = 'muscle_gain' | 'fat_loss' | 'posture_fix' | 'rehab';
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';
export type Equipment = 'gym' | 'dumbbell' | 'bodyweight';

export interface PlanParams {
  goal: TrainingGoal;
  experience: ExperienceLevel;
  equipment: Equipment;
  daysPerWeek: number;
  sessionDuration: number;
}

export interface Exercise {
  name: string;
  sets: number;
  reps: string;
  restSec: number;
  notes: string;
  targetMuscle: string;
}

export interface DayPlan {
  day: number;
  name: string;
  exercises: Exercise[];
  estimatedDuration: number;
}

export interface Nutrition {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  notes: string;
}

export interface TrainingPlan {
  id: string;
  name: string;
  goal: TrainingGoal;
  experience: ExperienceLevel;
  equipment: Equipment;
  daysPerWeek: number;
  sessionDuration: number;
  durationWeeks: number;
  schedule: DayPlan[];
  nutrition: Nutrition;
  notes: string;
  createdAt: number;
}

export const goalLabels: Record<TrainingGoal, string> = {
  muscle_gain: '增肌塑形',
  fat_loss: '减脂瘦身',
  posture_fix: '体态矫正',
  rehab: '康复训练',
};

export const experienceLabels: Record<ExperienceLevel, string> = {
  beginner: '新手',
  intermediate: '中级',
  advanced: '高级',
};

export const equipmentLabels: Record<Equipment, string> = {
  gym: '健身房',
  dumbbell: '家用哑铃',
  bodyweight: '徒手训练',
};
