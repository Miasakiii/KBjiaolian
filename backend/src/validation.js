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
