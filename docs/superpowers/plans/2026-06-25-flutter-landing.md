# KB 教练 · Flutter 端落地计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把第一轮定稿的设计系统(spec `2026-06-24-visual-redesign-design.md`)落地到 Flutter 端(15 screen),从草绿 Material 模板感 → teal 临床专业 + 极简留白,与 miniprogram 跨端一致。

**Architecture:** Flutter 端用一份 constants.dart(token 常量,对应 app.wxss 的 CSS 变量)+ ThemeData(app.dart)作设计系统载体。组件侧:重构 radar_chart(去彩虹/加 problem-point/加 compare),新建少量复用 widget(score/quota/empty 对应 miniprogram 的 kb-*)。screen 逐个把 `Colors.green.shadeXXX`/`Color(0xFF22c55e)` → token 常量 + `Theme.of`。

**Tech Stack:** Flutter + Material3 + CustomPaint(radar)。

**前置依赖:** spec 已定稿;miniprogram 两轮已完成(可作视觉参照);Flutter 工程 `mobile/` 可编译。

**参照基准:** miniprogram 端是已验证的参照样板,Flutter 实现应对齐其 token 值与组件行为。

---

## 现状调研(已查)

- `app.dart`: `colorSchemeSeed: Color(0xFF22c55e)`, scaffold `#f8fafb`, text `#111827`, Material3
- `widgets/analyze/radar_chart.dart`: `Colors.green` 描边/填充 + **8 色彩虹图例**(`_colors` 数组),无 problem-point 高亮,无 compare 双层
- 全 lib: `Colors.green` 直接用 **68 处**,`Color(0xFF22c55e)`/`16a34a` 硬编码多处,散布 15 screen + app.dart
- 无 token 常量文件(screen 各自硬编码颜色)
- 15 screens: about/analyze/chat/compare/goal/history/home/login/nutrition/plan/privacy/profile/progress/settings/workout

---

## 文件结构

| 文件 | 责任 | 动作 |
|------|------|------|
| `mobile/lib/theme/kb_colors.dart` | Flutter 端 token 常量(色板) | 新建 |
| `mobile/lib/theme/kb_spacing.dart` | 间距/圆角常量 | 新建 |
| `mobile/lib/app.dart` | ThemeData | 改 |
| `mobile/lib/widgets/analyze/radar_chart.dart` | 雷达图(去彩虹+problem-point+compare) | 改 |
| `mobile/lib/widgets/common/{score,quota,empty}.dart` | 复用 widget | 新建 |
| `mobile/lib/screens/*.dart` | 15 屏 | 逐个改 |

---

## Task 1: 建 Flutter token(theme/kb_colors.dart + kb_spacing.dart)

**规格依据:** spec §3(token 值与 miniprogram 对齐)

- [x] **Step 1: kb_colors.dart**

```dart
// mobile/lib/theme/kb_colors.dart
import 'package:flutter/material.dart';

/// KB 教练设计 token — 与 miniprogram app.wxss 对齐 (spec §3)
class KbColors {
  KbColors._();

  // 品牌色
  static const brand = Color(0xFF0F766E);
  static const brand600 = Color(0xFF0D5A54);
  static const brandSoft = Color(0xFFCCFBF1);

  // 警示(仅问题/不达标)
  static const accentWarn = Color(0xFFF97316);

  // 背景/表面
  static const bg = Color(0xFFF6F8F7);
  static const surface = Color(0xFFFFFFFF);
  static const surface2 = Color(0xFFF9FAFB);

  // 文字
  static const text1 = Color(0xFF0F172A);
  static const text2 = Color(0xFF475569);
  static const text3 = Color(0xFF94A3B8);

  // 线
  static const line = Color(0xFFE2E8E4);
  static const lineSoft = Color(0xFFEEF2F1);

  // 肌群数据色板 (仅分类)
  static const dataChest = Color(0xFF0F766E);
  static const dataBack = Color(0xFF4F6D7A);
  static const dataLeg = Color(0xFF6B7280);
  static const dataGlute = Color(0xFF9F6F8F);
  static const dataCore = Color(0xFF5B7A8C);
  static const dataShoulder = Color(0xFFB08968);

  // 阴影
  static const shadowBrand = Color(0x29157767); // rgba(15,118,110,0.16)
}
```

- [x] **Step 2: kb_spacing.dart**

```dart
// mobile/lib/theme/kb_spacing.dart
class KbSpacing {
  KbSpacing._();
  static const sp1 = 8.0;
  static const sp2 = 16.0;
  static const sp3 = 24.0;
  static const sp4 = 32.0;
  static const sp5 = 48.0;
  static const sp6 = 64.0;

  static const radiusSm = 12.0;
  static const radius = 20.0;
  static const radiusLg = 28.0;
}
```

- [x] **Step 3: Commit** — `feat(flutter): 建 token (kb_colors/kb_spacing, 与 miniprogram 对齐)`

---

