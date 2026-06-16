const API_URL = process.env.MIMO_API_URL;
const API_KEY = process.env.MIMO_API_KEY;
const MODEL = process.env.MIMO_MODEL || 'mimo-v2.5';

const FOOD_ANALYSIS_PROMPT = `你是一位专业的营养师和食品识别专家。请识别这张图片中的食物，并估算营养成分。

**识别要求：**
1. 识别所有可见的食物
2. 估算每种食物的大致份量（克或份）
3. 计算营养成分

请严格按以下 JSON 格式输出，不要输出其他内容：

{
  "foods": [
    {
      "name": "<食物名称>",
      "portion": "<份量，如：100克 或 1碗>",
      "calories": <热量，千卡>,
      "protein": <蛋白质，克>,
      "carbs": <碳水化合物，克>,
      "fat": <脂肪，克>
    }
  ],
  "totalCalories": <总热量>,
  "totalProtein": <总蛋白质>,
  "totalCarbs": <总碳水>,
  "totalFat": <总脂肪>,
  "tips": "<饮食建议，30字以内>"
}

**注意事项：**
- 如果图片不清晰或无法识别食物，请返回空数组
- 营养估算基于常见食物数据库
- 份量估算基于图片中的视觉比例
- 不要输出 JSON 以外的任何内容`;

// 结果缓存
const analysisCache = new Map();
const CACHE_MAX_SIZE = 50;

function getCacheKey(base64Image) {
  let hash = 0;
  const str = base64Image.substring(0, 500);
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
}

function normalizeResult(result) {
  const foods = Array.isArray(result.foods) ? result.foods.map(food => ({
    name: String(food.name || ''),
    portion: String(food.portion || ''),
    calories: Math.max(0, Math.round(Number(food.calories) || 0)),
    protein: Math.max(0, Math.round(Number(food.protein) || 0)),
    carbs: Math.max(0, Math.round(Number(food.carbs) || 0)),
    fat: Math.max(0, Math.round(Number(food.fat) || 0))
  })) : [];

  const totalCalories = foods.reduce((sum, f) => sum + f.calories, 0);
  const totalProtein = foods.reduce((sum, f) => sum + f.protein, 0);
  const totalCarbs = foods.reduce((sum, f) => sum + f.carbs, 0);
  const totalFat = foods.reduce((sum, f) => sum + f.fat, 0);

  return {
    foods,
    totalCalories: Math.round(result.totalCalories || totalCalories),
    totalProtein: Math.round(result.totalProtein || totalProtein),
    totalCarbs: Math.round(result.totalCarbs || totalCarbs),
    totalFat: Math.round(result.totalFat || totalFat),
    tips: String(result.tips || '').substring(0, 100)
  };
}

export async function analyzeFood(base64Image) {
  // 检查缓存
  const cacheKey = getCacheKey(base64Image);
  if (analysisCache.has(cacheKey)) {
    console.log('使用食物识别缓存');
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
          { role: 'system', content: FOOD_ANALYSIS_PROMPT },
          {
            role: 'user',
            content: [
              { type: 'image_url', image_url: { url: base64Image } },
              { type: 'text', text: '请识别这张图片中的食物并估算营养成分' },
            ],
          },
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
