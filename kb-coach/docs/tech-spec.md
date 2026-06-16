# KB教练 — 技术规格文档

## API 接口设计

### 体态分析 API

```
POST /api/v1/analyze
Content-Type: multipart/form-data

Body:
  - photos: File[] (1-3张，正面/侧面/背面)
  - angle: string (front|side|back)

Response:
{
  "assessment_id": "uuid",
  "body_fat_estimate": { "low": 18, "high": 22 },
  "body_type": "mesomorph",
  "muscle_scores": {
    "chest": { "score": 6, "level": "一般", "note": "上胸偏薄" },
    "shoulder": { "score": 5, "level": "一般", "note": "中束发展不足" },
    "back": { "score": 7, "level": "良好", "note": "宽度不错" },
    "arm": { "score": 6, "level": "一般", "note": "三头偏弱" },
    "leg": { "score": 5, "level": "一般", "note": "股四为主，臀部偏弱" },
    "core": { "score": 4, "level": "弱", "note": "腹部脂肪较多" }
  },
  "posture_issues": [
    {
      "type": "rounded_shoulders",
      "severity": "moderate",
      "description": "圆肩，右肩更明显",
      "recommendation": "加强菱形肌和中下斜方肌训练"
    }
  ],
  "overall_score": 5.5,
  "priority_actions": [
    "优先改善圆肩问题，预计 6-8 周可见明显改善",
    "加强核心训练，降低体脂"
  ],
  "photo_annotations_url": "https://..."  // 标注后的图片
}
```

### 训练方案 API

```
POST /api/v1/plan/generate
Content-Type: application/json

Body:
{
  "user_id": "uuid",
  "goal": "muscle_gain",      // muscle_gain|fat_loss|posture_fix|rehab|performance
  "experience": "beginner",   // beginner|intermediate|advanced
  "equipment": "gym",         // gym|home_dumbbell|bodyweight
  "days_per_week": 4,
  "session_duration_min": 60,
  "injuries": ["left_knee_mild"],
  "assessment_id": "uuid"     // 关联最近的体态分析
}

Response:
{
  "plan_id": "uuid",
  "name": "增肌训练计划 · 4天/周",
  "duration_weeks": 8,
  "schedule": [
    {
      "day": 1,
      "name": "推（胸/肩/三头）",
      "exercises": [
        {
          "exercise_id": "bench_press",
          "name": "杠铃卧推",
          "sets": 4,
          "reps": "8-10",
          "rpe": 7,
          "rest_sec": 90,
          "notes": "控制离心 2 秒",
          "demo_url": "https://...",
          "alternatives": ["dumbbell_bench_press", "push_up"]
        }
      ],
      "estimated_duration_min": 55
    }
  ],
  "nutrition": {
    "calories": 2800,
    "protein_g": 160,
    "carb_g": 350,
    "fat_g": 80,
    "notes": "训练日可增加 200kcal 碳水"
  },
  "notes": "左膝轻微不适，深蹲控制在 90 度以内，避免跳跃动作"
}
```

### 进度对比 API

```
POST /api/v1/progress/compare
Content-Type: multipart/form-data

Body:
  - before_photo: File
  - after_photo: File
  - before_date: string (YYYY-MM-DD)
  - after_date: string (YYYY-MM-DD)

Response:
{
  "comparison_id": "uuid",
  "visual_changes": {
    "upper_body": "胸肌线条更清晰，肩部更宽",
    "midsection": "腰围明显缩小，腹肌轮廓初现",
    "lower_body": "腿部变化不大"
  },
  "progress_rating": "明显改善",  // 无变化|轻微改善|明显改善|显著变化
  "estimated_body_fat_change": -3,  // 百分比变化
  "ai_comment": "6 周的训练效果很好，上半身进步明显...",
  "next_steps": ["继续当前计划", "加强腿部训练"],
  "side_by_side_url": "https://..."  // 并排对比图
}
```

---

## 移动端页面结构

```
App
├── 首页 (Home)
│   ├── 今日训练卡片
│   ├── 体态评分概览
│   ├── 本周进度
│   └── 快捷操作（拍照分析 / 开始训练）
│
├── 分析 (Analyze)
│   ├── 拍照引导
│   ├── 分析结果
│   │   ├── 雷达图
│   │   ├── 各部位详情
│   │   ├── 体态问题标注
│   │   └── 优先改善建议
│   └── 历史报告列表
│
├── 训练 (Training)
│   ├── 当前方案
│   ├── 训练中界面
│   │   ├── 当前动作（演示 + 说明）
│   │   ├── 组间计时器
│   │   ├── 完成打卡
│   │   └── AI 实时反馈
│   ├── 训练历史
│   └── 动作库
│
├── 进度 (Progress)
│   ├── 照片对比（滑块）
│   ├── 体围趋势图
│   ├── 体重/体脂曲线
│   ├── 训练统计
│   └── AI 月度报告
│
└── 我的 (Profile)
    ├── 基础信息
    ├── 目标设置
    ├── 订阅管理
    └── 设置
```

## 桌面端额外功能

- 大屏数据仪表盘
- 多照片并排对比
- 训练方案打印/导出 PDF
- 进度报告分享

---

## MiMo API 集成方案

### 体态分析 Prompt

```python
ANALYSIS_PROMPT = """
你是一位拥有 15 年经验的健身康复师和运动科学专家。
请对这张身体照片进行专业评估。

要求：
1. 体脂率：给出合理范围（如 18-22%），不要精确到个位
2. 肌肉发展：对以下部位分别评分（1-10）并简评
   - 胸肌、肩部、背部、手臂、腿部、核心
3. 体态问题：识别以下常见问题
   - 圆肩/驼背
   - 骨盆前倾/后倾
   - 膝内扣/外翻
   - 头前引
   - 左右不对称
4. 运动风险：基于体态判断可能的运动伤害风险
5. 优先改善：最重要的 1-2 个改善方向

输出 JSON 格式，字段与上述一一对应。
"""
```

### 进度对比 Prompt

```python
COMPARE_PROMPT = """
你是专业的健身康复师。请对比这两张身体照片（按时间顺序，第一张较早）。

要求：
1. 视觉变化：逐部位描述可见变化
2. 进步评级：无变化 / 轻微改善 / 明显改善 / 显著变化
3. 体脂变化估算：百分比变化（如 -2%）
4. 趋势预测：继续当前训练 2-4 周后预期
5. 调整建议：是否需要修改训练/饮食

客观评估，不过度乐观。输出 JSON 格式。
"""
```

### 食物识别 Prompt

```python
FOOD_PROMPT = """
识别这张图片中的食物，估算：
1. 每种食物的名称和大致份量
2. 总热量（kcal）
3. 蛋白质（g）
4. 碳水化合物（g）
5. 脂肪（g）

如果有多种食物，分别列出再汇总。
输出 JSON 格式。
"""
```

---

## 安全与隐私

### 数据安全
- 照片加密存储（AES-256）
- 用户可随时删除自己的照片和数据
- 照片仅用于分析，不用于模型训练（需明确告知）
- API 通信全链路 HTTPS

### 内容安全
- 照片分析结果仅供个人参考，不构成医学诊断
- 明确提示：如有伤病请先就医
- 不对未成年人进行体脂估算
- 照片自动脱敏处理（面部可选模糊）

### 合规
- 隐私政策明确数据用途
- 用户数据不出境（国内服务器）
- 支持 GDPR 数据导出/删除
