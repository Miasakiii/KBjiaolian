const API_URL = process.env.MIMO_API_URL;
const API_KEY = process.env.MIMO_API_KEY;
const MODEL = process.env.MIMO_MODEL || 'mimo-v2.5';

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
}

// 流式响应版本（如果 API 支持）
export async function sendMessageStream(message, history = []) {
  const recentHistory = history.slice(-6);

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...recentHistory,
    { role: 'user', content: message },
  ];

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
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`MiMo API 错误: ${response.status} ${err}`);
  }

  return response.body;
}
