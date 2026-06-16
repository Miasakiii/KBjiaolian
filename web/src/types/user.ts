export interface UserProfile {
  nickname: string;
  gender: 'male' | 'female' | 'other';
  age: number;
  height: number; // cm
  weight: number; // kg
  goal: 'muscle_gain' | 'fat_loss' | 'posture_fix' | 'health';
  experience: 'beginner' | 'intermediate' | 'advanced';
}

export interface UserGoals {
  targetWeight: number;
  targetBodyFat: number;
  weeklyWorkouts: number;
  dailyCalories: number;
  dailyProtein: number;
  dailyCarbs: number;
  dailyFat: number;
}

export const goalLabels: Record<string, string> = {
  muscle_gain: '增肌塑形',
  fat_loss: '减脂瘦身',
  posture_fix: '体态矫正',
  health: '健康生活',
};

export const experienceLabels: Record<string, string> = {
  beginner: '新手',
  intermediate: '中级',
  advanced: '高级',
};

export const genderLabels: Record<string, string> = {
  male: '男',
  female: '女',
  other: '其他',
};
