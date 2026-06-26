# KB 教练 · 第二轮页深度重构计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把第一轮已定稿的设计系统(spec `2026-06-24-visual-redesign-design.md`)应用到剩余 8 个第二轮页,从"颜色机械替换"升级为"按新设计语言重排"。

**Architecture:** 沿用第一轮 token(`app.wxss`)+ 组件(kb-empty/kb-score/kb-quota/kb-radar)+ 图标系统。每屏重写 wxml/wxss,引用 token 变量、用 kb-empty 替空态、用线性 svg 替占位、section 间距 ≥48rpx。js 逻辑尽量不动,仅补数据字段适配。

**Tech Stack:** 微信小程序原生(wxml/wxss/js)。

**前置依赖:** 第一轮已完成(main 分支 `c2ffdd8`),token/组件/图标/SVG 均就绪。

---

## 文件结构

| 屏 | 文件 | 类型 |
|----|------|------|
| 训练方案 plan | `pages/plan/index.{wxml,wxss,js}` | 表单+列表 |
| 动作库 exercises | `pages/exercises/index.{wxml,wxss,js}` | 卡片网格 |
| AI 对话 chat | `pages/chat/index.{wxml,wxss,js}` | 气泡流 |
| 个人 profile | `subpkg/user/profile/index.{wxml,wxss,js}` | 菜单 |
| 付费 payment | `subpkg/user/payment/index.{wxml,wxss,js}` | 确认 |
| 定价 pricing | `subpkg/user/pricing/index.{wxml,wxss,js}` | 卡片选择 |
| 分析历史 history/analysis | `subpkg/history/analysis/index.{wxml,wxss,js}` | 列表 |
| 训练历史 history/workouts | `subpkg/history/workouts/index.{wxml,wxss,js}` | 列表 |

**共性改动(所有屏):** 颜色全引 token、`.section-title`/`.card`/`.card-flat` 复用、空态统一 kb-empty、间距 ≥48rpx、移除残留 `#f8fafb`/`#111827` 等硬编码、`#ffffff` 在文字色处引 `--surface` 或保留(白字场景)。

---

## Task 1: 分析历史列表(history/analysis)

**目标:** 记录卡片重排,评分用色阶(brand/warn),空态用 kb-empty。

**Files:** `subpkg/history/analysis/index.{wxml,wxss,js}`

- [x] **Step 1: wxml 重写**

```xml
<!--subpkg/history/analysis/index.wxml - 分析历史列表-->
<view class="page-container">
  <view class="section-title">体态分析记录</view>

  <view class="record-list" wx:if="{{list.length > 0}}">
    <view class="record-card card-flat ah-card" wx:for="{{list}}" wx:key="id" bindtap="onTapRecord" data-id="{{item.id}}">
      <view class="ah-header">
        <text class="ah-date">{{item.dateStr}}</text>
        <text class="ah-score {{item.overallScore >= 80 ? 'text-brand' : 'text-warn'}}">{{item.overallScore}}分</text>
      </view>
      <view class="ah-dims">
        <text class="ah-dim" wx:for="{{item.keyDims}}" wx:key="*this" wx:for-item="dim">{{dim}}</text>
      </view>
      <view class="ah-actions">
        <view class="ah-compare" catchtap="onTapCompare" data-id="{{item.id}}">
          <image src="/assets/icons/st-up.svg" mode="aspectFit" class="ah-compare-icon" />
          <text>前后对比</text>
        </view>
      </view>
    </view>
  </view>

  <kb-empty wx:else icon="/assets/icons/tab-analyze.svg" text="还没有分析记录" cta="去分析" bind:cta="onGoAnalyze" />
</view>
```

注意:内层 `wx:for` 用 `wx:for-item="dim"` 避免与外层 `item` 冲突;`text-orange`/`text-red` 改为统一 `text-warn`(spec 铁律:警示橙是唯一非品牌色,不引入 red/orange 两色)。

- [x] **Step 2: wxss 重写**

