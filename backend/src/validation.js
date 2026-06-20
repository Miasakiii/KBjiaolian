// 输入校验工具

// 验证 base64 图片格式
export function isValidBase64Image(str) {
  if (typeof str !== 'string') return false;
  // 检查是否是 data:image 开头的 base64
  if (str.startsWith('data:image/')) {
    return /^data:image\/(jpeg|jpg|png|gif|webp);base64,/.test(str);
  }
  // 或者纯 base64 字符串
  return /^[A-Za-z0-9+/=]{100,}$/.test(str);
}

// 验证枚举值
export function isValidEnum(value, allowedValues) {
  return allowedValues.includes(value);
}

// 验证数值范围
export function isInRange(value, min, max) {
  const num = Number(value);
  return !isNaN(num) && num >= min && num <= max;
}

// 清理字符串输入
export function sanitizeString(str, maxLength = 1000) {
  if (typeof str !== 'string') return '';
  return str.trim().substring(0, maxLength);
}

// 验证训练目标
export function isValidGoal(goal) {
  return isValidEnum(goal, ['muscle_gain', 'fat_loss', 'posture_fix', 'rehab']);
}

// 验证经验水平
export function isValidExperience(experience) {
  return isValidEnum(experience, ['beginner', 'intermediate', 'advanced']);
}

// 验证设备类型
export function isValidEquipment(equipment) {
  return isValidEnum(equipment, ['gym', 'dumbbell', 'bodyweight']);
}

// 验证每周训练天数
export function isValidDaysPerWeek(days) {
  return isInRange(days, 1, 7);
}

// 验证训练时长
export function isValidSessionDuration(duration) {
  return isInRange(duration, 15, 180);
}

// 验证聊天消息
export function isValidChatMessage(message) {
  return typeof message === 'string' && message.length > 0 && message.length <= 2000;
}

// 验证聊天历史
export function isValidChatHistory(history) {
  if (!Array.isArray(history)) return false;
  if (history.length > 20) return false;
  return history.every(msg =>
    typeof msg === 'object' &&
    isValidEnum(msg.role, ['user', 'assistant']) &&
    typeof msg.content === 'string' &&
    msg.content.length > 0 &&
    msg.content.length <= 5000
  );
}

/**
 * 从 AI 模型输出中稳健地提取首个 JSON 对象。
 * 1. 优先匹配 ```json ... ``` 围栏
 * 2. 退回到平衡括号扫描，捕获第一段完整的 JSON 对象
 * 3. 失败抛错
 */
export function extractJsonObject(content) {
  if (typeof content !== 'string') {
    throw new Error('AI 返回内容不是字符串');
  }

  // 优先：markdown 围栏
  const fenced = content.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced) {
    try {
      return JSON.parse(fenced[1].trim());
    } catch {
      // 围栏内容非合法 JSON，继续走平衡括号
    }
  }

  // 平衡括号扫描：找到第一个 '{' 开始的合法 JSON 对象
  let depth = 0;
  let start = -1;
  let inString = false;
  let escape = false;

  for (let i = 0; i < content.length; i++) {
    const c = content[i];
    if (inString) {
      if (escape) {
        escape = false;
      } else if (c === '\\') {
        escape = true;
      } else if (c === '"') {
        inString = false;
      }
      continue;
    }
    if (c === '"') {
      inString = true;
    } else if (c === '{') {
      if (depth === 0) start = i;
      depth++;
    } else if (c === '}') {
      if (depth > 0) {
        depth--;
        if (depth === 0 && start !== -1) {
          const slice = content.slice(start, i + 1);
          try {
            return JSON.parse(slice);
          } catch {
            // 该段不合法，继续往后找
            start = -1;
          }
        }
      }
    }
  }

  throw new Error('无法解析 AI 返回的 JSON');
}
