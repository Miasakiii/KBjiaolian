export interface FoodItem {
  name: string;
  portion: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface NutritionAnalysis {
  foods: FoodItem[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  tips: string;
}

export interface NutritionRecord {
  id: string;
  imagePreview: string;
  analysis: NutritionAnalysis;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  notes: string;
  createdAt: number;
}

export interface DailyNutrition {
  date: string;
  records: NutritionRecord[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

export interface NutritionGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export const mealTypeLabels: Record<string, string> = {
  breakfast: '早餐',
  lunch: '午餐',
  dinner: '晚餐',
  snack: '加餐',
};

export const mealTypeIcons: Record<string, string> = {
  breakfast: 'Sunrise',
  lunch: 'Sun',
  dinner: 'Moon',
  snack: 'Cookie',
};
