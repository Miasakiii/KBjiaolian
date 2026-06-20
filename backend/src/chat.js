const API_URL = process.env.MIMO_API_URL;
const API_KEY = process.env.MIMO_API_KEY;
const MODEL = process.env.MIMO_MODEL || 'mimo-v2.5';

// 启动时校验关键环境变量（测试环境跳过以方便 mock）
if (process.env.NODE_ENV !== 'test' && (!API_URL || !API_KEY)) {
  throw new Error('MIMO_API_URL / MIMO_API_KEY 环境变量未设置');
}

// 精简 Prompt，减少 token 消耗
const SYSTEM_PROMPT = `你是KB教练，专业的AI健身顾问。回答要求：
- 用列表和**加粗**组织内容
- 简洁具体，控制在100字内
- 复杂问题最多200字
- 不提供医疗诊断`;

export async function sendMessage(message, history = []) {
  // 只保留最近6条消息，减少 token
  const recentHistory = history.slice(-6);

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...recentHistory,
    { role: 'user', content: message },
  ];

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000);

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': API_KEY,
      },
      body: JSON.stringify({
        model: MODEL,
        messages,
        max_tokens: 512,  // 减少 token 数量
        temperature: 0.7,
        stream: false,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`MiMo API 错误: ${response.status} ${err}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('MiMo API 返回为空');
    }

    return content;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('AI API 请求超时，请稍后重试');
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

// 流式响应版本（如果 API 支持）。可选传入外部 signal 用于取消上游请求
export async function sendMessageStream(message, history = [], externalSignal) {
  const recentHistory = history.slice(-6);

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...recentHistory,
    { role: 'user', content: message },
  ];

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000);

  // 如果调用方提供了外部 signal（如客户端断开），同步取消本地请求
  const onExternalAbort = () => controller.abort();
  if (externalSignal) {
    if (externalSignal.aborted) controller.abort();
    else externalSignal.addEventListener('abort', onExternalAbort, { once: true });
  }

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': API_KEY,
      },
      body: JSON.stringify({
        model: MODEL,
        messages,
        max_tokens: 512,
        temperature: 0.7,
        stream: true,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`MiMo API 错误: ${response.status} ${err}`);
    }

    return response.body;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('AI API 请求超时或已取消');
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
    if (externalSignal) {
      externalSignal.removeEventListener('abort', onExternalAbort);
    }
  }
}
