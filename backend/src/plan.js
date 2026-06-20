import crypto from 'crypto';
import { extractJsonObject } from './validation.js';

const API_URL = process.env.MIMO_API_URL;
const API_KEY = process.env.MIMO_API_KEY;
const MODEL = process.env.MIMO_MODEL || 'mimo-v2.5';

// 启动时校验关键环境变量（测试环境跳过以方便 mock）
if (process.env.NODE_ENV !== 'test' && (!API_URL || !API_KEY)) {
  throw new Error('MIMO_API_URL / MIMO_API_KEY 环境变量未设置');
}

function buildPlanPrompt(params, analysisResult) {
  const { goal, experience, equipment, daysPerWeek, sessionDuration } = params;

  const goalMap = {
    muscle_gain: '增肌塑形',
    fat_loss: '减脂瘦身',
    posture_fix: '体态矫正',
    rehab: '康复训练',
  };

  const experienceMap = {
    beginner: '新手（0-1年经验）',
    intermediate: '中级（1-3年经验）',
    advanced: '高级（3年以上经验）',
  };

  const equipmentMap = {
    gym: '健身房（完整器械）',
    dumbbell: '家用哑铃',
    bodyweight: '徒手训练',
  };

  return `你是一位拥有 15 年经验的健身教练和运动康复专家。请根据用户的体态分析结果和训练偏好，生成个性化训练方案。

用户信息：
- 训练目标：${goalMap[goal]}
- 经验水平：${experienceMap[experience]}
- 训练设备：${equipmentMap[equipment]}
- 每周训练：${daysPerWeek} 天
- 每次时长：${sessionDuration} 分钟

体态分析结果：
- 综合评分：${analysisResult.score}/100
- 体态问题：${analysisResult.issues.map((i) => `${i.name}（${i.severity === 'severe' ? '严重' : i.severity === 'moderate' ? '中度' : '轻微'}）`).join('、')}
- 雷达数据：头前伸 ${analysisResult.radar.headForward}%、圆肩 ${analysisResult.radar.roundShoulder}%、骨盆前倾 ${analysisResult.radar.pelvicTilt}%、膝超伸 ${analysisResult.radar.kneeExtension}%

要求：
1. 训练方案必须针对用户的体态问题进行优化
2. 如果有圆肩问题，减少推类动作，增加拉类动作
3. 如果有骨盆前倾，加强臀部和核心训练
4. 如果有头前伸，加入颈部深层肌群训练
5. 动作选择要适合用户的设备条件
6. 根据经验水平调整训练强度

请严格按以下 JSON 格式输出，不要输出其他内容：

{
  "name": "<训练方案名称，如：体态矫正训练计划 · 4天/周>",
  "durationWeeks": <训练周期，4-12周>,
  "schedule": [
    {
      "day": 1,
      "name": "<训练日名称，如：上肢拉 + 核心>",
      "exercises": [
        {
          "name": "<动作名称>",
          "sets": <组数>,
          "reps": "<次数或时间，如：8-12次 或 30秒>",
          "restSec": <组间休息秒数>,
          "notes": "<动作要点>",
          "targetMuscle": "<目标肌群>"
        }
      ],
      "estimatedDuration": <预计时长分钟>
    }
  ],
  "nutrition": {
    "calories": <每日建议热量>,
    "protein": <蛋白质克数>,
    "carbs": <碳水克数>,
    "fat": <脂肪克数>,
    "notes": "<营养建议>"
  },
  "notes": "<整体注意事项，结合体态问题给出提示>"
}

注意事项：
- 每个训练日安排 4-8 个动作
- 根据时长调整动作数量
- 体态问题严重的用户，降低训练强度
- 提供替代动作建议（在 notes 中说明）
- 营养建议要符合训练目标
`;
}

export async function generatePlan(params, analysisResult, extraPrompt = '') {
  const prompt = buildPlanPrompt(params, analysisResult) + (extraPrompt ? '\n\n' + extraPrompt : '');

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
          { role: 'system', content: prompt },
          { role: 'user', content: '请根据我的情况生成训练方案' },
        ],
        max_completion_tokens: 4096,
        temperature: 0.3,
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

    const plan = extractJsonObject(content);

    return {
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).substring(2),
      ...plan,
      goal: params.goal,
      experience: params.experience,
      equipment: params.equipment,
      daysPerWeek: params.daysPerWeek,
      sessionDuration: params.sessionDuration,
      createdAt: Date.now(),
    };
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('AI API 请求超时，请稍后重试');
    }
    throw error;
  }
}