```css
/* subpkg/history/analysis/index.wxss */
.page-container { min-height: 100vh; background: var(--bg); padding: 0 var(--sp-4) env(safe-area-inset-bottom); }
.ah-card { display: flex; flex-direction: column; gap: var(--sp-2); margin-bottom: var(--sp-3); }
.ah-header { display: flex; justify-content: space-between; align-items: center; }
.ah-date { font-size: var(--fs-body); font-weight: 600; color: var(--text-1); }
.ah-score { font-size: var(--fs-h2); font-weight: 600; font-variant-numeric: tabular-nums; }
.ah-dims { display: flex; flex-wrap: wrap; gap: var(--sp-1); }
.ah-dim { font-size: var(--fs-label); color: var(--text-2); background: var(--surface-2); padding: 4rpx 16rpx; border-radius: 20rpx; }
.ah-actions { display: flex; justify-content: flex-end; }
.ah-compare { display: flex; align-items: center; gap: 6rpx; font-size: var(--fs-caption); color: var(--brand); font-weight: 600; }
.ah-compare-icon { width: 28rpx; height: 28rpx; }
```

- [x] **Step 3: js 确认 onTapCompare/onGoAnalyze 存在**

读 js 确认 `onTapCompare`/`onGoAnalyze` 方法存在且参数正确(应为 `data-id`)。若 `onTapCompare` 取参用的是 `e.currentTarget.dataset.id` 则 wxml 的 `data-id="{{item.id}}"` 一致。

- [x] **Step 4: 验证 + Commit**

开发者工具预览,确认卡片样式 + 空态 kb-empty。Commit: `feat(page): 分析历史页重排 (token+kb-empty+评分色阶)`

---

## Task 2: 训练历史列表(history/workouts)

**目标:** 与分析历史同构,卡片含时长/动作/卡路里,空态 kb-empty。

**Files:** `subpkg/history/workouts/index.{wxml,wxss,js}`

- [x] **Step 1: wxml 重写**

```xml
<!--subpkg/history/workouts/index.wxml - 训练历史页-->
<view class="page-container">
  <view class="section-title">训练记录</view>

  <view class="record-list" wx:for-list wx:if="{{list.length > 0}}">
    <view class="workout-card card-flat wh-card" wx:for="{{list}}" wx:key="id" bindtap="onTapWorkout" data-id="{{item.id}}">
      <view class="wh-header">
        <text class="wh-date">{{item.dateStr}}</text>
        <text class="wh-duration">{{item.duration}}分钟</text>
      </view>
      <view class="wh-exercises">
        <text class="wh-ex" wx:for="{{item.exercises}}" wx:key="name" wx:for-item="ex">{{ex.name}}</text>
      </view>
      <view class="wh-footer">
        <text class="wh-cal">{{item.calories}} kcal</text>
        <view class="wh-detail">
          <text>查看详情</text>
          <image src="/assets/icons/st-up.svg" mode="aspectFit" class="wh-arrow" />
        </view>
      </view>
    </view>
  </view>

  <kb-empty wx:else icon="/assets/icons/tab-plan.svg" text="还没有训练记录" cta="去制定方案" bind:cta="onGoPlan" />
</view>
```

注意:`wx:for-list` 是笔误,删除该属性,只留 `wx:if`。修正后:`<view class="record-list" wx:if="{{list.length > 0}}">`。内层 exercises `wx:for` 用 `wx:for-item="ex"` 避免冲突。

- [x] **Step 2: wxss 重写**

```css
/* subpkg/history/workouts/index.wxss */
.page-container { min-height: 100vh; background: var(--bg); padding: 0 var(--sp-4) env(safe-area-inset-bottom); }
.wh-card { display: flex; flex-direction: column; gap: var(--sp-2); margin-bottom: var(--sp-3); }
.wh-header { display: flex; justify-content: space-between; align-items: center; }
.wh-date { font-size: var(--fs-body); font-weight: 600; color: var(--text-1); }
.wh-duration { font-size: var(--fs-caption); color: var(--brand); font-weight: 600; }
.wh-exercises { display: flex; flex-wrap: wrap; gap: var(--sp-1); }
.wh-ex { font-size: var(--fs-label); color: var(--text-2); background: var(--surface-2); padding: 4rpx 16rpx; border-radius: 20rpx; }
.wh-footer { display: flex; justify-content: space-between; align-items: center; padding-top: var(--sp-1); border-top: 1rpx solid var(--line-soft); }
.wh-cal { font-size: var(--fs-caption); color: var(--text-2); font-variant-numeric: tabular-nums; }
.wh-detail { display: flex; align-items: center; gap: 6rpx; font-size: var(--fs-caption); color: var(--brand); font-weight: 600; }
.wh-arrow { width: 24rpx; height: 24rpx; transform: rotate(90deg); }
```

