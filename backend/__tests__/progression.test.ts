import { describe, it, expect } from '@jest/globals';
import {
  extractExercisePerformance,
  calculateProgression,
  buildProgressionPrompt,
  getProgressionSummary,
} from '../src/progression.js';

describe('Progression Module', () => {
  // ====================================================
  // extractExercisePerformance
  // ====================================================
  describe('extractExercisePerformance', () => {
    it('应该从训练记录中提取动作表现数据', () => {
      const records = [
        {
          exercises: [{ name: '深蹲', weight: '60', reps: '8-12', sets: '3' }],
          created_at: 1000,
          rating: 4,
        },
        {
          exercises: [{ name: '深蹲', weight: '65', reps: '10', sets: '3' }],
          created_at: 2000,
          rating: 5,
        },
      ];

      const perf = extractExercisePerformance(records);

      expect(perf['深蹲']).toBeDefined();
      expect(perf['深蹲'].sessions).toBe(2);
      expect(perf['深蹲'].maxWeight).toBe(65);
      expect(perf['深蹲'].maxReps).toBe(10);
      expect(perf['深蹲'].maxSets).toBe(3);
      expect(perf['深蹲'].lastWeight).toBe(65);
      expect(perf['深蹲'].lastDate).toBe(2000);
      expect(perf['深蹲'].history).toHaveLength(2);
    });

    it('应该处理空记录数组', () => {
      expect(extractExercisePerformance([])).toEqual({});
    });

    it('应该处理没有 exercises 字段的记录', () => {
      expect(extractExercisePerformance([{ exercises: [] }])).toEqual({});
    });

    it('应该正确解析范围数字 (parseRangeNum 间接测试)', () => {
      const records = [{
        exercises: [{ name: '卧推', weight: '8-12', reps: '3组', sets: '10kg' }],
        created_at: 1000,
        rating: 3,
      }];

      const perf = extractExercisePerformance(records);

      // parseRangeNum("8-12") → 10 (均值)
      expect(perf['卧推'].maxWeight).toBe(10);
      // parseRangeNum("3组") → 3 (提取首个数字)
      expect(perf['卧推'].maxReps).toBe(3);
      // parseRangeNum("10kg") → 10 (提取首个数字)
      expect(perf['卧推'].maxSets).toBe(10);
    });

    it('应该处理空字符串和无效值', () => {
      const records = [{
        exercises: [{ name: '硬拉', weight: '', reps: null, sets: undefined }],
        created_at: 1000,
        rating: 3,
      }];

      const perf = extractExercisePerformance(records);

      expect(perf['硬拉'].maxWeight).toBe(0);
      expect(perf['硬拉'].maxReps).toBe(0);
      expect(perf['硬拉'].maxSets).toBe(0);
    });

    it('应该支持 exercise 字段替代 name 字段', () => {
      const records = [{
        exercises: [{ exercise: '硬拉', weight: '80', reps: '5', sets: '3' }],
        created_at: 1000,
        rating: 3,
      }];

      const perf = extractExercisePerformance(records);

      expect(perf['硬拉']).toBeDefined();
      expect(perf['硬拉'].maxWeight).toBe(80);
    });

    it('应该追踪最近一次训练数据', () => {
      const records = [
        {
          exercises: [{ name: '深蹲', weight: '50', reps: '10', sets: '3' }],
          created_at: 1000,
          rating: 3,
        },
        {
          exercises: [{ name: '深蹲', weight: '60', reps: '8', sets: '4' }],
          created_at: 3000,
          rating: 4,
        },
        {
          exercises: [{ name: '深蹲', weight: '55', reps: '12', sets: '2' }],
          created_at: 2000,
          rating: 3,
        },
      ];

      const perf = extractExercisePerformance(records);

      // lastDate 应为最大时间戳
      expect(perf['深蹲'].lastDate).toBe(3000);
      // lastWeight/Reps/Sets 应对应 lastDate 那次训练
      expect(perf['深蹲'].lastWeight).toBe(60);
      expect(perf['深蹲'].lastReps).toBe(8);
      expect(perf['深蹲'].lastSets).toBe(4);
    });

    it('应该处理多个不同动作', () => {
      const records = [{
        exercises: [
          { name: '深蹲', weight: '60', reps: '10', sets: '3' },
          { name: '卧推', weight: '40', reps: '10', sets: '3' },
        ],
        created_at: 1000,
        rating: 4,
      }];

      const perf = extractExercisePerformance(records);

      expect(Object.keys(perf)).toHaveLength(2);
      expect(perf['深蹲']).toBeDefined();
      expect(perf['卧推']).toBeDefined();
    });
  });

  // ====================================================
  // calculateProgression
  // ====================================================
  describe('calculateProgression', () => {
    it('avgRating >= 4 时应该建议增加强度', () => {
      const performance = {
        '深蹲': {
          sessions: 3,
          maxWeight: 60,
          maxReps: 12,
          maxSets: 3,
          lastWeight: 60,
          lastReps: 10,
          lastSets: 3,
          lastDate: 3000,
          history: [
            { date: 1000, weight: 50, reps: 10, sets: 3, rating: 4 },
            { date: 2000, weight: 55, reps: 10, sets: 3, rating: 4 },
            { date: 3000, weight: 60, reps: 10, sets: 3, rating: 5 },
          ],
        },
      };

      const result = calculateProgression(performance, { experience: 'beginner' });

      expect(result['深蹲'].adjustment).toBe('increase');
      expect(result['深蹲'].weight).toBeGreaterThan(60);
      expect(result['深蹲'].reason).toContain('增加');
    });

    it('avgRating <= 2 时应该建议降低强度', () => {
      const performance = {
        '深蹲': {
          sessions: 3,
          maxWeight: 60,
          maxReps: 12,
          maxSets: 3,
          lastWeight: 60,
          lastReps: 10,
          lastSets: 3,
          lastDate: 3000,
          history: [
            { date: 1000, weight: 50, reps: 10, sets: 3, rating: 2 },
            { date: 2000, weight: 55, reps: 10, sets: 3, rating: 1 },
            { date: 3000, weight: 60, reps: 10, sets: 3, rating: 2 },
          ],
        },
      };

      const result = calculateProgression(performance);

      expect(result['深蹲'].adjustment).toBe('decrease');
      expect(result['深蹲'].weight).toBeLessThan(60);
      expect(result['深蹲'].reason).toContain('降低');
    });

    it('avgRating 在 2-4 之间时应该建议保持', () => {
      const performance = {
        '深蹲': {
          sessions: 3,
          maxWeight: 60,
          maxReps: 12,
          maxSets: 3,
          lastWeight: 60,
          lastReps: 10,
          lastSets: 3,
          lastDate: 3000,
          history: [
            { date: 1000, weight: 50, reps: 10, sets: 3, rating: 3 },
            { date: 2000, weight: 55, reps: 10, sets: 3, rating: 3 },
            { date: 3000, weight: 60, reps: 10, sets: 3, rating: 3 },
          ],
        },
      };

      const result = calculateProgression(performance);

      expect(result['深蹲'].adjustment).toBe('maintain');
      expect(result['深蹲'].weight).toBe(60);
      expect(result['深蹲'].reason).toContain('适中');
    });

    it('sessions === 1 时应该标记为新动作', () => {
      const performance = {
        '深蹲': {
          sessions: 1,
          maxWeight: 60,
          maxReps: 10,
          maxSets: 3,
          lastWeight: 60,
          lastReps: 10,
          lastSets: 3,
          lastDate: 1000,
          history: [
            { date: 1000, weight: 60, reps: 10, sets: 3, rating: 4 },
          ],
        },
      };

      const result = calculateProgression(performance);

      expect(result['深蹲'].adjustment).toBe('new');
      expect(result['深蹲'].reps).toBe('8-12');
      expect(result['深蹲'].sets).toBe(3);
      expect(result['深蹲'].reason).toContain('首次');
    });

    it('应该处理空 performance 对象', () => {
      expect(calculateProgression({})).toEqual({});
    });

    it('不同经验水平应使用不同增量', () => {
      const performance = {
        '深蹲': {
          sessions: 3,
          maxWeight: 100,
          maxReps: 10,
          maxSets: 3,
          lastWeight: 100,
          lastReps: 10,
          lastSets: 3,
          lastDate: 3000,
          history: [
            { date: 1000, weight: 80, reps: 10, sets: 3, rating: 5 },
            { date: 2000, weight: 90, reps: 10, sets: 3, rating: 5 },
            { date: 3000, weight: 100, reps: 10, sets: 3, rating: 5 },
          ],
        },
      };

      // beginner: 5% increment → 100 * 1.05 = 105
      const beginnerResult = calculateProgression(performance, { experience: 'beginner' });
      expect(beginnerResult['深蹲'].weight).toBe(105);

      // intermediate: 7.5% → 100 * 1.075 = 107.5, round to 0.5 → 107.5
      const intermediateResult = calculateProgression(performance, { experience: 'intermediate' });
      expect(intermediateResult['深蹲'].weight).toBe(107.5);

      // advanced: 10% → 100 * 1.10 = 110
      const advancedResult = calculateProgression(performance, { experience: 'advanced' });
      expect(advancedResult['深蹲'].weight).toBe(110);
    });

    it('应该保留 previousWeight/Reps/Sets 字段', () => {
      const performance = {
        '深蹲': {
          sessions: 2,
          maxWeight: 60,
          maxReps: 12,
          maxSets: 3,
          lastWeight: 60,
          lastReps: 10,
          lastSets: 3,
          lastDate: 2000,
          history: [
            { date: 1000, weight: 50, reps: 10, sets: 3, rating: 3 },
            { date: 2000, weight: 60, reps: 10, sets: 3, rating: 3 },
          ],
        },
      };

      const result = calculateProgression(performance);

      expect(result['深蹲'].previousWeight).toBe(60);
      expect(result['深蹲'].previousReps).toBe(10);
      expect(result['深蹲'].previousSets).toBe(3);
    });
  });

  // ====================================================
  // buildProgressionPrompt
  // ====================================================
  describe('buildProgressionPrompt', () => {
    it('空 progression 应返回空字符串', () => {
      expect(buildProgressionPrompt({})).toBe('');
    });

    it('应包含动作名和渐进式信息', () => {
      const progression = {
        '深蹲': {
          exerciseName: '深蹲',
          sessions: 3,
          previousWeight: 60,
          previousReps: 10,
          previousSets: 3,
          reason: '最近表现优秀',
          adjustment: 'increase',
        },
      };

      const prompt = buildProgressionPrompt(progression);

      expect(prompt).toContain('深蹲');
      expect(prompt).toContain('已训练 3 次');
      expect(prompt).toContain('上次重量 60kg');
      expect(prompt).toContain('上次 3组×10次');
      expect(prompt).toContain('最近表现优秀');
      expect(prompt).toContain('渐进式超负荷');
    });

    it('应处理多个动作', () => {
      const progression = {
        '深蹲': {
          exerciseName: '深蹲',
          sessions: 3,
          previousWeight: 60,
          previousReps: 10,
          previousSets: 3,
          reason: '增加',
          adjustment: 'increase',
        },
        '卧推': {
          exerciseName: '卧推',
          sessions: 2,
          previousWeight: 40,
          previousReps: 10,
          previousSets: 3,
          reason: '保持',
          adjustment: 'maintain',
        },
      };

      const prompt = buildProgressionPrompt(progression);

      expect(prompt).toContain('深蹲');
      expect(prompt).toContain('卧推');
    });
  });

  // ====================================================
  // getProgressionSummary
  // ====================================================
  describe('getProgressionSummary', () => {
    it('应按调整类型排序: increase > maintain > decrease > new', () => {
      const progression = {
        '动作A': { exerciseName: '动作A', sessions: 2, previousWeight: 50, previousReps: 10, previousSets: 3, reason: '降低', adjustment: 'decrease' },
        '动作B': { exerciseName: '动作B', sessions: 2, previousWeight: 50, previousReps: 10, previousSets: 3, reason: '增加', adjustment: 'increase' },
        '动作C': { exerciseName: '动作C', sessions: 1, previousWeight: 0, previousReps: 10, previousSets: 3, reason: '新动作', adjustment: 'new' },
        '动作D': { exerciseName: '动作D', sessions: 2, previousWeight: 50, previousReps: 10, previousSets: 3, reason: '保持', adjustment: 'maintain' },
      };

      const summary = getProgressionSummary(progression);

      expect(summary).toHaveLength(4);
      expect(summary[0].adjustment).toBe('increase');
      expect(summary[1].adjustment).toBe('maintain');
      expect(summary[2].adjustment).toBe('decrease');
      expect(summary[3].adjustment).toBe('new');
    });

    it('应包含 emoji 和 previous 信息', () => {
      const progression = {
        '深蹲': { exerciseName: '深蹲', sessions: 2, previousWeight: 60, previousReps: 10, previousSets: 3, reason: '增加', adjustment: 'increase' },
      };

      const summary = getProgressionSummary(progression);

      expect(summary[0].emoji).toBe('📈');
      expect(summary[0].previous).toContain('60kg');
      expect(summary[0].previous).toContain('3组');
      expect(summary[0].previous).toContain('10次');
    });

    it('新动作应显示 首次 和 🆕 emoji', () => {
      const progression = {
        '新动作': { exerciseName: '新动作', sessions: 1, previousWeight: 0, previousReps: 10, previousSets: 3, reason: '首次', adjustment: 'new' },
      };

      const summary = getProgressionSummary(progression);

      expect(summary[0].previous).toBe('首次');
      expect(summary[0].emoji).toBe('🆕');
    });

    it('decrease 应显示 📉 emoji', () => {
      const progression = {
        '深蹲': { exerciseName: '深蹲', sessions: 2, previousWeight: 60, previousReps: 10, previousSets: 3, reason: '降低', adjustment: 'decrease' },
      };

      const summary = getProgressionSummary(progression);

      expect(summary[0].emoji).toBe('📉');
    });

    it('maintain 应显示 ➡️ emoji', () => {
      const progression = {
        '深蹲': { exerciseName: '深蹲', sessions: 2, previousWeight: 60, previousReps: 10, previousSets: 3, reason: '保持', adjustment: 'maintain' },
      };

      const summary = getProgressionSummary(progression);

      expect(summary[0].emoji).toBe('➡️');
    });

    it('空 progression 应返回空数组', () => {
      expect(getProgressionSummary({})).toEqual([]);
    });
  });
});
