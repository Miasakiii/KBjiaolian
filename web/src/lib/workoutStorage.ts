import { WorkoutRecord, WorkoutStats } from '@/types/workout';
import { shouldUseCloud, cloudWorkouts } from './cloudStorage';

const STORAGE_KEY = 'kb-coach-workouts';

// 本地存储操作
function saveToLocal(record: WorkoutRecord): void {
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

function getAllFromLocal(): WorkoutRecord[] {
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
function cloudToLocal(record: any): WorkoutRecord {
  return {
    id: record.id,
    planId: record.planId,
    planName: record.planName,
    dayNumber: record.dayNumber,
    dayName: record.dayName,
    startTime: record.startTime,
    endTime: record.endTime,
    duration: record.duration,
    exercises: record.exercises || [],
    rating: record.rating,
    notes: record.notes,
    createdAt: record.createdAt,
  };
}

// === 公开 API ===

export async function saveWorkout(record: WorkoutRecord): Promise<void> {
  // 保存到本地
  saveToLocal(record);

  // 如果已登录，同步到云端
  if (shouldUseCloud()) {
    try {
      await cloudWorkouts.save(record);
    } catch (err) {
      console.warn('同步训练记录到云端失败:', err);
    }
  }
}

export async function getAllWorkouts(): Promise<WorkoutRecord[]> {
  // 如果已登录，优先从云端获取
  if (shouldUseCloud()) {
    try {
      const cloudRecords = await cloudWorkouts.getAll();
      return cloudRecords.map(cloudToLocal);
    } catch (err) {
      console.warn('从云端获取训练记录失败，使用本地数据:', err);
    }
  }

  return getAllFromLocal();
}

export async function getWorkoutById(id: string): Promise<WorkoutRecord | null> {
  const records = await getAllWorkouts();
  return records.find((r) => r.id === id) || null;
}

export async function deleteWorkout(id: string): Promise<void> {
  // 删除本地记录
  deleteFromLocal(id);

  // 如果已登录，同步删除云端记录
  if (shouldUseCloud()) {
    try {
      await cloudWorkouts.delete(id);
    } catch (err) {
      console.warn('删除云端训练记录失败:', err);
    }
  }
}

export async function getWorkoutStats(): Promise<WorkoutStats> {
  const records = await getAllWorkouts();
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const thisWeekWorkouts = records.filter(
    (r) => r.createdAt >= startOfWeek.getTime()
  ).length;

  const thisMonthWorkouts = records.filter(
    (r) => r.createdAt >= startOfMonth.getTime()
  ).length;

  const totalDuration = records.reduce((sum, r) => sum + r.duration, 0);
  const averageRating =
    records.length > 0
      ? records.reduce((sum, r) => sum + r.rating, 0) / records.length
      : 0;

  // 计算连续训练天数
  let currentStreak = 0;
  if (records.length > 0) {
    const sortedRecords = [...records].sort((a, b) => b.createdAt - a.createdAt);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let checkDate = today;
    for (const record of sortedRecords) {
      const recordDate = new Date(record.createdAt);
      recordDate.setHours(0, 0, 0, 0);

      if (recordDate.getTime() === checkDate.getTime()) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (recordDate.getTime() < checkDate.getTime()) {
        break;
      }
    }
  }

  return {
    totalWorkouts: records.length,
    totalDuration,
    thisWeekWorkouts,
    thisMonthWorkouts,
    currentStreak,
    averageRating: Math.round(averageRating * 10) / 10,
  };
}

export async function clearAllWorkouts(): Promise<void> {
  // 清空本地记录
  clearLocal();

  // 如果已登录，同步清空云端记录
  if (shouldUseCloud()) {
    try {
      await cloudWorkouts.clearAll();
    } catch (err) {
      console.warn('清空云端训练记录失败:', err);
    }
  }
}
