import crypto from 'crypto';
import logger from './logger.js';

const API_URL = process.env.MIMO_API_URL;
const API_KEY = process.env.MIMO_API_KEY;
const MODEL = process.env.MIMO_MODEL || 'mimo-v2.5';

// 启动时校验关键环境变量（测试环境跳过以方便 mock）
if (process.env.NODE_ENV !== 'test' && (!API_URL || !API_KEY)) {
  throw new Error('MIMO_API_URL / MIMO_API_KEY 环境变量未设置');
}

import { extractJsonObject } from './validation.js';

// 结果缓存：对相同图片返回一致结果
const analysisCache = new Map();
const CACHE_MAX_SIZE = 100;

function getCacheKey(base64Image) {
  // 使用 sha256 计算完整图片哈希，避免前缀/哈希碰撞导致返回错误结果
  return crypto.createHash('sha256').update(base64Image).digest('hex');
}

function normalizeScore(value, min = 0, max = 100) {
  const num = Math.round(Number(value));
  return Math.max(min, Math.min(max, num));
}

// 8 维度雷达图字段定义
const RADAR_FIELDS = [
  'headForward',     // 头前伸
  'roundShoulder',   // 圆肩
  'pelvicTilt',      // 骨盆前倾
  'kneeExtension',   // 膝超伸
  'spineCurve',      // 脊柱侧弯
  'shoulderHeight',  // 高低肩
  'legAlignment',    // X/O 型腿
  'coreStability',   // 核心稳定性
];

function normalizeResult(result) {
  // 标准化评分到合理范围
  const radar = {};
  for (const field of RADAR_FIELDS) {
    radar[field] = normalizeScore(result.radar?.[field] ?? 0);
  }

  return {
    score: normalizeScore(result.score),
    summary: String(result.summary || '').substring(0, 300),
    issues: Array.isArray(result.issues) ? result.issues.map(issue => ({
      name: String(issue.name || ''),
      severity: ['mild', 'moderate', 'severe'].includes(issue.severity) ? issue.severity : 'moderate',
      description: String(issue.description || '')
    })) : [],
    radar,
    bodyMetrics: result.bodyMetrics ? {
      postureType: String(result.bodyMetrics.postureType || ''),
      riskLevel: ['低', '中', '高'].includes(result.bodyMetrics.riskLevel) ? result.bodyMetrics.riskLevel : '中',
      affectedAreas: Array.isArray(result.bodyMetrics.affectedAreas) ? result.bodyMetrics.affectedAreas.map(String) : []
    } : { postureType: '', riskLevel: '中', affectedAreas: [] },
    suggestions: Array.isArray(result.suggestions) ? result.suggestions.slice(0, 6).map(s => ({
      exercise: String(s.exercise || ''),
      sets: String(s.sets || ''),
      description: String(s.description || ''),
      targetMuscle: String(s.targetMuscle || ''),
      difficulty: ['初级', '中级', '高级'].includes(s.difficulty) ? s.difficulty : '初级',
      priority: ['高', '中', '低'].includes(s.priority) ? s.priority : '中',
      steps: Array.isArray(s.steps) ? s.steps.slice(0, 6).map(String) : [],
      tips: Array.isArray(s.tips) ? s.tips.slice(0, 4).map(String) : []
    })) : []
  };
}

// Few-shot 示例：让 AI 输出格式更稳定
const FEW_SHOT_EXAMPLE = `**输出格式示例（仅供参考，请根据实际照片分析）：**

{
  "score": 68,
  "summary": "体态评分偏低，主要存在圆肩和头前伸问题，与长期久坐办公相关。骨盆轻度前倾，核心稳定性不足。建议系统性进行上交叉综合征矫正训练。",
  "issues": [
    { "name": "圆肩", "severity": "moderate", "description": "双侧肩膀明显前扣，肩胛骨外翻" },
    { "name": "头前伸", "severity": "moderate", "description": "耳朵位于肩膀前方约3cm" },
    { "name": "骨盆前倾", "severity": "mild", "description": "腰椎曲度略大，腹部微凸" }
  ],
  "radar": {
    "headForward": 55,
    "roundShoulder": 62,
    "pelvicTilt": 35,
    "kneeExtension": 12,
    "spineCurve": 18,
    "shoulderHeight": 22,
    "legAlignment": 10,
    "coreStability": 48
  },
  "bodyMetrics": {
    "postureType": "上交叉综合征",
    "riskLevel": "中",
    "affectedAreas": ["颈椎", "肩胛骨", "腰椎"]
  },
  "suggestions": [
    {
      "exercise": "面拉",
      "sets": "3组 × 15次",
      "description": "强化菱形肌和三角肌后束，改善圆肩",
      "targetMuscle": "肩袖 / 三角肌后束",
      "difficulty": "初级",
      "priority": "高",
      "steps": ["双手握住弹力带与肩同高", "向后拉至面部两侧", "挤压肩胛骨停留2秒", "缓慢归位"],
      "tips": ["保持挺胸沉肩", "不要耸肩借力"]
    }
  ]
}`;