- [x] **Step 3: 验证 + Commit**

Commit: `feat(page): 训练历史页重排 (token+kb-empty+动作标签)`

---

## Task 3: 定价页(pricing)

**目标:** 套餐卡片重排,Pro 卡用 brand-soft 强调,特性列表用线性 check 图标。

**Files:** `subpkg/user/pricing/index.{wxml,wxss,js}`

- [x] **Step 1: wxml 重写**

```xml
<!--subpkg/user/pricing/index.wxml - 套餐定价页-->
<view class="page-container">
  <view class="pricing-header">
    <text class="ph-title">选择你的套餐</text>
    <text class="ph-desc">解锁完整 AI 体能评估与训练方案</text>
  </view>

  <view class="plan-cards">
    <!-- Free -->
    <view class="plan-card card-flat {{selectedPlan === 'free' ? 'plan-card-active' : ''}}" bindtap="onSelectPlan" data-plan="free">
      <view class="pc-badge" wx:if="{{user.plan === 'free'}}">当前方案</view>
      <text class="pc-name">Free</text>
      <view class="pc-price-row"><text class="pc-price">¥0</text><text class="pc-unit">/月</text></view>
      <view class="pc-features">
        <view class="pc-feat-item" wx:for="{{freeFeatures}}" wx:key="*this"><image src="/assets/icons/st-ok.svg" mode="aspectFit" class="pc-feat-icon" /><text class="pc-feat {{item.disabled ? 'pc-feat-disabled' : ''}}">{{item.text}}</text></view>
      </view>
    </view>

    <!-- Pro -->
    <view class="plan-card card-flat plan-card-pro {{selectedPlan === 'pro' ? 'plan-card-active' : ''}}" bindtap="onSelectPlan" data-plan="pro">
      <view class="pc-badge pc-badge-hot">推荐</view>
      <text class="pc-name">Pro</text>
      <view class="pc-price-row"><text class="pc-price">¥29</text><text class="pc-unit">/月</text></view>
      <text class="pc-price-year">或 ¥199/年（省 ¥149）</text>
      <view class="pc-features">
        <view class="pc-feat-item" wx:for="{{proFeatures}}" wx:key="*this"><image src="/assets/icons/st-ok.svg" mode="aspectFit" class="pc-feat-icon {{item.disabled ? 'pc-feat-icon-disabled' : ''}}" /><text class="pc-feat">{{item.text}}</text></view>
      </view>
    </view>
  </view>

  <button class="btn-primary pricing-btn" bindtap="onConfirmPlan" loading="{{paying}}">
    {{selectedPlan === 'pro' ? '立即开通 Pro' : '当前已是 Free'}}
  </button>
</view>
```

- [x] **Step 2: js 改特性为对象数组**

`pages/.../pricing/index.js` data 加:
```js
freeFeatures: [
  { text: '体态分析 3 次/日' },
  { text: '训练方案 3 次/日' },
  { text: 'AI 对话 10 次/日' },
  { text: '前后对比', disabled: true },
  { text: '恢复追踪', disabled: true },
],
proFeatures: [
  { text: '体态分析 无限次' },
  { text: '训练方案 无限次' },
  { text: 'AI 对话 无限次' },
  { text: '前后对比' },
  { text: '恢复追踪 + 热力图' },
],
```

- [x] **Step 3: wxss 重写**

