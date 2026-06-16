import { jest, describe, it, expect, beforeEach } from '@jest/globals';

// 设置测试环境变量
process.env.MIMO_API_URL = 'https://api.test.com/v1/chat/completions';
process.env.MIMO_API_KEY = 'test-api-key';
process.env.MIMO_MODEL = 'mimo-v2.5';

// 模拟 fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

// 动态导入模块
const nutritionModule = await import('../src/nutrition.js');

describe('Nutrition Module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('analyzeFood', () => {
    it('应该成功分析食物图片', async () => {
      const mockResult = {
        foods: [
          {
            name: '鸡胸肉',
            portion: '150克',
            calories: 165,
            protein: 31,
            carbs: 0,
            fat: 3.6,
          },
          {
            name: '糙米饭',
            portion: '200克',
            calories: 220,
            protein: 5,
            carbs: 46,
            fat: 1.8,
          },
        ],
        totalCalories: 385,
        totalProtein: 36,
        totalCarbs: 46,
        totalFat: 5.4,
        tips: '蛋白质摄入充足，建议增加蔬菜',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: JSON.stringify(mockResult),
              },
            },
          ],
        }),
      });

      const result = await nutritionModule.analyzeFood('data:image/jpeg;base64,test-image-1');

      expect(result.foods).toHaveLength(2);
      expect(result.foods[0].name).toBe('鸡胸肉');
      expect(result.totalCalories).toBe(385);
      expect(result.totalProtein).toBe(36);
    });

    it('应该处理 API 错误响应', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => 'Internal Server Error',
      });

      await expect(nutritionModule.analyzeFood('data:image/jpeg;base64,test-image-' + Math.random()))
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

      await expect(nutritionModule.analyzeFood('data:image/jpeg;base64,test-image-' + Math.random()))
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

      await expect(nutritionModule.analyzeFood('data:image/jpeg;base64,test-image-' + Math.random()))
        .rejects.toThrow('无法解析 AI 返回的 JSON');
    });

    it('应该处理网络超时', async () => {
      const abortError = new Error('The operation was aborted');
      abortError.name = 'AbortError';

      mockFetch.mockRejectedValueOnce(abortError);

      await expect(nutritionModule.analyzeFood('data:image/jpeg;base64,test-image-' + Math.random()))
        .rejects.toThrow('AI API 请求超时，请稍后重试');
    });

    it('应该规范化返回结果', async () => {
      const rawResult = {
        foods: [
          {
            name: '苹果',
            portion: '1个',
            calories: 52.5,
            protein: 0.3,
            carbs: 14,
            fat: 0.2,
          },
        ],
        totalCalories: 52.5,
        totalProtein: 0.3,
        totalCarbs: 14,
        totalFat: 0.2,
        tips: '健康零食选择',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: JSON.stringify(rawResult),
              },
            },
          ],
        }),
      });

      const result = await nutritionModule.analyzeFood('data:image/jpeg;base64,test-image');

      // 应该四舍五入到整数
      expect(result.foods[0].calories).toBe(53);
      expect(result.foods[0].protein).toBe(0);
      expect(result.totalCalories).toBe(53);
    });

    it('应该使用正确的 API 参数', async () => {
      const mockResult = {
        foods: [],
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0,
        tips: '',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: JSON.stringify(mockResult),
              },
            },
          ],
        }),
      });

      await nutritionModule.analyzeFood('data:image/jpeg;base64,test-image-api-check');

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
      expect(callBody.max_completion_tokens).toBe(2048);
      expect(callBody.temperature).toBe(0);
    });
  });
});
