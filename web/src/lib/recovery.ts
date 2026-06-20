/**
 * 肌肉恢复追踪算法
 *
 * 基于训练记录计算各肌群恢复状态：
 * - 训练后 0h：0%（刚练完）
 * - 训练后 24h：33%
 * - 训练后 48h：66%
 * - 训练后 72h+：100%（完全恢复）
 *
 * 恢复时间受训练量（组数）影响：
 * - 每多 3 组，恢复时间 +12h
 */

import { WorkoutRecord } from '@/types/workout';

export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'arms'
  | 'legs'
  | 'core'
  | 'glutes';

export const muscleLabels: Record<MuscleGroup, string> = {
  chest: '胸部',
  back: '背部',
  shoulders: '肩部',
  arms: '手臂',
  legs: '腿部',
  core: '核心',
  glutes: '臀部',
};

export const muscleEmojis: Record<MuscleGroup, string> = {
  chest: '💪',
  back: '🔙',
  shoulders: '🏋️',
  arms: '💪',
  legs: '🦵',
  core: '🎯',
  glutes: '🍑',
};

/** 基础恢复时间（小时） */
const BASE_RECOVERY_HOURS = 72;

/** 每额外 3 组增加的恢复时间 */
const EXTRA_SETS_RECOVERY_HOURS = 12;

/** 动作名到肌群的映射关键词 */
const MUSCLE_KEYWORDS: [string, MuscleGroup][] = [
  // 胸部
  ['卧推', 'chest'], ['飞鸟', 'chest'], ['俯卧撑', 'chest'],
  ['上斜', 'chest'], ['下斜', 'chest'], ['夹胸', 'chest'],
  // 背部
  ['引体', 'back'], ['划船', 'back'], ['下拉', 'back'],
  ['硬拉', 'back'], ['高位下拉', 'back'], ['坐姿划船', 'back'],
  // 肩部
  ['推举', 'shoulders'], ['侧平举', 'shoulders'], ['前平举', 'shoulders'],
  ['面拉', 'shoulders'], ['耸肩', 'shoulders'], ['阿诺德', 'shoulders'],
  // 手臂
  ['弯举', 'arms'], ['臂屈伸', 'arms'], ['锤式', 'arms'],
  ['三头', 'arms'], ['二头', 'arms'], ['绳索下压', 'arms'],
  // 腿部
  ['深蹲', 'legs'], ['弓步', 'legs'], ['腿举', 'legs'],
  ['提踵', 'legs'], ['腿弯举', 'legs'], ['腿屈伸', 'legs'],
  ['罗马尼亚硬拉', 'legs'],
  // 核心
  ['平板支撑', 'core'], ['卷腹', 'core'], ['仰卧起坐', 'core'],
  ['俄罗斯转体', 'core'], ['死虫', 'core'], ['悬垂举腿', 'core'],
  ['登山跑', 'core'],
  // 臀部
  ['臀推', 'glutes'], ['臀桥', 'glutes'], ['蚌式', 'glutes'],
  ['后踢腿', 'glutes'],
];

export interface MuscleRecovery {
  muscle: MuscleGroup;
  /** 恢复百分比 0-100 */
  recovery: number;
  /** 最后训练时间戳 */
  lastTrainedAt: number | null;
  /** 最后训练距今小时数 */
  hoursSinceTraining: number | null;
  /** 最近 7 天训练次数 */
  weeklyFrequency: number;
  /** 状态文字 */
  status: 'recovered' | 'recovering' | 'fresh';
}

/**
 * 识别动作名所属肌群
 */
function identifyMuscle(exerciseName: string): MuscleGroup | null {
  for (const [keyword, muscle] of MUSCLE_KEYWORDS) {
    if (exerciseName.includes(keyword)) {
      return muscle;
    }
  }
  return null;
}

/**
 * 计算某次训练中各肌群的总组数
 */
function countSetsByMuscle(record: WorkoutRecord): Map<MuscleGroup, number> {
  const counts = new Map<MuscleGroup, number>();
  for (const ex of record.exercises) {
    const muscle = identifyMuscle(ex.name);
    if (muscle) {
      counts.set(muscle, (counts.get(muscle) || 0) + ex.sets.length);
    }
  }
  return counts;
}

/**
 * 计算所有肌群的恢复状态
 */