```css
/* subpkg/user/pricing/index.wxss */
.page-container { min-height: 100vh; background: var(--bg); padding: 0 var(--sp-4) env(safe-area-inset-bottom); }
.pricing-header { padding: var(--sp-5) 0 var(--sp-3); text-align: center; }
.ph-title { font-size: var(--fs-title); font-weight: 600; color: var(--text-1); display: block; }
.ph-desc { font-size: var(--fs-caption); color: var(--text-3); display: block; margin-top: var(--sp-1); }
.plan-cards { display: flex; flex-direction: column; gap: var(--sp-3); }
.plan-card { position: relative; border: 2rpx solid transparent; transition: border-color 0.2s; }
.plan-card-active { border-color: var(--brand); }
.plan-card-pro { border-color: var(--brand-600); background: var(--brand-soft); }
.pc-badge { position: absolute; top: 0; right: 0; background: var(--brand); color: #fff; font-size: var(--fs-label); padding: 4rpx 16rpx; border-radius: 0 var(--radius) 0 var(--radius-sm); font-weight: 600; }
.pc-badge-hot { background: var(--brand-600); }
.pc-name { font-size: var(--fs-h2); font-weight: 600; color: var(--text-1); display: block; margin-bottom: var(--sp-1); }
.pc-price-row { display: flex; align-items: baseline; gap: 4rpx; }
.pc-price { font-size: 56rpx; font-weight: 600; color: var(--brand); font-variant-numeric: tabular-nums; }
.pc-unit { font-size: var(--fs-caption); color: var(--text-3); }
.pc-price-year { font-size: var(--fs-label); color: var(--text-3); display: block; margin: 4rpx 0 var(--sp-2); }
.pc-features { display: flex; flex-direction: column; gap: var(--sp-1); }
.pc-feat-item { display: flex; align-items: center; gap: var(--sp-1); }
.pc-feat-icon { width: 28rpx; height: 28rpx; flex-shrink: 0; }
.pc-feat-icon-disabled { opacity: 0.3; }
.pc-feat { font-size: var(--fs-caption); color: var(--text-2); }
.pc-feat-disabled { color: var(--text-3); text-decoration: line-through; }
.pricing-btn { margin: var(--sp-5) 0; }
```

- [x] **Step 4: 验证 + Commit**

Commit: `feat(page): 定价页重排 (Pro卡brand-soft强调+线性check图标)`

---

## Task 4: 付费页(payment)

**目标:** 订单确认页,金额突出,支付方式列表,底部按钮。

**Files:** `subpkg/user/payment/index.{wxml,wxss,js}`

- [x] **Step 1: 读现状 + wxml 重写**

先读 `payment/index.wxml` 全文确认结构(订单信息/金额/方式/按钮)。重写为 token 版:金额用 `--fs-display` brand,方式项用线性图标,底部 `btn-primary`。

- [x] **Step 2: wxss 重写** —— 全引 token,移除 `#f8fafb`/`#111827` 等硬编码。

- [x] **Step 3: 验证 + Commit** —— `feat(page): 付费页重排 (token+金额突出)`

---

## Task 5: 个人页(profile)

**目标:** 用户信息卡 + 菜单列表,菜单项用线性图标,退出用 st-close-red。

**Files:** `subpkg/user/profile/index.{wxml,wxss,js}`

- [x] **Step 1: 读现状 + wxml 重写**

读 `profile/index.wxml` 全文(用户卡/会员状态/菜单组)。菜单图标:体态分析→tab-analyze,训练记录→tab-plan,设置→st-info,关于→st-info,退出→st-close-red。用户卡头像区用 brand-soft 底。

- [x] **Step 2: wxss 重写** —— 移除残留 `#f3f4f6`/`#111827`,头像/会员 badge 用 token。

- [x] **Step 3: js 补菜单图标字段** —— 若菜单数据是数组,每项加 `icon` 路径。

- [x] **Step 4: 验证 + Commit** —— `feat(page): 个人页重排 (菜单线性图标+token)`

---

## Task 6: 动作库页(exercises)

**目标:** 搜索栏 + 肌群筛选 + 动作卡片网格,卡片图标用动作模式 SVG(spec §6.3),详情弹窗重排。

**Files:** `pages/exercises/index.{wxml,wxss,js}`

- [x] **Step 1: js 数据加 pattern 字段**

