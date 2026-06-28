/**
 * 渐进式超负荷算法
 * 分析用户历史训练记录，自动调整训练强度
 */

// === 内部类型 ===

interface ExerciseHistoryEntry {
  date: number;
  weight: number;
  reps: number;
  sets: number;
  rating: number | undefined;
}

interface ExercisePerformance {
  sessions: number;
  maxWeight: number;
  maxReps: number;
  maxSets: number;
  lastWeight: number;
  lastReps: number;
  lastSets: number;
  lastDate: number;
  history: ExerciseHistoryEntry[];
}

export interface ProgressionSuggestion {
  exerciseName: string;
  sessions: number;
  previousWeight: number;
  previousReps: number;
  previousSets: number;
  weight: number;
  reps: string;
  sets: number;
  reason: string;
  adjustment: 'increase' | 'decrease' | 'maintain' | 'new';
}

export interface ProgressionSummaryItem {
  exercise: string;
  emoji: string;
  message: string;
  adjustment: string;
  previous: string;
}

/**
 * 解析 reps/sets/weight 字符串为数字。
 * 支持 "8-12" → 10（均值）、"3组" → 3、"10kg" → 10。
 */
function parseRangeNum(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value !== 'string') return 0;
  const trimmed = value.trim();
  if (trimmed === '') return 0;

  // "8-12" 取均值
  const rangeMatch = trimmed.match(/(\d+(?:\.\d+)?)\s*[-~到]\s*(\d+(?:\.\d+)?)/);
  if (rangeMatch) {
    const a = Number(rangeMatch[1]);
    const b = Number(rangeMatch[2]);
    if (Number.isFinite(a) && Number.isFinite(b)) return Math.round((a + b) / 2);
  }

  // 提取首个数字
  const numMatch = trimmed.match(/(\d+(?:\.\d+)?)/);
  if (numMatch) {
    const n = Number(numMatch[1]);
    if (Number.isFinite(n)) return n;
  }
  return 0;
}

/**
 * 从历史训练记录中提取每个动作的表现数据
 */
export function extractExercisePerformance(
  workoutRecords: Array<Record<string, unknown>>
): Record<string, ExercisePerformance> {
  const performance: Record<string, ExercisePerformance> = {};

  for (const record of workoutRecords) {
    const exercises = Array.isArray(record.exercises) ? record.exercises as Array<Record<string, unknown>> : [];

    for (const exercise of exercises) {
      const name = (exercise.name || exercise.exercise) as string | undefined;
      if (!name) continue;

      if (!performance[name]) {
        performance[name] = {
          sessions: 0,
          maxWeight: 0,
          maxReps: 0,
          maxSets: 0,
          lastWeight: 0,
          lastReps: 0,
          lastSets: 0,
          lastDate: 0,
          history: [],
        };
      }

      const perf = performance[name];
      perf.sessions++;

      const weight = parseRangeNum(exercise.weight);
      const reps = parseRangeNum(exercise.reps);
      const sets = parseRangeNum(exercise.sets);

      perf.maxWeight = Math.max(perf.maxWeight, weight);
      perf.maxReps = Math.max(perf.maxReps, reps);
      perf.maxSets = Math.max(perf.maxSets, sets);

      // 记录最近一次的数据
      const recordDate = (record.created_at || record.startTime || 0) as number;
      if (recordDate > perf.lastDate) {
        perf.lastDate = recordDate;
        perf.lastWeight = weight;
        perf.lastReps = reps;
        perf.lastSets = sets;
      }

      perf.history.push({
        date: recordDate,
        weight,
        reps,
        sets,
        rating: record.rating as number | undefined,
      });
    }
  }

  return performance;
}

/**
 * 计算渐进式超负荷建议
 * 基于历史数据，为每个动作生成下一步的训练参数
 */