const ANALYSIS_PROMPT = `你是一位拥有 15 年经验的健身康复师和运动科学专家。请对这张身体照片进行专业体态评估。

**评估维度（8 项，逐一分析）：**

1. **头前伸 (headForward)**：耳朵是否在肩膀正上方？下巴是否前探？
2. **圆肩 (roundShoulder)**：肩膀是否前扣？手臂自然下垂时手掌是否朝后？肩胛骨是否外翻？
3. **骨盆前倾 (pelvicTilt)**：腹部是否前凸？臀部是否后翘？腰椎是否过度前弯？
4. **膝超伸 (kneeExtension)**：站立时膝盖是否过度向后顶？
5. **脊柱侧弯 (spineCurve)**：从背面观察，脊柱是否有左右弯曲？双肩/骨盆是否等高？
6. **高低肩 (shoulderHeight)**：双肩是否等高？是否有明显一侧高于另一侧？
7. **X/O 型腿 (legAlignment)**：双腿并拢时，膝盖和脚踝能否同时靠拢？
8. **核心稳定性 (coreStability)**：腹部是否松弛？是否有明显的腹直肌分离或核心无力表现？

**评分标准 (0-100)：**
- 0-20：正常，无明显问题
- 21-40：轻微，刚出现，不影响日常
- 41-60：中度，明显可见，需要干预
- 61-80：较重，建议系统矫正
- 81-100：严重，建议专业康复指导

**综合评分 (0-100)：**
- 90-100：优秀体态
- 80-89：良好，轻微问题
- 70-79：中等，需要改善
- 60-69：较差，建议系统训练
- 60 以下：差，建议专业指导

**严重程度：**
- mild：刚出现，不影响日常
- moderate：明显可见，需要干预
- severe：严重影响体态，必须改善

${FEW_SHOT_EXAMPLE}

请严格按上述 JSON 格式输出，注意：
- 8 个雷达维度必须全部输出，没有问题的维度给低分（0-20）
- 只识别明确可见的问题，不确定的不要标注
- 评分要客观，不要过于乐观或悲观
- bodyMetrics.postureType 请用专业术语（如：上交叉综合征、下交叉综合征、骨盆旋移等）
- 建议动作要针对识别出的问题，按优先级排序
- 不要输出 JSON 以外的任何内容`;

export async function analyzePhoto(base64Image) {
  // 检查缓存
  const cacheKey = getCacheKey(base64Image);
  if (analysisCache.has(cacheKey)) {
    logger.debug('使用缓存结果');
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

    const rawResult = extractJsonObject(content);
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

// === 前后对比分析 ===

const COMPARE_PROMPT = `你是一位专业的健身康复师。请对比分析用户两次体态照片的变化。

以下是两次分析的结果：

**第一次分析（之前）：**
- 综合评分：{score1}/100
- 体态问题：{issues1}
- 雷达数据：{radar1}

**第二次分析（之后）：**
- 综合评分：{score2}/100
- 体态问题：{issues2}
- 雷达数据：{radar2}

请根据两次数据的变化，生成专业的对比报告。

请严格按以下 JSON 格式输出，不要输出其他内容：

{
  "scoreChange": <分数变化，正数表示改善，负数表示退步>,
  "overallAssessment": "<50-100字的整体变化评估>",
  "improvedAreas": ["<改善的方面1>", "<改善的方面2>"],
  "worsenedAreas": ["<退步的方面1>"],
  "unchangedAreas": ["<未变化的方面1>"],
  "radarComparison": {
    "headForward": { "before": <分数>, "after": <分数>, "change": <变化> },
    "roundShoulder": { "before": <分数>, "after": <分数>, "change": <变化> },
    "pelvicTilt": { "before": <分数>, "after": <分数>, "change": <变化> },
    "kneeExtension": { "before": <分数>, "after": <分数>, "change": <变化> },
    "spineCurve": { "before": <分数>, "after": <分数>, "change": <变化> },
    "shoulderHeight": { "before": <分数>, "after": <分数>, "change": <变化> },
    "legAlignment": { "before": <分数>, "after": <分数>, "change": <变化> },
    "coreStability": { "before": <分数>, "after": <分数>, "change": <变化> }
  },
  "recommendations": ["<下一步建议1>", "<下一步建议2>"],
  "encouragement": "<一句鼓励的话>"
}

注意：
- change = before - after（正数表示改善，负数表示退步）
- 只报告有明显变化（>=5分）的方面
- 不要输出 JSON 以外的任何内容`;

export async function compareAnalysis(beforeResult, afterResult) {
  const prompt = COMPARE_PROMPT
    .replace('{score1}', beforeResult.score)
    .replace('{issues1}', beforeResult.issues.map(i => `${i.name}(${i.severity})`).join('、') || '无')
    .replace('{radar1}', JSON.stringify(beforeResult.radar))
    .replace('{score2}', afterResult.score)
    .replace('{issues2}', afterResult.issues.map(i => `${i.name}(${i.severity})`).join('、') || '无')
    .replace('{radar2}', JSON.stringify(afterResult.radar));

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
          { role: 'system', content: prompt },
          { role: 'user', content: '请对比分析这两次体态评估数据的变化' },
        ],
        max_completion_tokens: 2048,
        temperature: 0,
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

    const result = extractJsonObject(content);

    // 标准化对比结果
    return {
      scoreChange: Number(result.scoreChange) || 0,
      overallAssessment: String(result.overallAssessment || '').substring(0, 200),
      improvedAreas: Array.isArray(result.improvedAreas) ? result.improvedAreas.map(String) : [],
      worsenedAreas: Array.isArray(result.worsenedAreas) ? result.worsenedAreas.map(String) : [],
      unchangedAreas: Array.isArray(result.unchangedAreas) ? result.unchangedAreas.map(String) : [],
      radarComparison: result.radarComparison || {},
      recommendations: Array.isArray(result.recommendations) ? result.recommendations.slice(0, 5).map(String) : [],
      encouragement: String(result.encouragement || '')
    };
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('AI API 请求超时，请稍后重试');
    }
    throw error;
  }
}
