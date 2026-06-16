import { jest, describe, it, expect, beforeEach } from '@jest/globals';

// 设置测试环境变量
process.env.MIMO_API_URL = 'https://api.test.com/v1/chat/completions';
process.env.MIMO_API_KEY = 'test-api-key';
process.env.MIMO_MODEL = 'mimo-v2.5';

// 模拟 fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

// 动态导入模块
const planModule = await import('../src/plan.js');

describe('Plan Module', () => {
  const mockAnalysisResult = {
    score: 75,
    summary: '体态基本良好，存在轻微圆肩问题',
    issues: [
      { name: '圆肩', severity: 'mild', description: '肩部前伸' },
    ],
    radar: {
      headForward: 20,
      roundShoulder: 35,
      pelvicTilt: 15,
      kneeExtension: 10,
    },
    suggestions: ['加强背部肌肉训练'],
  };

  const mockParams = {
    goal: 'muscle_gain',
    experience: 'intermediate',
    equipment: 'gym',
    daysPerWeek: 4,
    sessionDuration: 60,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generatePlan', () => {
    it('应该成功生成训练方案', async () => {
      const mockPlan = {
        name: '增肌训练计划 · 4天/周',
        durationWeeks: 8,
        schedule: [
          {
            day: 1,
            name: '胸部 + 三头肌',
            exercises: [
              {
                name: '杠铃卧推',
                sets: 4,
                reps: '8-12次',
                restSec: 90,
                notes: '控制下放速度',
                targetMuscle: '胸大肌',
              },
            ],
            estimatedDuration: 60,
          },
        ],
        nutrition: {
          calories: 2500,
          protein: 150,
          carbs: 300,
          fat: 70,
          notes: '增加蛋白质摄入',
        },
        notes: '注意热身，循序渐进',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: JSON.stringify(mockPlan),
              },
            },
          ],
        }),
      });

      const result = await planModule.generatePlan(mockParams, mockAnalysisResult);

      expect(result).toEqual(expect.objectContaining({
        name: mockPlan.name,
        durationWeeks: mockPlan.durationWeeks,
        schedule: mockPlan.schedule,
        nutrition: mockPlan.nutrition,
        notes: mockPlan.notes,
        goal: mockParams.goal,
        experience: mockParams.experience,
        equipment: mockParams.equipment,
        daysPerWeek: mockParams.daysPerWeek,
        sessionDuration: mockParams.sessionDuration,
      }));
      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeDefined();
    });

    it('应该处理 API 错误响应', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => 'Internal Server Error',
      });

      await expect(planModule.generatePlan(mockParams, mockAnalysisResult))
        .rejects.toThrow('MiMo API 错误: 500 Internal Server Error');
    });

    it('应该处理 API 返回空内容', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: '',
              },
            },
          ],
        }),
      });

      await expect(planModule.generatePlan(mockParams, mockAnalysisResult))
        .rejects.toThrow('MiMo API 返回为空');
    });

    it('应该处理 API 返回无效 JSON', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: '这不是一个 JSON 字符串',
              },
            },
          ],
        }),
      });

      await expect(planModule.generatePlan(mockParams, mockAnalysisResult))
        .rejects.toThrow('无法解析 AI 返回的 JSON');
    });

    it('应该处理网络超时', async () => {
      const abortError = new Error('The operation was aborted');
      abortError.name = 'AbortError';

      mockFetch.mockRejectedValueOnce(abortError);

      await expect(planModule.generatePlan(mockParams, mockAnalysisResult))
        .rejects.toThrow('AI API 请求超时，请稍后重试');
    });

    it('应该处理网络错误', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(planModule.generatePlan(mockParams, mockAnalysisResult))
        .rejects.toThrow('Network error');
    });

    it('应该使用正确的 API 参数', async () => {
      const mockPlan = {
        name: '测试计划',
        durationWeeks: 4,
        schedule: [],
        nutrition: {},
        notes: '',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: JSON.stringify(mockPlan),
              },
            },
          ],
        }),
      });

      await planModule.generatePlan(mockParams, mockAnalysisResult);

      expect(mockFetch).toHaveBeenCalledWith(
        process.env.MIMO_API_URL,
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'api-key': process.env.MIMO_API_KEY,
          },
          body: expect.any(String),
          signal: expect.any(AbortSignal),
        })
      );

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.model).toBe(process.env.MIMO_MODEL);
      expect(callBody.messages).toHaveLength(2);
      expect(callBody.max_completion_tokens).toBe(4096);
      expect(callBody.temperature).toBe(0.3);
    });
  });
});