export function calculateProgression(
  performance: Record<string, ExercisePerformance>,
  userProfile: { experience?: string } = {}
): Record<string, ProgressionSuggestion> {
  const { experience = 'beginner' } = userProfile;
  const suggestions: Record<string, ProgressionSuggestion> = {};

  // 根据经验水平调整增量
  const incrementMap: Record<string, { weightPercent: number; repIncrease: number; setsIncrease: number }> = {
    beginner: { weightPercent: 0.05, repIncrease: 2, setsIncrease: 0 },
    intermediate: { weightPercent: 0.075, repIncrease: 1, setsIncrease: 0 },
    advanced: { weightPercent: 0.10, repIncrease: 1, setsIncrease: 1 },
  };
  const increment = incrementMap[experience] || incrementMap.beginner;

  for (const [exerciseName, perf] of Object.entries(performance)) {
    const lastRating = perf.history.length > 0
      ? perf.history[perf.history.length - 1].rating || 3
      : 3;

    // 判断最近的趋势（最近 3 次的平均表现）
    const recentHistory = perf.history.slice(-3);
    const avgRating = recentHistory.length > 0
      ? recentHistory.reduce((sum, h) => sum + (h.rating || 3), 0) / recentHistory.length
      : 3;

    const suggestion: ProgressionSuggestion = {
      exerciseName,
      sessions: perf.sessions,
      previousWeight: perf.lastWeight,
      previousReps: perf.lastReps,
      previousSets: perf.lastSets,
      weight: 0,
      reps: '',
      sets: 0,
      reason: '',
      adjustment: 'maintain',
    };

    if (perf.sessions === 1) {
      // 新动作（仅训练过 1 次）：使用保守起点
      suggestion.weight = perf.lastWeight || 0;
      suggestion.reps = '8-12';
      suggestion.sets = 3;
      suggestion.reason = '首次训练，建议从轻重量开始';
      suggestion.adjustment = 'new';
    } else if (avgRating >= 4) {
      // 表现优秀：增加强度
      const newWeight = perf.lastWeight > 0
        ? Math.round(perf.lastWeight * (1 + increment.weightPercent) / 0.5) * 0.5
        : 0;
      const newReps = perf.lastReps + increment.repIncrease;

      suggestion.weight = newWeight;
      suggestion.reps = `${Math.max(6, newReps - 2)}-${newReps}`;
      suggestion.sets = perf.lastSets + increment.setsIncrease;
      suggestion.reason = `最近表现优秀（平均评分 ${avgRating.toFixed(1)}），增加训练强度`;
      suggestion.adjustment = 'increase';
    } else if (avgRating <= 2) {
      // 表现困难：降低或保持
      const newWeight = perf.lastWeight > 0
        ? Math.round(perf.lastWeight * 0.95 / 0.5) * 0.5
        : 0;

      suggestion.weight = newWeight;
      suggestion.reps = `${Math.max(6, perf.lastReps - 1)}-${perf.lastReps}`;
      suggestion.sets = Math.max(2, perf.lastSets);
      suggestion.reason = `最近训练较吃力（平均评分 ${avgRating.toFixed(1)}），适当降低强度`;
      suggestion.adjustment = 'decrease';
    } else {
      // 表现适中：保持或微调
      suggestion.weight = perf.lastWeight;
      suggestion.reps = `${perf.lastReps}-${perf.lastReps + 1}`;
      suggestion.sets = perf.lastSets;
      suggestion.reason = `训练强度适中（平均评分 ${avgRating.toFixed(1)}），保持并微调`;
      suggestion.adjustment = 'maintain';
    }

    // suppress unused variable warning
    void lastRating;

    suggestions[exerciseName] = suggestion;
  }

  return suggestions;
}

/**
 * 生成渐进式超负荷的 Prompt 补充内容
 */
export function buildProgressionPrompt(progression: Record<string, ProgressionSuggestion>): string {
  const entries = Object.entries(progression);
  if (entries.length === 0) return '';

  const lines = entries.map(([name, s]) => {
    const parts = [`- ${name}`];
    if (s.sessions > 0) {
      parts.push(`已训练 ${s.sessions} 次`);
      if (s.previousWeight > 0) parts.push(`上次重量 ${s.previousWeight}kg`);
      parts.push(`上次 ${s.previousSets}组×${s.previousReps}次`);
      parts.push(`建议：${s.reason}`);
    } else {
      parts.push('新动作');
    }
    return parts.join('，');
  });

  return `
**用户历史训练数据（渐进式超负荷参考）：**
${lines.join('\n')}

请根据以上历史数据调整训练方案：
- 对于表现优秀的动作，适当增加重量或次数
- 对于困难的动作，适当降低强度
- 对于新动作，使用保守的起点
- 确保整体训练量是渐进的，避免突然大幅增加
`;
}

/**
 * 生成训练建议摘要（用于前端展示）
 */
export function getProgressionSummary(progression: Record<string, ProgressionSuggestion>): ProgressionSummaryItem[] {
  const summary: ProgressionSummaryItem[] = [];

  for (const [name, s] of Object.entries(progression)) {
    const emoji = s.adjustment === 'increase' ? '📈'
      : s.adjustment === 'decrease' ? '📉'
      : s.adjustment === 'new' ? '🆕'
      : '➡️';
    summary.push({
      exercise: name,
      emoji,
      message: s.reason,
      adjustment: s.adjustment,
      previous: s.previousWeight > 0 ? `${s.previousWeight}kg × ${s.previousSets}组×${s.previousReps}次` : '首次',
    });
  }

  // 按调整类型排序：增加 > 保持 > 降低 > 新
  summary.sort((a, b) => {
    const order: Record<string, number> = { increase: 0, maintain: 1, decrease: 2, new: 3 };
    return (order[a.adjustment] ?? 1) - (order[b.adjustment] ?? 1);
  });

  return summary;
}
