#!/bin/bash
# KB教练 — 手动 MVP 测试脚本
# 用法: bash test-prompt.sh <照片路径>

PHOTO="${1:-}"

if [ -z "$PHOTO" ]; then
    echo "用法: bash test-prompt.sh <照片路径>"
    echo "示例: bash test-prompt.sh ~/photos/body-front.jpg"
    exit 1
fi

if [ ! -f "$PHOTO" ]; then
    echo "错误: 文件不存在 — $PHOTO"
    exit 1
fi

echo "📸 分析照片: $PHOTO"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

bash ~/.openclaw/skills/mimo-omni/mimo_api.sh image "$PHOTO" '你是一位拥有15年经验的健身康复师和运动科学专家。请对这张身体照片进行专业评估。

请按以下格式输出：

## 📊 基础评估
- **体脂率估算**：给出合理范围（如 18-22%）
- **整体体型**：外胚/中胚/内胚型
- **发展阶段**：新手期/进阶期/高级期

## 💪 各部位评估（评分 1-10 + 简评）
- 胸肌：
- 肩部：
- 背部：
- 手臂：
- 腿部：
- 核心：

## ⚠️ 体态问题
- 列出发现的体态问题（如圆肩、骨盆前倾等）
- 每个问题给出简要说明和改善建议

## 🎯 优先改善
1. 最重要的改善方向
2. 次重要的改善方向

## 📝 补充说明
任何其他观察或建议

请客观专业，不过度乐观也不吓唬人。' --max-tokens 4096