export function calculateRecovery(records: WorkoutRecord[]): MuscleRecovery[] {
  const now = Date.now();
  const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;

  // 每个肌群的最近训练时间和总组数
  const lastTraining = new Map<MuscleGroup, { time: number; sets: number }>();
  const weeklyCounts = new Map<MuscleGroup, number>();

  // 按时间排序（最新在前）
  const sorted = [...records].sort((a, b) => b.createdAt - a.createdAt);

  for (const record of sorted) {
    const setsByMuscle = countSetsByMuscle(record);

    for (const [muscle, sets] of Array.from(setsByMuscle.entries())) {
      // 记录最近一次训练
      if (!lastTraining.has(muscle)) {
        lastTraining.set(muscle, { time: record.createdAt, sets });
      }

      // 统计每周频率
      if (record.createdAt >= oneWeekAgo) {
        weeklyCounts.set(muscle, (weeklyCounts.get(muscle) || 0) + 1);
      }
    }
  }

  // 计算每个肌群的恢复状态
  const allMuscles: MuscleGroup[] = ['chest', 'back', 'shoulders', 'arms', 'legs', 'core', 'glutes'];

  return allMuscles.map((muscle) => {
    const info = lastTraining.get(muscle);

    if (!info) {
      return {
        muscle,
        recovery: 100,
        lastTrainedAt: null,
        hoursSinceTraining: null,
        weeklyFrequency: weeklyCounts.get(muscle) || 0,
        status: 'recovered' as const,
      };
    }

    const hoursSince = (now - info.time) / (1000 * 60 * 60);

    // 恢复时间 = 基础时间 + 额外组数的恢复时间
    const extraSets = Math.max(0, info.sets - 3);
    const recoveryHours = BASE_RECOVERY_HOURS + Math.floor(extraSets / 3) * EXTRA_SETS_RECOVERY_HOURS;

    // 恢复百分比（线性插值）
    const recovery = Math.min(100, Math.round((hoursSince / recoveryHours) * 100));

    let status: MuscleRecovery['status'];
    if (recovery >= 100) {
      status = 'recovered';
    } else if (hoursSince < 24) {
      status = 'fresh';
    } else {
      status = 'recovering';
    }

    return {
      muscle,
      recovery,
      lastTrainedAt: info.time,
      hoursSinceTraining: Math.round(hoursSince),
      weeklyFrequency: weeklyCounts.get(muscle) || 0,
      status,
    };
  });
}

/**
 * 获取恢复状态对应的颜色
 */
export function getRecoveryColor(recovery: number): string {
  if (recovery >= 80) return 'bg-green-500';
  if (recovery >= 50) return 'bg-yellow-500';
  if (recovery >= 25) return 'bg-orange-500';
  return 'bg-red-500';
}

/**
 * 获取恢复状态对应的浅色背景
 */
export function getRecoveryBgColor(recovery: number): string {
  if (recovery >= 80) return 'bg-green-50 border-green-200';
  if (recovery >= 50) return 'bg-yellow-50 border-yellow-200';
  if (recovery >= 25) return 'bg-orange-50 border-orange-200';
  return 'bg-red-50 border-red-200';
}

/**
 * 获取恢复状态文字
 */
export function getRecoveryLabel(recovery: number): string {
  if (recovery >= 100) return '完全恢复';
  if (recovery >= 80) return '基本恢复';
  if (recovery >= 50) return '恢复中';
  if (recovery >= 25) return '恢复较弱';
  return '未恢复';
}

/**
 * 格式化小时数为可读文字
 */
export function formatHours(hours: number | null): string {
  if (hours === null) return '无记录';
  if (hours < 1) return '不到1小时';
  if (hours < 24) return `${hours}小时前`;
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  if (remainingHours === 0) return `${days}天前`;
  return `${days}天${remainingHours}小时前`;
}

/**
 * 训练频率热力图数据
 * 返回最近 28 天（4 周）每天的训练次数
 */
export function getFrequencyHeatmap(records: WorkoutRecord[]): {
  date: string;
  count: number;
  dayOfWeek: number;
}[] {
  const now = new Date();
  const days: { date: string; count: number; dayOfWeek: number }[] = [];

  for (let i = 27; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    const dayStart = date.getTime();
    const dayEnd = dayStart + 24 * 60 * 60 * 1000;

    const count = records.filter(
      (r) => r.createdAt >= dayStart && r.createdAt < dayEnd
    ).length;

    days.push({
      date: date.toISOString().split('T')[0],
      count,
      dayOfWeek: date.getDay(),
    });
  }

  return days;
}

/**
 * 获取热力图方块的颜色
 */
export function getHeatmapColor(count: number): string {
  if (count === 0) return 'bg-gray-100';
  if (count === 1) return 'bg-green-200';
  if (count === 2) return 'bg-green-400';
  return 'bg-green-600';
}
