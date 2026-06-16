import { TrainingPlan } from '@/types/plan';
import { shouldUseCloud, cloudPlans } from './cloudStorage';

const STORAGE_KEY = 'kb-coach-plans';

// 本地存储操作
function saveToLocal(plan: TrainingPlan): void {
  const plans = getAllFromLocal();
  plans.unshift(plan);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
  } catch (error) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      const trimmed = plans.slice(0, -1);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    } else {
      throw error;
    }
  }
}

function getAllFromLocal(): TrainingPlan[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function deleteFromLocal(id: string): void {
  const plans = getAllFromLocal().filter((p) => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
}

function clearLocal(): void {
  localStorage.removeItem(STORAGE_KEY);
}

// 云端数据转换
function cloudToLocal(plan: any): TrainingPlan {
  return {
    id: plan.id,
    name: plan.name,
    goal: plan.goal,
    experience: plan.experience,
    equipment: plan.equipment,
    daysPerWeek: plan.daysPerWeek,
    sessionDuration: plan.sessionDuration,
    schedule: plan.schedule || [],
    nutrition: plan.nutrition,
    notes: plan.notes,
    durationWeeks: plan.durationWeeks,
    createdAt: plan.createdAt,
  };
}

// === 公开 API ===

export async function savePlan(plan: TrainingPlan): Promise<void> {
  // 保存到本地
  saveToLocal(plan);

  // 如果已登录，同步到云端
  if (shouldUseCloud()) {
    try {
      await cloudPlans.save(plan);
    } catch (err) {
      console.warn('同步训练方案到云端失败:', err);
    }
  }
}

export async function getAllPlans(): Promise<TrainingPlan[]> {
  // 如果已登录，优先从云端获取
  if (shouldUseCloud()) {
    try {
      const cloudRecords = await cloudPlans.getAll();
      return cloudRecords.map(cloudToLocal);
    } catch (err) {
      console.warn('从云端获取训练方案失败，使用本地数据:', err);
    }
  }

  return getAllFromLocal();
}

export async function getPlanById(id: string): Promise<TrainingPlan | null> {
  const plans = await getAllPlans();
  return plans.find((p) => p.id === id) || null;
}

export async function deletePlan(id: string): Promise<void> {
  // 删除本地记录
  deleteFromLocal(id);

  // 如果已登录，同步删除云端记录
  if (shouldUseCloud()) {
    try {
      await cloudPlans.delete(id);
    } catch (err) {
      console.warn('删除云端训练方案失败:', err);
    }
  }
}

export async function clearAllPlans(): Promise<void> {
  // 清空本地记录
  clearLocal();
}