`EXERCISE_DB` 每项加 `pattern`(推/拉/蹲/髋铰链/核心/拉伸/活动度/呼吸 8 选 1),`group` 已有。映射:
- 深蹲/弓步蹲/高抬腿 → squat
- 俯卧撑/哑铃卧推/肩推 → push
- 平板支撑/超人式/侧平板/登山者 → core
- 引体向上/哑铃划船/二头弯举/三头下压 → pull
- 臀桥 → hinge
图标用 `/assets/icons/pat-{{pattern}}.svg`。

- [x] **Step 2: wxml 卡片图标改 pattern svg**

`ec-icon-text {{item.name[0]}}` → `<image src="/assets/icons/pat-{{item.pattern}}.svg" class="ec-icon-img" />`。

- [x] **Step 3: wxss 重写** —— 卡片用 card-flat,图标容器 brand-soft 圆,筛选 tag active 用 brand。

- [x] **Step 4: 详情弹窗重排** —— ds-header 用 st-close 图标,ds-tips 用 brand dot。

- [x] **Step 5: 验证 + Commit** —— `feat(page): 动作库页重排 (pattern图标+卡片网格+详情弹窗)`

---

## Task 7: 训练方案页(plan)

**目标:** 生成表单 + 方案展示两态,表单选项/标签用 token,方案每日卡片重排。重点部位多选已在前面修过(selectedPartMap)。

**Files:** `pages/plan/index.{wxml,wxss,js}`

- [x] **Step 1: wxml 表单态重排** —— pf-option/pf-tag active 用 brand-soft + brand,表单用 card。

- [x] **Step 2: wxml 方案态重排** —— day-card 用 card-flat,展开箭头用 st-up rotate,exercise-item 用 brand dot。

- [x] **Step 3: wxss 重写** —— 全引 token,移除 `#f8fafb`/`#111827`/`#dcfce7` 残留(已机械替换过但 class 名旧)。

- [x] **Step 4: 验证 + Commit** —— `feat(page): 训练方案页重排 (表单+方案两态token化)`

---

## Task 8: AI 对话页(chat)

**目标:** 气泡流重排,AI 气泡 brand-soft 底,用户气泡 brand 底白字,头像用线性图标,输入栏底部固定。

**Files:** `pages/chat/index.{wxml,wxss,js}`

- [x] **Step 1: wxml 重写** —— 空态/头像 `AI`/`我` 文字 → 线性图标(tab-chat for AI, tab-plan or st-info for user)。气泡 msg-ai 用 brand-soft,msg-user 用 brand。typing 动画保留。

- [x] **Step 2: wxss 重写** —— 气泡圆角 radius,间距 sp-2,输入栏用 surface + line 上边框,send-btn active 用 brand。

- [x] **Step 3: js 确认 markdown 渲染** —— `utils/markdown.js` 已 teal 化(第一轮),确认 rich-text nodes 正常。

- [x] **Step 4: 验证 + Commit** —— `feat(page): AI对话页重排 (气泡token化+线性头像)`

---

## Task 9: 全局验收

- [x] **Step 1: 全量 js 语法** —— `for f in pages/*/index.js subpkg/*/*/index.js; do node --check "$f"; done`
- [x] **Step 2: 全量硬编码色扫描** —— `grep -rn "#[0-9a-f]\{6\}" pages subpkg --include=*.wxss` 排除 token 定义,确认无残留草绿/旧灰。
- [x] **Step 3: 全量字符占位扫描** —— 无 `○`/`!`/`×`/`✓` 当图标。
- [x] **Step 4: 实机走查 8 屏** —— 开发者工具逐屏点,确认布局 + 空态 + 交互。
- [x] **Step 5: Commit** —— `chore: 第二轮页重构全局验收`

---

## 完成定义

- [x] 8 屏 wxml/wxss 按新设计语言重排(非机械换色)
- [x] 所有屏颜色引 token,无硬编码草绿/旧灰
- [x] 空态统一 kb-empty
- [x] 图标全线性 SVG,动作库用 pattern 图标
- [x] section 间距 ≥48rpx
- [x] js 语法全通过,无 WXML 不兼容表达式