## Task 2: 改 app.dart ThemeData

**规格依据:** spec §3

- [x] **Step 1: colorSchemeSeed → KbColors.brand,scaffold → bg,text → text1**
- [x] **Step 2: cardTheme radius 20 + lineSoft 边**
- [x] **Step 3: elevatedButton brand + RadiusSm**
- [x] **Step 4: textTheme: display 64/title 36/h2 30/body 28(用 sp?), w600 只用 600**
- [x] **Step 5: 删硬编码 #22c55e/#f8fafb**
- [x] **Step 6: Commit** — `feat(flutter): app.dart theme teal 化 (seed/scaffold/text/button)`

---

## Task 3: 重构 radar_chart(去彩虹+problem-point+compare)

**规格依据:** spec §5.1/§5.2

- [x] **Step 1: 删 `_colors` 彩虹数组 + `_buildLegend` 彩虹图例**
- [x] **Step 2: 描边/填充 Colors.green → KbColors.brand**
- [x] **Step 3: 加 problem-point 高亮**:最低分顶点画 KbColors.accentWarn 环(对应 minipro kb-radar result 模式)
- [x] **Step 4: 加 compare 模式**:新增 `RadarChartWidget.compare({data, prevData})` 构造,绘制上次(灰虚线)+本次(teal)
- [x] **Step 5: 图例改极简**:result 模式显示"问题点 ●膝超伸";compare 模式显示"本次 ● / 上次 - - -"
- [x] **Step 6: Commit** — `feat(flutter): radar 去彩虹+problem-point+compare 双模式`

---

## Task 4: 建复用 widget(score/quota/empty)

**规格依据:** spec §4.2(对应 miniprogram kb-*)

- [x] **Step 1: widgets/common/score_widget.dart** — value+label+delta+variant(ring|plain),对应 kb-score
- [x] **Step 2: widgets/common/quota_widget.dart** — items[{label,remaining,total}],对应 kb-quota
- [x] **Step 3: widgets/common/empty_widget.dart** — icon+text+cta,对应 kb-empty
- [x] **Step 4: Commit** — `feat(flutter): 复用 widget (score/quota/empty)`

---

## Task 5-14: 15 屏逐个 token 化 + 布局对齐

每屏统一动作:
1. `Colors.green.shadeXXX` / `Color(0xFF22c55e)` / `16a34a` → KbColors.* 常量
2. 硬编码灰 `#111827`/`#f8fafb`/`#9ca3af` 等 → KbColors.text1/bg/text3
3. 间距用 KbSpacing,圆角用 KbSpacing.radius*
4. 空态用 EmptyWidget,评分用 ScoreWidget(若该屏有)
5. **图标:** Flutter 用 Material Icons,不强行换 svg(跨端图标统一在 miniprogram 已做,Flutter 保持 Material 但色用 token)——除非用户要 flutter_svg 统一
6. 字重只用 w400/w600
7. 每个 screen 一个 commit:`feat(flutter): {screen名} token 化`

- [x] **Task 5: home_screen** — 评分 hero(ScoreWidget)+ 配额(QuotaWidget)+ 快捷操作
- [x] **Task 6: analyze_screen** — ring 评分 + RadarChartWidget(result) + 问题点
- [x] **Task 7: compare_screen** — RadarChartWidget.compare + 评分变化 + 维度 delta
- [x] **Task 8: login_screen** — 极简留白(对应 miniprogram 登录)
- [x] **Task 9: plan_screen** — 表单 + 方案展示
- [x] **Task 10: chat_screen** — 气泡(brand/surface)
- [x] **Task 11: history_screen** — 列表 + empty
- [x] **Task 12: profile_screen** — 菜单 + 头像
- [x] **Task 13: workout_screen** — 动作卡片
- [x] **Task 14: 其余(about/goal/nutrition/privacy/progress/settings)** — 6 个轻量屏批量 token 化(一个 commit)

---

## Task 15: 全局验收

- [x] `grep -rn "Colors.green\|0xFF22c55e\|0xFF16a34a" mobile/lib` 应为 0
- [x] `flutter analyze` 无 error
- [x] 实机/模拟器跑,走查关键屏(home/analyze/compare/login)
- [x] Commit — `chore(flutter): 全局验收 (零草绿+analyze通过)`

---

## 完成定义

- [x] token 文件 + ThemeData teal 化
- [x] radar 去彩虹 + problem-point + compare
- [x] score/quota/empty widget 可用
- [x] 15 屏零 Colors.green / 草绿硬编码
- [x] `flutter analyze` 通过
- [x] 跨端品牌色一致(brand #0f766e)

## 注意

- Flutter 端图标保持 Material Icons(spec 跨端图标统一指 SVG 源,Flutter 落地为 Material——除非后续引入 flutter_svg)
- dark 模式同样仅预留(spec §2),本计划只做 light
- 字号 Flutter 用 sp 体系,与 miniprogram rpx 数值不同但比例对齐
