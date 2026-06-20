// 云端存储 API 客户端
// 优先使用后端 API，localStorage 作为缓存/离线备份

import { authFetch, isAuthenticated } from './auth';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// 通用 API 请求
async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await authFetch(`${API_BASE}${path}`, options);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: '请求失败' }));
    throw new Error(error.error || '请求失败');
  }

  return response.json();
}

// === 分析记录 ===

export interface CloudAnalysisRecord {
  id: string;
  timestamp: number;
  imagePreview: string | null;
  result: {
    score: number;
    summary: string;
    issues: Array<{ name: string; severity: string }>;
    radar: Record<string, number>;
    suggestions: Array<{
      exercise: string;
      sets: string;
      description: string;
      targetMuscle?: string;
      difficulty?: string;
      steps?: string[];
      tips?: string[];
    }>;
  };
}

export const cloudAnalysis = {
  // 保存分析记录
  async save(imagePreview: string | null, result: any): Promise<string> {
    const data = await apiRequest<{ id: string }>('/data/analysis', {
      method: 'POST',
      body: JSON.stringify({ imagePreview, result }),
    });
    return data.id;
  },

  // 获取所有分析记录
  async getAll(): Promise<CloudAnalysisRecord[]> {
    return apiRequest<CloudAnalysisRecord[]>('/data/analysis');
  },

  // 删除单条记录
  async delete(id: string): Promise<void> {
    await apiRequest(`/data/analysis/${id}`, { method: 'DELETE' });
  },

  // 清空所有记录
  async clearAll(): Promise<void> {
    await apiRequest('/data/analysis', { method: 'DELETE' });
  },
};

// === 训练方案 ===

export interface CloudTrainingPlan {
  id: string;
  name: string;
  goal: string;
  experience: string;
  equipment: string;
  daysPerWeek: number;
  sessionDuration: number;
  schedule: any[];
  nutrition: any;
  notes: string;
  durationWeeks: number;
  createdAt: number;
}

export const cloudPlans = {
  // 保存训练方案
  async save(plan: any): Promise<string> {
    const data = await apiRequest<{ id: string }>('/data/plans', {
      method: 'POST',
      body: JSON.stringify(plan),
    });
    return data.id;
  },

  // 获取所有方案
  async getAll(): Promise<CloudTrainingPlan[]> {
    return apiRequest<CloudTrainingPlan[]>('/data/plans');
  },

  // 删除方案
  async delete(id: string): Promise<void> {
    await apiRequest(`/data/plans/${id}`, { method: 'DELETE' });
  },

  // 清空所有方案
  async clearAll(): Promise<void> {
    await apiRequest('/data/plans', { method: 'DELETE' });
  },
};

// === 训练记录 ===

export interface CloudWorkoutRecord {
  id: string;
  planId: string | null;
  planName: string;
  dayNumber: number;
  dayName: string;
  startTime: number;
  endTime: number;
  duration: number;
  exercises: any[];
  rating: number;
  notes: string;
  createdAt: number;
}

export const cloudWorkouts = {
  // 保存训练记录
  async save(workout: any): Promise<string> {
    const data = await apiRequest<{ id: string }>('/data/workouts', {
      method: 'POST',
      body: JSON.stringify(workout),
    });
    return data.id;
  },

  // 获取所有记录
  async getAll(): Promise<CloudWorkoutRecord[]> {
    return apiRequest<CloudWorkoutRecord[]>('/data/workouts');
  },

  // 删除单条记录
  async delete(id: string): Promise<void> {
    await apiRequest(`/data/workouts/${id}`, { method: 'DELETE' });
  },

  // 清空所有记录
  async clearAll(): Promise<void> {
    await apiRequest('/data/workouts', { method: 'DELETE' });
  },
};

// === 饮食记录 ===

export interface CloudNutritionRecord {
  id: string;
  imagePreview: string | null;
  mealType: string;
  foods: any[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  tips: string;
  notes: string;
  createdAt: number;
}

export const cloudNutrition = {
  // 保存饮食记录
  async save(record: any): Promise<string> {
    const data = await apiRequest<{ id: string }>('/data/nutrition', {
      method: 'POST',
      body: JSON.stringify(record),
    });
    return data.id;
  },

  // 获取所有记录
  async getAll(): Promise<CloudNutritionRecord[]> {
    return apiRequest<CloudNutritionRecord[]>('/data/nutrition');
  },

  // 删除单条记录
  async delete(id: string): Promise<void> {
    await apiRequest(`/data/nutrition/${id}`, { method: 'DELETE' });
  },

  // 清空所有记录
  async clearAll(): Promise<void> {
    await apiRequest('/data/nutrition', { method: 'DELETE' });
  },
};

// === 聊天历史 ===

export interface CloudChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export const cloudChat = {
  // 获取聊天历史
  async getHistory(): Promise<CloudChatMessage[]> {
    return apiRequest<CloudChatMessage[]>('/data/chat');
  },

  // 清空聊天历史
  async clearAll(): Promise<void> {
    await apiRequest('/data/chat', { method: 'DELETE' });
  },
};

// === 同步工具 ===

// 检查是否应该使用云端存储
export function shouldUseCloud(): boolean {
  return isAuthenticated();
}

// 从 localStorage 同步数据到云端（首次登录时）
export async function syncLocalToCloud(): Promise<void> {
  if (!isAuthenticated()) return;

  try {
    // 同步分析记录
    const localAnalysis = JSON.parse(localStorage.getItem('kb-coach-history') || '[]');
    if (localAnalysis.length > 0) {
      const cloudRecords = await cloudAnalysis.getAll();
      if (cloudRecords.length === 0) {
        // 云端没有数据，上传本地数据
        for (const record of localAnalysis) {
          await cloudAnalysis.save(record.imagePreview, record.result);
        }
        // 同步完成
      }
    }

    // 同步训练方案
    const localPlans = JSON.parse(localStorage.getItem('kb-coach-plans') || '[]');
    if (localPlans.length > 0) {
      const cloudPlansList = await cloudPlans.getAll();
      if (cloudPlansList.length === 0) {
        for (const plan of localPlans) {
          await cloudPlans.save(plan);
        }
        // 同步完成
      }
    }

    // 同步训练记录
    const localWorkouts = JSON.parse(localStorage.getItem('kb-coach-workouts') || '[]');
    if (localWorkouts.length > 0) {
      const cloudWorkoutsList = await cloudWorkouts.getAll();
      if (cloudWorkoutsList.length === 0) {
        for (const workout of localWorkouts) {
          await cloudWorkouts.save(workout);
        }
        // 同步完成
      }
    }

    // 同步饮食记录
    const localNutrition = JSON.parse(localStorage.getItem('kb-coach-nutrition') || '[]');
    if (localNutrition.length > 0) {
      const cloudNutritionList = await cloudNutrition.getAll();
      if (cloudNutritionList.length === 0) {
        for (const record of localNutrition) {
          await cloudNutrition.save(record);
        }
        // 同步完成
      }
    }
  } catch (err) {
    console.error('同步数据到云端失败:', err);
  }
}
