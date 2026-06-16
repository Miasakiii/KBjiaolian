const API_URL = process.env.MIMO_API_URL;
const API_KEY = process.env.MIMO_API_KEY;
const MODEL = process.env.MIMO_MODEL || 'mimo-v2.5';

// 结果缓存：对相同图片返回一致结果
const analysisCache = new Map();
const CACHE_MAX_SIZE = 100;

function getCacheKey(base64Image) {
  // 使用图片的前1000字符作为缓存key（避免内存过大）
  let hash = 0;
  const str = base64Image.substring(0, 1000);
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
}

function normalizeScore(value, min = 0, max = 100) {
  const num = Math.round(Number(value));
  return Math.max(min, Math.min(max, num));
}

function normalizeResult(result) {
  // 标准化评分到合理范围
  return {
    score: normalizeScore(result.score),
    summary: String(result.summary || '').substring(0, 200),
    issues: Array.isArray(result.issues) ? result.issues.map(issue => ({
      name: String(issue.name || ''),
      severity: ['mild', 'moderate', 'severe'].includes(issue.severity) ? issue.severity : 'moderate'
    })) : [],
    radar: {
      headForward: normalizeScore(result.radar?.headForward),
      roundShoulder: normalizeScore(result.radar?.roundShoulder),
      pelvicTilt: normalizeScore(result.radar?.pelvicTilt),
      kneeExtension: normalizeScore(result.radar?.kneeExtension)
    },
    suggestions: Array.isArray(result.suggestions) ? result.suggestions.slice(0, 5).map(s => ({
      exercise: String(s.exercise || ''),
      sets: String(s.sets || ''),
      description: String(s.description || ''),
      targetMuscle: String(s.targetMuscle || ''),
      difficulty: ['初级', '中级', '高级'].includes(s.difficulty) ? s.difficulty : '初级',
      steps: Array.isArray(s.steps) ? s.steps.slice(0, 6).map(String) : [],
      tips: Array.isArray(s.tips) ? s.tips.slice(0, 4).map(String) : []
    })) : []
  };
}

const ANALYSIS_PROMPT = `你是一位拥有 15 年经验的健身康复师和运动科学专家。请对这张身体照片进行专业评估。

**评估标准（严格遵守）：**

1. **体态评分 (0-100)**：
   - 90-100：优秀，体态标准，无明显问题
   - 80-89：良好，轻微问题，不影响健康
   - 70-79：中等，有明显问题，需要改善
   - 60-69：较差，问题较多，建议系统训练
   - 60以下：差，问题严重，建议专业指导

2. **体态问题识别标准**：
   - 圆肩：观察肩膀是否前扣，手臂自然下垂时手掌是否朝后
   - 头前伸：耳朵是否在肩膀正上方，下巴是否前探
   - 骨盆前倾：腹部前凸，臀部后翘，腰椎过度前弯
   - 膝超伸：站立时膝盖是否过度向后顶

3. **严重程度判定**：
   - mild（轻微）：问题刚出现，不影响日常
   - moderate（中度）：明显可见，需要干预
   - severe（严重）：严重影响体态，必须改善

4. **雷达图评分 (0-100)**：分数越高表示问题越严重
   - 0-20：正常
   - 21-40：轻微
   - 41-60：中度
   - 61-80：较重
   - 81-100：严重

请严格按以下 JSON 格式输出，不要输出其他内容：

{
  "score": <0-100的体态综合评分>,
  "summary": "<50-100字的整体评估总结>",
  "issues": [
    { "name": "<问题名称>", "severity": "<mild|moderate|severe>" }
  ],
  "radar": {
    "headForward": <0-100>,
    "roundShoulder": <0-100>,
    "pelvicTilt": <0-100>,
    "kneeExtension": <0-100>
  },
  "suggestions": [
    {
      "exercise": "<动作名称>",
      "sets": "<组数次数>",
      "description": "<简要说明>",
      "targetMuscle": "<目标肌群>",
      "difficulty": "<初级|中级|高级>",
      "steps": ["<步骤1>", "<步骤2>", "<步骤3>"],
      "tips": ["<要点1>", "<要点2>"]
    }
  ]
}

注意事项：
- 只识别明确可见的问题，不确定的不要标注
- 评分要客观，不要过于乐观或悲观
- 建议动作要适合识别出的问题
- 不要输出 JSON 以外的任何内容`;

export async function analyzePhoto(base64Image) {
  // 检查缓存
  const cacheKey = getCacheKey(base64Image);
  if (analysisCache.has(cacheKey)) {
    console.log('使用缓存结果');
    return analysisCache.get(cacheKey);
  }

  // 设置超时时间为 60 秒
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
        messages: [
          { role: 'system', content: ANALYSIS_PROMPT },
          {
            role: 'user',
            content: [
              { type: 'image_url', image_url: { url: base64Image } },
              { type: 'text', text: '请严格按照评估标准分析这张体态照片，只输出JSON格式结果' },
            ],
          },
        ],
        max_completion_tokens: 4096,
        temperature: 0,
        top_p: 1,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`MiMo API 错误: ${response.status} ${err}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('MiMo API 返回为空');
    }

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('无法解析 AI 返回的 JSON');
    }

    const rawResult = JSON.parse(jsonMatch[0]);
    const normalizedResult = normalizeResult(rawResult);

    // 存入缓存
    if (analysisCache.size >= CACHE_MAX_SIZE) {
      const firstKey = analysisCache.keys().next().value;
      analysisCache.delete(firstKey);
    }
    analysisCache.set(cacheKey, normalizedResult);

    return normalizedResult;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('AI API 请求超时，请稍后重试');
    }
    throw error;
  }
}
