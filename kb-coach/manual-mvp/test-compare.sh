#!/bin/bash
# KB教练 — 进度对比测试脚本
# 用法: bash test-compare.sh <旧照片> <新照片>

BEFORE="${1:-}"
AFTER="${2:-}"

if [ -z "$BEFORE" ] || [ -z "$AFTER" ]; then
    echo "用法: bash test-compare.sh <旧照片> <新照片>"
    echo "示例: bash test-compare.sh ~/photos/jan.jpg ~/photos/mar.jpg"
    exit 1
fi

if [ ! -f "$BEFORE" ] || [ ! -f "$AFTER" ]; then
    echo "错误: 文件不存在"
    exit 1
fi

echo "📊 对比分析"
echo "  Before: $BEFORE"
echo "  After:  $AFTER"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

bash ~/.openclaw/skills/mimo-omni/mimo_api.sh images "$BEFORE" "$AFTER" --question '你是专业的健身康复师。请对比这两张身体照片（按时间顺序，第一张较早）。

请按以下格式输出：

## 📸 视觉变化
逐部位描述可见的变化：
- 上半身（胸/肩/背/臂）：
- 中段（腰腹/核心）：
- 下半身（腿/臀）：

## 📈 进步评级
整体进步程度：无变化 / 轻微改善 / 明显改善 / 显著变化

## 🔮 趋势预测
基于当前变化趋势，继续训练 2-4 周后可能达到什么效果？

## 🔧 调整建议
根据变化情况，训练或饮食是否需要调整？具体怎么调？

请客观评估，不要过度乐观或悲观。' --max-tokens 4096
