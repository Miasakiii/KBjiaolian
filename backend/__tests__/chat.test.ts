import { jest, describe, it, expect, beforeEach } from '@jest/globals';

// 设置测试环境变量
process.env.MIMO_API_URL = 'https://api.test.com/v1/chat/completions';
process.env.MIMO_API_KEY = 'test-api-key';
process.env.MIMO_MODEL = 'mimo-v2.5';

// 模拟 fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

// 动态导入模块
const chatModule = await import('../src/chat.js');

describe('Chat Module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('sendMessage', () => {
    it('应该成功发送消息并获取回复', async () => {
      const mockReply = '建议每周进行3-4次力量训练，配合有氧运动。';

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: mockReply,
              },
            },
          ],
        }),
      });

      const result = await chatModule.sendMessage('如何制定健身计划？');

      expect(result).toBe(mockReply);
    });

    it('应该传递历史消息', async () => {
      const mockReply = '好的，我来帮你制定计划。';

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: mockReply,
              },
            },
          ],
        }),
      });

      const history = [
        { role: 'user', content: '你好' },
        { role: 'assistant', content: '你好！有什么可以帮助你的吗？' },
      ];

      await chatModule.sendMessage('帮我制定健身计划', history);

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.messages).toHaveLength(4); // system + 2 history + user
      expect(callBody.messages[0].role).toBe('system');
      expect(callBody.messages[1].role).toBe('user');
      expect(callBody.messages[2].role).toBe('assistant');
      expect(callBody.messages[3].role).toBe('user');
    });

    it('应该只保留最近6条历史消息', async () => {
      const mockReply = '收到。';

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: mockReply,
              },
            },
          ],
        }),
      });

      // 创建10条历史消息
      const history = [];
      for (let i = 0; i < 10; i++) {
        history.push({ role: 'user', content: `消息${i}` });
        history.push({ role: 'assistant', content: `回复${i}` });
      }

      await chatModule.sendMessage('新消息', history);

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      // 应该只有 system + 6条历史 + 1条新消息 = 8条
      expect(callBody.messages).toHaveLength(8);
    });

    it('应该处理 API 错误响应', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => 'Internal Server Error',
      });

      await expect(chatModule.sendMessage('测试'))
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

      await expect(chatModule.sendMessage('测试'))
        .rejects.toThrow('MiMo API 返回为空');
    });

    it('应该使用正确的 API 参数', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: '测试回复',
              },
            },
          ],
        }),
      });

      await chatModule.sendMessage('测试消息');

      expect(mockFetch).toHaveBeenCalledWith(
        process.env.MIMO_API_URL,
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'api-key': process.env.MIMO_API_KEY,
          },
          body: expect.any(String),
        })
      );

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.model).toBe(process.env.MIMO_MODEL);
      expect(callBody.max_tokens).toBe(512);
      expect(callBody.temperature).toBe(0.7);
      expect(callBody.stream).toBe(false);
    });
  });

  describe('sendMessageStream', () => {
    it('应该返回流式响应体', async () => {
      const mockStream = new ReadableStream();
      mockFetch.mockResolvedValueOnce({
        ok: true,
        body: mockStream,
      });

      const result = await chatModule.sendMessageStream('测试');

      expect(result).toBe(mockStream);
    });

    it('应该使用流式参数', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        body: new ReadableStream(),
      });

      await chatModule.sendMessageStream('测试');

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.stream).toBe(true);
    });

    it('应该处理 API 错误响应', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        text: async () => 'Rate limit exceeded',
      });

      await expect(chatModule.sendMessageStream('测试'))
        .rejects.toThrow('MiMo API 错误: 429 Rate limit exceeded');
    });
  });
});
