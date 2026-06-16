import { jest, describe, it, expect, beforeEach } from '@jest/globals';

// 设置测试环境变量
process.env.MIMO_API_URL = 'https://api.test.com/v1/chat/completions';
process.env.MIMO_API_KEY = 'test-api-key';
process.env.MIMO_MODEL = 'mimo-v2.5';

// 模拟 fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

// 动态导入模块
const analyzeModule = await import('../src/analyze.js');

describe('Analyze Module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('analyzePhoto', () => {
    it('应该成功分析体态照片', async () => {
      const mockResult = {
        score: 75,
        summary: '体态基本良好，存在轻微圆肩问题',
        issues: [
          { name: '圆肩', severity: 'mild' },
        ],
        radar: {
          headForward: 20,
          roundShoulder: 35,
          pelvicTilt: 15,
          kneeExtension: 10,
        },
        suggestions: [
          {
            exercise: '面拉',
            sets: '3组 x 15次',
            description: '加强肩袖肌群',
            targetMuscle: '肩袖',
            difficulty: '初级',
            steps: ['站立', '拉绳', '收缩'],
            tips: ['保持挺胸'],
          },
        ],
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

      const result = await analyzeModule.analyzePhoto('data:image/jpeg;base64,test-image-1');

      expect(result.score).toBe(75);
      expect(result.summary).toContain('体态');
      expect(result.issues).toHaveLength(1);
      expect(result.radar).toBeDefined();
      expect(result.suggestions).toBeDefined();
    });

    it('应该处理 API 错误响应', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => 'Internal Server Error',
      });

      await expect(analyzeModule.analyzePhoto('data:image/jpeg;base64,test-image-error'))
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

      await expect(analyzeModule.analyzePhoto('data:image/jpeg;base64,test-image-empty'))
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

      await expect(analyzeModule.analyzePhoto('data:image/jpeg;base64,test-image-invalid'))
        .rejects.toThrow('无法解析 AI 返回的 JSON');
    });

    it('应该处理网络超时', async () => {
      const abortError = new Error('The operation was aborted');
      abortError.name = 'AbortError';

      mockFetch.mockRejectedValueOnce(abortError);

      await expect(analyzeModule.analyzePhoto('data:image/jpeg;base64,test-image-timeout'))
        .rejects.toThrow('AI API 请求超时，请稍后重试');
    });

    it('应该规范化评分到合理范围', async () => {
      const rawResult = {
        score: 150, // 超出范围
        summary: '测试',
        issues: [],
        radar: {
          headForward: -10, // 负数
          roundShoulder: 200, // 超出范围
          pelvicTilt: 50,
          kneeExtension: 50,
        },
        suggestions: [],
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

      const result = await analyzeModule.analyzePhoto('data:image/jpeg;base64,test-image-normalize');

      expect(result.score).toBe(100); // 被限制到100
      expect(result.radar.headForward).toBe(0); // 被限制到0
      expect(result.radar.roundShoulder).toBe(100); // 被限制到100
    });

    it('应该使用正确的 API 参数', async () => {
      const mockResult = {
        score: 80,
        summary: '良好',
        issues: [],
        radar: { headForward: 10, roundShoulder: 10, pelvicTilt: 10, kneeExtension: 10 },
        suggestions: [],
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

      await analyzeModule.analyzePhoto('data:image/jpeg;base64,test-image-api-check');

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
      expect(callBody.max_completion_tokens).toBe(4096);
      expect(callBody.temperature).toBe(0);
    });
  });
});
