import { NutritionRecord, DailyNutrition, NutritionGoals } from '@/types/nutrition';
import { shouldUseCloud, cloudNutrition } from './cloudStorage';

const STORAGE_KEY = 'kb-coach-nutrition';
const GOALS_KEY = 'kb-coach-nutrition-goals';

// 本地存储操作
function saveToLocal(record: NutritionRecord): void {
  const records = getAllFromLocal();
  records.unshift(record);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch (error) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      const trimmed = records.slice(0, -1);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    } else {
      throw error;
    }
  }
}

function getAllFromLocal(): NutritionRecord[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function deleteFromLocal(id: string): void {
  const records = getAllFromLocal().filter((r) => r.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

function clearLocal(): void {
  localStorage.removeItem(STORAGE_KEY);
}

// 云端数据转换
function cloudToLocal(record: any): NutritionRecord {
  return {
    id: record.id,
    imagePreview: record.imagePreview,
    analysis: {
      foods: record.foods || [],
      totalCalories: record.totalCalories,
      totalProtein: record.totalProtein,
      totalCarbs: record.totalCarbs,
      totalFat: record.totalFat,
      tips: record.tips,
    },
    mealType: record.mealType,
    notes: record.notes,
    createdAt: record.createdAt,
  };
}

// === 公开 API ===

export async function saveNutritionRecord(record: NutritionRecord): Promise<void> {
  // 保存到本地
  saveToLocal(record);

  // 如果已登录，同步到云端
  if (shouldUseCloud()) {
    try {
      await cloudNutrition.save({
        id: record.id,
        imagePreview: record.imagePreview,
        mealType: record.mealType,
        foods: record.analysis.foods,
        totalCalories: record.analysis.totalCalories,
        totalProtein: record.analysis.totalProtein,
        totalCarbs: record.analysis.totalCarbs,
        totalFat: record.analysis.totalFat,
        tips: record.analysis.tips,
        notes: record.notes,
      });
    } catch (err) {
      console.warn('同步饮食记录到云端失败:', err);
    }
  }
}

export async function getAllNutritionRecords(): Promise<NutritionRecord[]> {
  // 如果已登录，优先从云端获取
  if (shouldUseCloud()) {
    try {
      const cloudRecords = await cloudNutrition.getAll();
      return cloudRecords.map(cloudToLocal);
    } catch (err) {
      console.warn('从云端获取饮食记录失败，使用本地数据:', err);
    }
  }

  return getAllFromLocal();
}

export async function getNutritionRecordById(id: string): Promise<NutritionRecord | null> {
  const records = await getAllNutritionRecords();
  return records.find((r) => r.id === id) || null;
}

export async function deleteNutritionRecord(id: string): Promise<void> {
  // 删除本地记录
  deleteFromLocal(id);

  // 如果已登录，同步删除云端记录
  if (shouldUseCloud()) {
    try {
      await cloudNutrition.delete(id);
    } catch (err) {
      console.warn('删除云端饮食记录失败:', err);
    }
  }
}

export async function getNutritionByDate(date: string): Promise<DailyNutrition> {
  const records = await getAllNutritionRecords();
  const filtered = records.filter((r) => {
    const recordDate = new Date(r.createdAt).toLocaleDateString('zh-CN');
    return recordDate === date;
  });

  const totalCalories = filtered.reduce((sum, r) => sum + r.analysis.totalCalories, 0);
  const totalProtein = filtered.reduce((sum, r) => sum + r.analysis.totalProtein, 0);
  const totalCarbs = filtered.reduce((sum, r) => sum + r.analysis.totalCarbs, 0);
  const totalFat = filtered.reduce((sum, r) => sum + r.analysis.totalFat, 0);

  return {
    date,
    records: filtered,
    totalCalories,
    totalProtein,
    totalCarbs,
    totalFat,
  };
}

export async function getTodayNutrition(): Promise<DailyNutrition> {
  const today = new Date().toLocaleDateString('zh-CN');
  return getNutritionByDate(today);
}

export function getNutritionGoals(): NutritionGoals {
  try {
    const data = localStorage.getItem(GOALS_KEY);
    return data ? JSON.parse(data) : {
      calories: 2000,
      protein: 150,
      carbs: 250,
      fat: 65,
    };
  } catch {
    return {
      calories: 2000,
      protein: 150,
      carbs: 250,
      fat: 65,
    };
  }
}

export function saveNutritionGoals(goals: NutritionGoals): void {
  localStorage.setItem(GOALS_KEY, JSON.stringify(goals));
}

export async function clearAllNutritionRecords(): Promise<void> {
  // 清空本地记录
  clearLocal();

  // 如果已登录，同步清空云端记录
  if (shouldUseCloud()) {
    try {
      await cloudNutrition.clearAll();
    } catch (err) {
      console.warn('清空云端饮食记录失败:', err);
    }
  }
}
