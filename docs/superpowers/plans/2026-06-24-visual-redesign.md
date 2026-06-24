# KB 教练 · 新视觉设计系统 落地实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把 spec `docs/superpowers/specs/2026-06-24-visual-redesign-design.md` 落地到小程序端：建设计 token + 4 个自定义组件 + 雷达图 + 4 高频屏重排 + 统一图标系统。

**Architecture:** 混合架构——`app.wxss` 存 token 变量 + 工具类（真正引用变量），`components/` 下 4 个 Component（kb-radar/kb-score/kb-quota/kb-empty），图标全用内联 SVG。雷达用原生 canvas 2d 不引库。三件套先行，4 屏逐个重排后引用组件。

**Tech Stack:** 微信小程序原生（wxml/wxss/js）、canvas 2d API、Component 自定义组件、SVG 内联。

**Spec 参考:** 每个任务的"规格依据"指向 spec 章节号。

---

## 文件结构

| 文件 | 责任 | 动作 |
|------|------|------|
| `miniprogram/app.wxss` | 全局 token 变量 + 工具类 | 重写 |
| `miniprogram/app.json` | 注册组件到全局 usingComponents | 修改 |
| `miniprogram/components/kb-radar/` | 雷达图组件（2 变体） | 新建 |
| `miniprogram/components/kb-score/` | 评分展示组件 | 新建 |
| `miniprogram/components/kb-quota/` | 配额条组件 | 新建 |
| `miniprogram/components/kb-empty/` | 空态组件 | 新建 |
| `miniprogram/assets/icons/tab-*.svg` | 5 tab 图标 + 8 体态 + 8 模式 + 5 状态 | 新建（svg 源文件） |
| `miniprogram/pages/index/index.wxml` `.wxss` `.js` | 首页重排 | 修改 |
| `miniprogram/pages/analyze/index.wxml` `.wxss` | 分析结果页重排 | 修改 |
| `miniprogram/subpkg/history/compare/index.wxml` `.wxss` | 对比页重排 | 修改 |
| `miniprogram/subpkg/user/login/index.wxml` `.wxss` | 登录页重排 | 修改 |

---

## Task 1: 重写 app.wxss 设计 token + 工具类

**规格依据:** spec §3（配色/字号/间距）、§4.1（工具类）

**Files:**
- Rewrite: `miniprogram/app.wxss`

- [ ] **Step 1: 备份并清空 app.wxss**

```bash
cd F:/su/KBjiaolian
git mv miniprogram/app.wxss miniprogram/app.wxss.bak
```

- [ ] **Step 2: 写入完整 token + 工具类**

写入 `miniprogram/app.wxss`：

```css
/* app.wxss - KB教练全局样式 · 新视觉系统 */
/* 临床专业 teal + 高端极简留白 · spec §3 */

page {
  /* ====== 配色 token (light) ====== */
  --brand: #0f766e;
  --brand-600: #0d5a54;
  --brand-soft: #ccfbf1;
  --accent-warn: #f97316;

  --bg: #f6f8f7;
  --surface: #ffffff;
  --surface-2: #f9fafb;

  --text-1: #0f172a;
  --text-2: #475569;
  --text-3: #94a3b8;

  --line: #e2e8e4;
  --line-soft: #eef2f1;

  /* 肌群数据色板 (仅分类用, spec §3.1) */
  --data-chest: #0f766e;
  --data-back: #4f6d7a;
  --data-leg: #6b7280;
  --data-glute: #9f6f8f;
  --data-core: #5b7a8c;
  --data-shoulder: #b08968;

  /* dark 预留占位 (不适配, spec §3.1) */
  --bg-dark: ;
  --surface-dark: ;
  --text-1-dark: ;

  /* ====== 字号阶梯 (spec §3.2) ====== */
  --fs-display: 64rpx;
  --fs-title: 36rpx;
  --fs-h2: 30rpx;
  --fs-body: 28rpx;
  --fs-caption: 24rpx;
  --fs-label: 22rpx;

  /* ====== 间距 (spec §3.3) ====== */
  --sp-1: 8rpx;
  --sp-2: 16rpx;
  --sp-3: 24rpx;
  --sp-4: 32rpx;
  --sp-5: 48rpx;
  --sp-6: 64rpx;

  /* ====== 圆角 ====== */
  --radius-sm: 12rpx;
  --radius: 20rpx;
  --radius-lg: 28rpx;

  /* ====== 阴影 ====== */
  --shadow: 0 2rpx 12rpx rgba(15, 23, 42, 0.05);
  --shadow-brand: 0 4rpx 16rpx rgba(15, 118, 110, 0.16);

  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Helvetica Neue', Arial, sans-serif;
  font-size: var(--fs-body);
  color: var(--text-1);
  background-color: var(--bg);
  line-height: 1.6;
  box-sizing: border-box;
}

view, text, image { box-sizing: border-box; }

/* ====== 色彩工具类 ====== */
.text-brand { color: var(--brand); }
.text-warn { color: var(--accent-warn); }
.text-primary { color: var(--text-1); }
.text-secondary { color: var(--text-2); }
.text-muted { color: var(--text-3); }
.text-white { color: #ffffff; }
.bg-brand { background-color: var(--brand); }
.bg-brand-soft { background-color: var(--brand-soft); }
.bg-surface { background-color: var(--surface); }
.bg-page { background-color: var(--bg); }

/* ====== 布局工具类 ====== */
.flex-row { display: flex; flex-direction: row; }
.flex-col { display: flex; flex-direction: column; }
.flex-center { display: flex; align-items: center; justify-content: center; }
.flex-between { display: flex; align-items: center; justify-content: space-between; }
.flex-wrap { flex-wrap: wrap; }
.flex-1 { flex: 1; }
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: var(--sp-2); }

/* ====== 间距工具类 (引用 token) ====== */
.p-sm { padding: var(--sp-1); }
.p-md { padding: var(--sp-2); }
.p-lg { padding: var(--sp-3); }
.px-md { padding-left: var(--sp-2); padding-right: var(--sp-2); }
.py-md { padding-top: var(--sp-2); padding-bottom: var(--sp-2); }
.mt-sm { margin-top: var(--sp-1); }
.mt-md { margin-top: var(--sp-2); }
.mb-sm { margin-bottom: var(--sp-1); }
.mb-md { margin-bottom: var(--sp-2); }
.mx-auto { margin-left: auto; margin-right: auto; }

/* ====== 文字阶梯工具类 ====== */
.t-display { font-size: var(--fs-display); font-weight: 600; line-height: 1; font-variant-numeric: tabular-nums; }
.t-title { font-size: var(--fs-title); font-weight: 600; }
.t-h2 { font-size: var(--fs-h2); font-weight: 600; }
.t-body { font-size: var(--fs-body); font-weight: 400; }
.t-caption { font-size: var(--fs-caption); color: var(--text-2); }
.t-label { font-size: var(--fs-label); color: var(--text-3); letter-spacing: 2rpx; text-transform: uppercase; }

/* ====== 卡片 (spec §4.1) ====== */
.card {
  background: var(--surface);
  border-radius: var(--radius);
  padding: var(--sp-4);
  margin: 0 var(--sp-3) var(--sp-3);
  border: 1rpx solid var(--line-soft);
  box-shadow: var(--shadow);
}
.card-flat {
  background: var(--surface);
  border-radius: var(--radius);
  padding: var(--sp-4);
  border: 1rpx solid var(--line-soft);
}

/* ====== 按压反馈 ====== */
.tap-scale { transition: transform 0.15s ease, opacity 0.15s ease; }
.tap-scale:active { transform: scale(0.96); opacity: 0.85; }

/* ====== 按钮 ====== */
.btn-primary {
  background: var(--brand);
  color: #ffffff;
  border: none;
  border-radius: var(--radius-sm);
  padding: 22rpx 0;
  font-size: var(--fs-h2);
  font-weight: 600;
  text-align: center;
  width: 100%;
  line-height: 1.4;
  box-shadow: var(--shadow-brand);
}
.btn-primary:active { background: var(--brand-600); opacity: 0.92; }
.btn-outline {
  background: var(--surface);
  color: var(--brand);
  border: 2rpx solid var(--brand-soft);
  border-radius: var(--radius-sm);
  padding: 20rpx 0;
  font-size: var(--fs-h2);
  font-weight: 600;
  text-align: center;
  width: 100%;
  line-height: 1.4;
}
.btn-outline:active { background: var(--bg); }
.btn-disabled {
  background: var(--surface-2);
  color: var(--text-3);
  border-radius: var(--radius-sm);
  padding: 22rpx 0;
  font-size: var(--fs-h2);
  text-align: center;
  width: 100%;
  line-height: 1.4;
}

/* ====== 分割线 ====== */
.divider { height: 1rpx; background: var(--line-soft); margin: var(--sp-2) 0; }

/* ====== 页面容器 (横向 padding 统一 sp-4) ====== */
.page-container { min-height: 100vh; background: var(--bg); padding: 0 var(--sp-4) env(safe-area-inset-bottom); }

/* ====== section 标题 (间距 sp-5 起步) ====== */
.section-title {
  font-size: var(--fs-label);
  font-weight: 600;
  color: var(--text-3);
  letter-spacing: 2rpx;
  text-transform: uppercase;
  margin: var(--sp-5) 0 var(--sp-2);
}

/* ====== 入场动画 ====== */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(24rpx); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in { animation: fadeInUp 0.4s ease-out both; }
.animate-delay-1 { animation-delay: 0.06s; }
.animate-delay-2 { animation-delay: 0.12s; }
.animate-delay-3 { animation-delay: 0.18s; }
```

- [ ] **Step 3: 删除备份**

```bash
cd F:/su/KBjiaolian
rm miniprogram/app.wxss.bak
```

- [ ] **Step 4: 验证 token 引用**

打开微信开发者工具，确认 `app.wxss` 无语法错误（编译不报错）。用开发者工具的 wxss 面板在任一页面检查 `--brand` 变量值是否为 `#0f766e`。

Expected: 编译通过，`--brand` = `#0f766e`。

- [ ] **Step 5: Commit**

```bash
cd F:/su/KBjiaolian
git add miniprogram/app.wxss
git commit -m "feat(design): 重写 app.wxss 设计 token + 工具类 (teal 临床色系)"
```

---

## Task 2: 创建统一图标 SVG 源文件

**规格依据:** spec §6.1（统一规则）、§6.2（4 组图标）

**Files:**
- Create: `miniprogram/assets/icons/tab-home.svg`, `tab-analyze.svg`, `tab-plan.svg`, `tab-chat.svg`, `tab-exercises.svg`
- Create: `miniprogram/assets/icons/body-headforward.svg`, `body-roundshoulder.svg`, `body-pelvictilt.svg`, `body-kneeextension.svg`, `body-spinal.svg`, `body-shoulderheight.svg`, `body-leg.svg`, `body-core.svg`
- Create: `miniprogram/assets/icons/pat-push.svg`, `pat-pull.svg`, `pat-squat.svg`, `pat-hinge.svg`, `pat-core.svg`, `pat-stretch.svg`, `pat-mobility.svg`, `pat-breathing.svg`
- Create: `miniprogram/assets/icons/st-ok.svg`, `st-warn.svg`, `st-up.svg`, `st-down.svg`, `st-info.svg`

所有 SVG 统一：`viewBox="0 0 24 24"` `fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"`，用 `currentColor` 以便 wxss 控制颜色（active 设 color: brand，inactive 设 color: text-2）。

- [ ] **Step 1: 创建 tab 图标 5 个**

`miniprogram/assets/icons/tab-home.svg`：
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1h-5v-6h-6v6H4a1 1 0 01-1-1v-9.5z"/></svg>
```

`miniprogram/assets/icons/tab-analyze.svg`：
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="6" width="18" height="13" rx="2"/><circle cx="12" cy="12.5" r="3.2"/><path d="M7 6l1.5-2h7L17 6"/></svg>
```

`miniprogram/assets/icons/tab-plan.svg`：
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3v4M15 3v4M7 7h10v3a5 5 0 01-10 0V7zM12 15v3M9 21h6M10 18h4"/></svg>
```

`miniprogram/assets/icons/tab-chat.svg`：
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.5 8.5 0 01-12.5 7.5L3 21l1.8-5A8.5 8.5 0 1121 11.5z"/></svg>
```

`miniprogram/assets/icons/tab-exercises.svg`：
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6v12M18 6v12M3 9v6M21 9v6M6 12h12"/></svg>
```

- [ ] **Step 2: 创建 8 体态图标**

`miniprogram/assets/icons/body-headforward.svg`：
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="2.5"/><path d="M12 7.5v5M9 13l3-1 3 1M10 12.5L8 19M14 12.5L16 19M12 18v3"/></svg>
```

`miniprogram/assets/icons/body-roundshoulder.svg`：
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="4.5" r="2.2"/><path d="M10 7l-3 4M14 7l3 4M9 11l-2 8M15 11l2 8M12 9v6M11 15h2"/></svg>
```

`miniprogram/assets/icons/body-pelvictilt.svg`：
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v6M8 9c0 2 4 2 4 0M16 9c0 2-4 2-4 0M9 9l-2 5M15 9l2 5M10 14l-1 6M14 14l1 6M11 20h2"/></svg>
```

`miniprogram/assets/icons/body-kneeextension.svg`：
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="4" r="2"/><path d="M12 6v4M9 10l3-1 3 1M11 9l-2 5M13 9l2 5M10 14l-1 6M14 14l1 6"/></svg>
```

`miniprogram/assets/icons/body-spinal.svg`：
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3c-1 2-3 3-3 5 0 2 2 3 3 3s3-1 3-3c0-2-2-3-3-5zM11 11v3M13 11v3M9 14c0 3 1.5 6 3 6s3-3 3-6M9.5 17l-1.5 4M14.5 17l1.5 4"/></svg>
```

`miniprogram/assets/icons/body-shoulderheight.svg`：
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="4.5" r="2"/><circle cx="15" cy="5" r="2"/><path d="M9 6.5l-2 5M15 7l2 5M8 11.5l-1 9M16 12l1 9M12 9v5"/></svg>
```

`miniprogram/assets/icons/body-leg.svg`：
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="4" r="2"/><path d="M12 6v3M9 9h6M10 9l-1 4M14 9l1 4M9 13c0 3 1 7 3 7s3-4 3-7M9.5 20h5"/></svg>
```

`miniprogram/assets/icons/body-core.svg`：
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="2.2"/><path d="M12 7.5v3M8 11h8M9 11l-1 9M15 11l1 9M12 10.5V20"/><ellipse cx="12" cy="11" rx="4.5" ry="1.5"/></svg>
```

- [ ] **Step 3: 创建 8 动作模式图标**

`miniprogram/assets/icons/pat-push.svg`：
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"/><path d="M9 12H4M6 9l-3 3 3 3M15 12h5M18 9l3 3-3 3"/></svg>
```

`miniprogram/assets/icons/pat-pull.svg`：
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"/><path d="M3 12h5M6 9l3 3-3 3M21 12h-5M18 9l-3 3 3 3"/></svg>
```

`miniprogram/assets/icons/pat-squat.svg`：
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="2.2"/><path d="M12 7v4M12 11l-4 3v4M12 11l4 3v4"/></svg>
```

`miniprogram/assets/icons/pat-hinge.svg`：
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="7" cy="7" r="2"/><path d="M8.5 8.5L14 14M13 11l1 3 3 1M14 14v5M9 14l-1 5"/></svg>
```

`miniprogram/assets/icons/pat-core.svg`：
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12h16M5 12v5M11 12v4"/><ellipse cx="11" cy="12" rx="4" ry="1.4"/></svg>
```

`miniprogram/assets/icons/pat-stretch.svg`：
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="15" r="2"/><path d="M12 13V8M12 8L7 4M12 8l5-4M7 4l-1-1M17 4l1-1"/></svg>
```

`miniprogram/assets/icons/pat-mobility.svg`：
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12a7 7 0 1 1 12-3"/><path d="M17 6l3 1-1 3"/><circle cx="12" cy="13" r="1.8"/></svg>
```

`miniprogram/assets/icons/pat-breathing.svg`：
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M2 12h3M19 12h3M9 9L6 6M15 9l3-3"/></svg>
```

- [ ] **Step 4: 创建 5 状态图标**

`miniprogram/assets/icons/st-ok.svg`：
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
```

`miniprogram/assets/icons/st-warn.svg`：
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 9v4M12 17h.01"/><circle cx="12" cy="12" r="9"/></svg>
```

`miniprogram/assets/icons/st-up.svg`：
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17L17 7M9 7h8v8"/></svg>
```

`miniprogram/assets/icons/st-down.svg`：
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 7l10 10M17 7v8H9"/></svg>
```

`miniprogram/assets/icons/st-info.svg`：
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/></svg>
```

- [ ] **Step 5: 验证 SVG 可渲染**

在微信开发者工具的任一页面 wxml 里临时插入一行测试，确认 SVG 内联能显示：
```xml
<image src="/assets/icons/tab-home.svg" style="width:40rpx;height:40rpx" />
```
Expected: 显示一个线性 home 图标。确认后删除测试行。

- [ ] **Step 6: Commit**

```bash
cd F:/su/KBjiaolian
git add miniprogram/assets/icons/*.svg
git commit -m "feat(icons): 统一图标系统 26 个 SVG (tab/体态/模式/状态)"
```

---

## Task 3: kb-empty 组件（最简单，先做）

**规格依据:** spec §4.2（kb-empty）

**Files:**
- Create: `miniprogram/components/kb-empty/index.wxml`, `index.wxss`, `index.js`, `index.json`

- [ ] **Step 1: 建组件目录与 json**

`miniprogram/components/kb-empty/index.json`：
```json
{ "component": true, "usingComponents": {} }
```

- [ ] **Step 2: 写 js**

`miniprogram/components/kb-empty/index.js`：
```js
Component({
  properties: {
    icon: { type: String, value: '/assets/icons/st-info.svg' },
    text: { type: String, value: '暂无数据' },
    cta: { type: String, value: '' },
  },
  methods: {
    onTapCta() { this.triggerEvent('cta'); },
  },
});
```

- [ ] **Step 3: 写 wxml**

`miniprogram/components/kb-empty/index.wxml`：
```xml
<view class="kb-empty">
  <image class="kb-empty-icon" src="{{icon}}" mode="aspectFit" />
  <text class="kb-empty-text">{{text}}</text>
  <button wx:if="{{cta}}" class="kb-empty-cta" bindtap="onTapCta">{{cta}}</button>
</view>
```

- [ ] **Step 4: 写 wxss**

`miniprogram/components/kb-empty/index.wxss`：
```css
.kb-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 100rpx 40rpx; }
.kb-empty-icon { width: 96rpx; height: 96rpx; margin-bottom: var(--sp-3); opacity: 0.4; }
.kb-empty-text { font-size: var(--fs-caption); color: var(--text-3); margin-bottom: var(--sp-3); }
.kb-empty-cta { background: var(--brand); color: #fff; font-size: var(--fs-body); border-radius: var(--radius-sm); padding: 16rpx 48rpx; line-height: 1.4; }
.kb-empty-cta:active { opacity: 0.85; }
```

- [ ] **Step 5: 全局注册**

修改 `miniprogram/app.json`，在顶层加 `usingComponents`（如已有则合并）：
```json
"usingComponents": {
  "kb-empty": "/components/kb-empty/index"
}
```

- [ ] **Step 6: 验证**

在首页 wxml 临时把空态替换为 `<kb-empty text="今天还没有记录" cta="去分析" bind:cta="onTapAnalyze" />`，开发者工具预览。
Expected: 显示线性图标 + 文字 + 按钮，点击按钮触发跳转。验证后还原。

- [ ] **Step 7: Commit**

```bash
cd F:/su/KBjiaolian
git add miniprogram/components/kb-empty miniprogram/app.json
git commit -m "feat(comp): kb-empty 空态组件"
```

---

## Task 4: kb-quota 配额条组件

**规格依据:** spec §4.2（kb-quota）

**Files:**
- Create: `miniprogram/components/kb-quota/index.{wxml,wxss,js,json}`

- [ ] **Step 1: json + js**

`miniprogram/components/kb-quota/index.json`：
```json
{ "component": true, "usingComponents": {} }
```

`miniprogram/components/kb-quota/index.js`：
```js
Component({
  properties: {
    items: {
      type: Array,
      value: [],
      // 每项 { label, remaining, total }
    },
  },
  data: {},
  observers: {
    'items': function (items) {
      const computed = (items || []).map(it => {
        const total = it.total || 0;
        const remaining = it.remaining || 0;
        const percent = total > 0 ? Math.min(100, (remaining / total) * 100) : 0;
        const over = remaining > total; // 超量
        return { ...it, percent, over };
      });
      this.setData({ computed });
    },
  },
  lifetimes: {
    attached() {
      this.observers.items.call(this, this.data.items);
    },
  },
});
```

- [ ] **Step 2: wxml**

`miniprogram/components/kb-quota/index.wxml`：
```xml
<view class="kb-quota">
  <view class="kb-quota-item" wx:for="{{computed}}" wx:key="label">
    <view class="kb-quota-row">
      <text class="kb-quota-label">{{item.label}}</text>
      <text class="kb-quota-count {{item.over ? 'kb-quota-over' : ''}}">{{item.remaining}} / {{item.total}}</text>
    </view>
    <view class="kb-quota-bar-bg">
      <view class="kb-quota-bar-fill {{item.over ? 'kb-quota-bar-over' : ''}}" style="width: {{item.percent}}%"></view>
    </view>
  </view>
</view>
```

- [ ] **Step 3: wxss**

`miniprogram/components/kb-quota/index.wxss`：
```css
.kb-quota { display: flex; flex-direction: column; gap: var(--sp-2); }
.kb-quota-row { display: flex; justify-content: space-between; align-items: center; }
.kb-quota-label { font-size: var(--fs-caption); color: var(--text-2); }
.kb-quota-count { font-size: var(--fs-caption); color: var(--brand); font-weight: 600; font-variant-numeric: tabular-nums; }
.kb-quota-over { color: var(--accent-warn); }
.kb-quota-bar-bg { width: 100%; height: 6rpx; background: var(--line-soft); border-radius: 3rpx; overflow: hidden; margin-top: 8rpx; }
.kb-quota-bar-fill { height: 100%; background: var(--brand); border-radius: 3rpx; transition: width 0.3s; }
.kb-quota-bar-over { background: var(--accent-warn); }
```

- [ ] **Step 4: 注册**

`miniprogram/app.json` 的 `usingComponents` 加：
```json
"kb-quota": "/components/kb-quota/index"
```

- [ ] **Step 5: 验证**

在首页临时 `<kb-quota items="{{quotaList}}" />`，传现有 quotaList（每项补 total 字段）。
Expected: 渲染横向配额条，teal 进度。验证后还原。

- [ ] **Step 6: Commit**

```bash
cd F:/su/KBjiaolian
git add miniprogram/components/kb-quota miniprogram/app.json
git commit -m "feat(comp): kb-quota 配额条组件"
```

---

## Task 5: kb-score 评分展示组件

**规格依据:** spec §4.2（kb-score）、§7.1（plain）、§7.2（ring）

**Files:**
- Create: `miniprogram/components/kb-score/index.{wxml,wxss,js,json}`

- [ ] **Step 1: json + js**

`miniprogram/components/kb-score/index.json`：
```json
{ "component": true, "usingComponents": {} }
```

`miniprogram/components/kb-score/index.js`：
```js
Component({
  properties: {
    value: { type: null, value: '--' },     // 数字或 '--'
    label: { type: String, value: '综合评分' },
    delta: { type: Number, value: 0 },       // 较上次变化，0 不显示
    variant: { type: String, value: 'plain' }, // plain | ring
    level: { type: String, value: '' },      // ring 模式下显示等级文字
  },
  data: {
    deltaStr: '',
    deltaUp: true,
  },
  observers: {
    'delta': function (d) {
      if (!d) { this.setData({ deltaStr: '' }); return; }
      this.setData({
        deltaStr: (d > 0 ? '↑ +' : '↓ ') + Math.abs(d) + ' 较上次',
        deltaUp: d > 0,
      });
    },
  },
  lifetimes: {
    attached() { this.observers.delta.call(this, this.data.delta); },
  },
});
```

- [ ] **Step 2: wxml**

`miniprogram/components/kb-score/index.wxml`：
```xml
<view class="kb-score kb-score-{{variant}}">
  <!-- plain: 大数字 + 细底线 -->
  <block wx:if="{{variant === 'plain'}}">
    <text class="kb-score-label">{{label}}</text>
    <view class="kb-score-plain-wrap">
      <text class="kb-score-value">{{value}}</text>
      <text class="kb-score-unit">分</text>
    </view>
    <text wx:if="{{deltaStr}}" class="kb-score-delta {{deltaUp ? 'kb-score-up' : 'kb-score-down'}}">{{deltaStr}}</text>
    <view class="kb-score-underline" wx:if="{{value !== '--'}}">
      <view class="kb-score-underline-fill" style="width: {{value}}%"></view>
    </view>
  </block>
  <!-- ring: conic 环 + 数字 -->
  <block wx:else>
    <view class="kb-score-ring-row">
      <view class="kb-score-ring" style="background: conic-gradient(var(--brand) 0% {{value}}%, var(--line) {{value}}% 100%)">
        <view class="kb-score-ring-inner">
          <text class="kb-score-ring-value">{{value}}</text>
        </view>
      </view>
      <view class="kb-score-ring-info">
        <text class="kb-score-label">{{label}}</text>
        <text wx:if="{{level}}" class="kb-score-level">{{level}}</text>
        <text wx:if="{{deltaStr}}" class="kb-score-delta {{deltaUp ? 'kb-score-up' : 'kb-score-down'}}">{{deltaStr}}</text>
      </view>
    </view>
  </block>
</view>
```

- [ ] **Step 3: wxss**

`miniprogram/components/kb-score/index.wxss`：
```css
.kb-score-label { font-size: var(--fs-label); color: var(--text-3); letter-spacing: 2rpx; text-transform: uppercase; display: block; }
.kb-score-value { font-size: var(--fs-display); font-weight: 600; color: var(--brand); line-height: 1; font-variant-numeric: tabular-nums; }
.kb-score-plain-wrap { display: flex; align-items: baseline; gap: 8rpx; margin-top: var(--sp-1); }
.kb-score-unit { font-size: var(--fs-h2); color: var(--text-3); }
.kb-score-delta { font-size: var(--fs-caption); font-weight: 600; margin-top: var(--sp-1); display: block; }
.kb-score-up { color: var(--brand); }
.kb-score-down { color: var(--accent-warn); }
.kb-score-underline { height: 4rpx; background: var(--line-soft); border-radius: 2rpx; margin-top: var(--sp-2); }
.kb-score-underline-fill { height: 100%; background: var(--brand); border-radius: 2rpx; }

/* ring */
.kb-score-ring-row { display: flex; flex-direction: row; align-items: center; }
.kb-score-ring { width: 144rpx; height: 144rpx; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.kb-score-ring-inner { width: 112rpx; height: 112rpx; border-radius: 50%; background: var(--surface); display: flex; align-items: center; justify-content: center; }
.kb-score-ring-value { font-size: var(--fs-title); font-weight: 600; color: var(--brand); }
.kb-score-ring-info { display: flex; flex-direction: column; gap: 4rpx; margin-left: var(--sp-3); }
.kb-score-level { font-size: var(--fs-h2); font-weight: 600; color: var(--text-1); }
```

- [ ] **Step 4: 注册**

`miniprogram/app.json` 的 `usingComponents` 加：
```json
"kb-score": "/components/kb-score/index"
```

- [ ] **Step 5: 验证**

在分析页临时 `<kb-score variant="ring" value="{{92}}" label="综合评分" level="优秀" delta="{{5}}" />`。
Expected: 显示 teal conic 环 + 92 + 优秀 + ↑+5。验证后还原。

- [ ] **Step 6: Commit**

```bash
cd F:/su/KBjiaolian
git add miniprogram/components/kb-score miniprogram/app.json
git commit -m "feat(comp): kb-score 评分组件 (plain/ring)"
```

---

## Task 6: kb-radar 雷达图组件（招牌图，核心）

**规格依据:** spec §5（雷达规格）、§5.1（result）、§5.2（compare）、§5.3（实现要点）

**Files:**
- Create: `miniprogram/components/kb-radar/index.{wxml,wxss,js,json}`

8 维度固定顺序与字段名（与 Flutter `RadarData` 对齐，spec §5）：
`['headForward','roundShoulder','pelvicTilt','kneeExtension','spinalCurvature','shoulderHeight','legAlignment','coreStability']`
标签：`['头前伸','圆肩','骨盆前倾','膝超伸','脊柱侧弯','高低肩','XO型腿','核心稳定']`

- [ ] **Step 1: json + js（canvas 2d 绘制）**

`miniprogram/components/kb-radar/index.json`：
```json
{ "component": true, "usingComponents": {} }
```

`miniprogram/components/kb-radar/index.js`：
```js
const LABELS = ['头前伸','圆肩','骨盆前倾','膝超伸','脊柱侧弯','高低肩','XO型腿','核心稳定'];
const KEYS = ['headForward','roundShoulder','pelvicTilt','kneeExtension','spinalCurvature','shoulderHeight','legAlignment','coreStability'];

Component({
  properties: {
    data: { type: Object, value: {} },        // { headForward: 88, ... }
    mode: { type: String, value: 'result' },  // result | compare
    prevData: { type: Object, value: {} },    // compare 模式上次数据
    size: { type: Number, value: 280 },        // canvas px
  },
  data: { canvasId: 'kbRadar' + Math.random().toString(36).slice(2,8) },
  observers: {
    'data, prevData, mode': function () {
      this.draw();
    },
  },
  lifetimes: {
    attached() { this.draw(); },
  },
  methods: {
    vals(obj) {
      return KEYS.map(k => Number(obj && obj[k] || 0));
    },
    draw() {
      const query = this.createSelectorQuery();
      query.select('#' + this.data.canvasId).fields({ node: true, size: true }).exec((res) => {
        if (!res || !res[0] || !res[0].node) return;
        const canvas = res[0].node;
        const ctx = canvas.getContext('2d');
        const dpr = wx.getWindowInfo().pixelRatio || 2;
        const size = this.data.size;
        canvas.width = size * dpr;
        canvas.height = size * dpr;
        ctx.scale(dpr, dpr);
        this.render(ctx, size);
      });
    },
    render(ctx, size) {
      const cx = size / 2, cy = size / 2;
      const radius = size / 2 - 26;
      const N = 8;
      const angle = i => -Math.PI / 2 + 2 * Math.PI * i / N;
      const point = (r, i) => ({ x: cx + r * Math.cos(angle(i)), y: cy + r * Math.sin(angle(i)) });

      ctx.clearRect(0, 0, size, size);

      // 网格 4 圈
      ctx.strokeStyle = '#eef2f1';
      ctx.lineWidth = 1;
      for (let ring = 1; ring <= 4; ring++) {
        const r = radius * ring / 4;
        ctx.beginPath();
        for (let i = 0; i <= N; i++) {
          const p = point(r, i % N);
          if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
        }
        ctx.stroke();
      }
      // 轴线
      for (let i = 0; i < N; i++) {
        const p = point(radius, i);
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(p.x, p.y); ctx.stroke();
      }

      // compare: 先画上次(灰虚线)
      if (this.data.mode === 'compare' && this.data.prevData) {
        this.drawPoly(ctx, this.vals(this.data.prevData), radius, cx, cy, N, point, {
          stroke: '#cbd5e1', fill: null, dashed: true,
        });
      }

      // 本次
      const cur = this.vals(this.data.data);
      this.drawPoly(ctx, cur, radius, cx, cy, N, point, {
        stroke: '#0f766e', fill: 'rgba(15,118,110,0.12)', dashed: false, dots: true,
      });

      // result 模式: 问题点高亮(最低分)
      if (this.data.mode === 'result') {
        let minIdx = 0, minVal = cur[0];
        for (let i = 1; i < N; i++) { if (cur[i] < minVal) { minVal = cur[i]; minIdx = i; } }
        const p = point(radius * (cur[minIdx] / 100), minIdx);
        ctx.strokeStyle = '#f97316';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(p.x, p.y, 7, 0, 2 * Math.PI); ctx.stroke();
      }

      // 标签
      ctx.fillStyle = '#94a3b8';
      ctx.font = '9px sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      for (let i = 0; i < N; i++) {
        const p = point(radius + 14, i);
        const a = angle(i);
        if (Math.cos(a) > 0.3) ctx.textAlign = 'left';
        else if (Math.cos(a) < -0.3) ctx.textAlign = 'right';
        else ctx.textAlign = 'center';
        ctx.fillText(LABELS[i], p.x, p.y);
      }

      // compare 图例
      if (this.data.mode === 'compare') {
        ctx.fillStyle = '#0f766e'; ctx.fillRect(cx - 30, cy + radius + 16, 12, 3);
        ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif'; ctx.textAlign = 'left';
        ctx.fillText('本次', cx - 14, cy + radius + 18);
        ctx.strokeStyle = '#cbd5e1'; ctx.setLineDash([4, 3]);
        ctx.beginPath(); ctx.moveTo(cx + 10, cy + radius + 18); ctx.lineTo(cx + 22, cy + radius + 18); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillText('上次', cx + 26, cy + radius + 18);
      }
    },
    drawPoly(ctx, vals, radius, cx, cy, N, point, opt) {
      ctx.beginPath();
      for (let i = 0; i < N; i++) {
        const p = point(radius * (Math.max(0, Math.min(100, vals[i])) / 100), i);
        if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
      }
      ctx.closePath();
      if (opt.fill) { ctx.fillStyle = opt.fill; ctx.fill(); }
      ctx.strokeStyle = opt.stroke;
      ctx.lineWidth = 2;
      if (opt.dashed) ctx.setLineDash([4, 3]); else ctx.setLineDash([]);
      ctx.stroke();
      ctx.setLineDash([]);
      if (opt.dots) {
        ctx.fillStyle = opt.stroke;
        for (let i = 0; i < N; i++) {
          const p = point(radius * (Math.max(0, Math.min(100, vals[i])) / 100), i);
          ctx.beginPath(); ctx.arc(p.x, p.y, 3.5, 0, 2 * Math.PI); ctx.fill();
        }
      }
    },
  },
});
```

- [ ] **Step 2: wxml**

`miniprogram/components/kb-radar/index.wxml`：
```xml
<canvas type="2d" id="{{canvasId}}" class="kb-radar-canvas" style="width:{{size}}px;height:{{size}}px"></canvas>
```

- [ ] **Step 3: wxss**

`miniprogram/components/kb-radar/index.wxss`：
```css
.kb-radar-canvas { display: block; margin: 0 auto; }
```

- [ ] **Step 4: 注册**

`miniprogram/app.json` 的 `usingComponents` 加：
```json
"kb-radar": "/components/kb-radar/index"
```

- [ ] **Step 5: 验证 result 模式**

在分析结果页临时 `<kb-radar mode="result" size="{{260}}" data="{{result.dimensions}}" />`。
注意：`result.dimensions` 当前是数组 `[{key,name,score,suggestion}]`，需先确认后端是否返回雷达结构。若后端返回的是 `result.radar`（对象，与 Flutter 对齐）则传 `data="{{result.radar}}"`。在 analyze/index.js 的 `showResult` 里 `console.log(resultData)` 确认结构。
Expected: canvas 绘制 teal 多边形 + 最低分维度橙色环。验证后还原临时调用。

- [ ] **Step 6: 验证 compare 模式**

在对比页临时 `<kb-radar mode="compare" size="{{260}}" data="{{compareResult.radarB}}" prevData="{{compareResult.radarA}}" />`。
确认对比接口返回的雷达字段名（在 compare/index.js `onCompare` 里 console.log res）。
Expected: 双层多边形（teal 实线 + 灰虚线）+ 图例。验证后还原。

- [ ] **Step 7: Commit**

```bash
cd F:/su/KBjiaolian
git add miniprogram/components/kb-radar miniprogram/app.json
git commit -m "feat(comp): kb-radar 雷达图组件 (result/compare 双模式, canvas 2d)"
```

---

## Task 7: 首页重排

**规格依据:** spec §7.1

**Files:**
- Modify: `miniprogram/pages/index/index.wxml`, `index.wxss`, `index.js`

- [ ] **Step 1: 改 js（quickActions 换 svg 路径 + todaySummary 适配）**

`miniprogram/pages/index/index.js` 的 `data.quickActions` 改为：
```js
quickActions: [
  { key: 'analyze', icon: '/assets/icons/tab-analyze.svg', text: '体态分析' },
  { key: 'plan', icon: '/assets/icons/tab-plan.svg', text: '训练方案' },
  { key: 'chat', icon: '/assets/icons/tab-chat.svg', text: 'AI 对话' },
  { key: 'exercises', icon: '/assets/icons/tab-exercises.svg', text: '动作库' },
],
```
其余 js 逻辑不变。

- [ ] **Step 2: 重写 wxml（已登录态）**

`miniprogram/pages/index/index.wxml` 的已登录 block（`wx:else`）替换为：
```xml
<block wx:else>
  <!-- 欢迎栏 -->
  <view class="welcome-bar animate-fade-in">
    <view>
      <text class="welcome-text">下午好，{{user.nickname || '健身伙伴'}}</text>
      <text class="welcome-date">{{today}}</text>
    </view>
    <view class="plan-badge badge">{{user.plan === 'pro' ? 'Pro' : 'Free'}}</view>
  </view>

  <!-- 评分 hero -->
  <view class="hero-score-wrap animate-fade-in animate-delay-1" wx:if="{{latestScore}}">
    <kb-score variant="plain" value="{{latestScore}}" label="综合体态评分" delta="{{latestDelta}}" />
  </view>

  <!-- 配额 -->
  <view class="section-title">今日配额</view>
  <view class="card-flat quota-card animate-fade-in animate-delay-2">
    <kb-quota items="{{quotaList}}" />
    <text class="quota-upgrade" wx:if="{{user.plan !== 'pro'}}" bindtap="onTapUpgrade">升级 Pro →</text>
  </view>

  <!-- 快捷操作 -->
  <view class="section-title">快捷操作</view>
  <view class="quick-grid animate-fade-in animate-delay-3">
    <view class="quick-tile tap-scale" wx:for="{{quickActions}}" wx:key="key" bindtap="onTapQuick" data-key="{{item.key}}">
      <view class="quick-icon-circle">
        <image class="quick-icon-img" src="{{item.icon}}" mode="aspectFit" />
      </view>
      <text class="quick-text">{{item.text}}</text>
    </view>
  </view>

  <!-- 今日摘要 -->
  <view class="section-title">今日摘要</view>
  <view class="card-flat summary-card animate-fade-in animate-delay-4" wx:if="{{todaySummary.length}}">
    <view class="summary-item" wx:for="{{todaySummary}}" wx:key="key">
      <image class="summary-icon" src="{{item.icon}}" mode="aspectFit" />
      <text class="summary-label">{{item.label}}</text>
      <text class="summary-value">{{item.value}}</text>
    </view>
  </view>
  <kb-empty wx:else icon="/assets/icons/tab-analyze.svg" text="今天还没有记录，快去分析体态吧" cta="去分析" bind:cta="onTapAnalyze" />
</view>
```

同时在 `index.js` 加 `onTapQuick(e)` 方法（统一处理快捷操作跳转）：
```js
onTapQuick(e) {
  const key = e.currentTarget.dataset.key;
  if (!this.checkAuth()) return;
  const map = { analyze: '/pages/analyze/index', plan: '/pages/plan/index', chat: '/pages/chat/index', exercises: '/pages/exercises/index' };
  wx.switchTab({ url: map[key] });
},
```
并删掉旧的 `onTapAnalyze/onTapPlan/onTapChat/onTapExercises`（被 onTapQuick 取代；但 kb-empty 的 cta 仍 bind onTapAnalyze，保留 `onTapAnalyze` 方法或改成统一调用 onTapQuick）。

- [ ] **Step 3: 重写 wxss（只保留首页专用类，颜色全引用 token）**

`miniprogram/pages/index/index.wxss` 全部替换为：
```css
/* pages/index/index.wxss - 首页 */
.welcome-bar { display: flex; align-items: flex-start; justify-content: space-between; padding: var(--sp-5) 0 var(--sp-3); }
.welcome-text { font-size: var(--fs-title); font-weight: 600; color: var(--text-1); display: block; }
.welcome-date { font-size: var(--fs-caption); color: var(--text-3); display: block; margin-top: 4rpx; }
.badge { font-size: var(--fs-label); font-weight: 600; color: var(--brand); background: var(--brand-soft); padding: 4rpx 16rpx; border-radius: 20rpx; }

.hero-score-wrap { padding: 0 0 var(--sp-2); }

.quota-card { display: flex; flex-direction: column; gap: var(--sp-2); }
.quota-upgrade { font-size: var(--fs-caption); color: var(--brand); font-weight: 600; margin-top: var(--sp-2); }

.quick-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--sp-3); margin: 0 0 var(--sp-3); }
.quick-tile { background: var(--surface); border: 1rpx solid var(--line-soft); border-radius: var(--radius); padding: var(--sp-3); display: flex; flex-direction: column; align-items: center; gap: var(--sp-2); }
.quick-icon-circle { width: 72rpx; height: 72rpx; border-radius: 50%; background: var(--brand-soft); display: flex; align-items: center; justify-content: center; }
.quick-icon-img { width: 36rpx; height: 36rpx; }
.quick-text { font-size: var(--fs-caption); color: var(--text-1); font-weight: 600; }

.summary-item { display: flex; align-items: center; gap: var(--sp-2); padding: var(--sp-2) 0; border-bottom: 1rpx solid var(--line-soft); }
.summary-item:last-child { border-bottom: none; }
.summary-icon { width: 32rpx; height: 32rpx; }
.summary-label { flex: 1; font-size: var(--fs-body); color: var(--text-2); }
.summary-value { font-size: var(--fs-caption); color: var(--brand); font-weight: 600; font-variant-numeric: tabular-nums; }
```

- [ ] **Step 4: 验证**

开发者工具预览首页（已登录态）。
Expected: 深 teal 主色、大留白、快捷操作为线性 svg 图标、空态为 kb-empty 组件。

- [ ] **Step 5: Commit**

```bash
cd F:/su/KBjiaolian
git add miniprogram/pages/index/
git commit -m "feat(page): 首页重排 (teal+A留白+线性图标+kb组件)"
```

---

## Task 8: 分析结果页重排

**规格依据:** spec §7.2

**Files:**
- Modify: `miniprogram/pages/analyze/index.wxml`, `index.wxss`
- 可能 Modify: `miniprogram/pages/analyze/index.js`（确认 result.radar 字段）

- [ ] **Step 1: 确认后端返回的雷达字段**

在 `pages/analyze/index.js` 的 `showResult` 加临时日志：
```js
showResult(resultData) {
  console.log('[analyze] result', JSON.stringify(resultData).slice(0, 500));
  this.setData({ step: 'result', result: resultData, resultImageUrl: resultData.imageUrl || '' });
},
```
跑一次分析，看 console。若 `result` 含 `radar: { headForward, ... }` 则直接用；若只有 `dimensions` 数组，则在 showResult 里转换成 radar 对象：
```js
// 若后端只返回 dimensions 数组，转成 radar 对象
if (!resultData.radar && resultData.dimensions) {
  const keys = ['headForward','roundShoulder','pelvicTilt','kneeExtension','spinalCurvature','shoulderHeight','legAlignment','coreStability'];
  const radar = {};
  (resultData.dimensions || []).forEach((d, i) => { radar[keys[i]] = d.score; });
  resultData.radar = radar;
}
```
确认后删除临时 console.log，保留转换逻辑（如有）。

- [ ] **Step 2: 重写 result 步骤 wxml**

`pages/analyze/index.wxml` 的 `step === 'result'` block 替换为：
```xml
<view wx:if="{{step === 'result'}}">
  <!-- 原图预览 -->
  <view class="result-image-wrap">
    <image class="result-image" src="{{resultImageUrl}}" mode="widthFix" />
  </view>

  <!-- 评分 ring -->
  <view class="result-score-row animate-fade-in">
    <kb-score variant="ring" value="{{result.overallScore}}" label="综合评分" level="{{result.level}}" delta="{{result.scoreDelta}}" />
  </view>

  <!-- 雷达图 -->
  <view class="section-title">8 大体态维度</view>
  <view class="radar-wrap animate-fade-in animate-delay-1">
    <kb-radar mode="result" size="{{260}}" data="{{result.radar}}" />
  </view>

  <!-- 需关注 -->
  <view class="section-title">需关注</view>
  <view class="card-flat concern-card animate-fade-in animate-delay-2">
    <view class="concern-row" wx:for="{{result.dimensions}}" wx:key="key" wx:if="{{item.score < 80}}">
      <image class="concern-icon" src="/assets/icons/st-warn.svg" style="filter: hue-rotate(0deg)" />
      <view class="concern-info">
        <text class="concern-name">{{item.name}} {{item.score}}分</text>
        <text class="concern-suggestion">{{item.suggestion}}</text>
      </view>
    </view>
  </view>

  <!-- 操作 -->
  <view class="result-actions">
    <button class="btn-primary" bindtap="onTapSave">保存记录</button>
    <button class="btn-outline" bindtap="onTapRetake">重新拍照</button>
    <button class="btn-outline" wx:if="{{hasHistory}}" bindtap="onTapCompare">前后对比</button>
  </view>
</view>
```

注意：concern-icon 用 st-warn.svg（橙色），但 svg 用 currentColor，需在 wxss 设 `color: var(--accent-warn)` 让 image 继承——但 `<image>` 不继承 color。改为：concern 区用文字 `⚠` 会回退占位。正确做法：把 st-warn 的 svg 改为固定 `stroke="#f97316"`，或用 view 包裹设色。最简：复制一份 `st-warn-orange.svg` 内容里 stroke 写死 `#f97316`。在 Task 2 已用 currentColor，这里新建一个写死橙色的变体文件：

`miniprogram/assets/icons/st-warn-orange.svg`：
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#f97316" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 9v4M12 17h.01"/><circle cx="12" cy="12" r="9"/></svg>
```
wxml 里 concern-icon src 改为 `/assets/icons/st-warn-orange.svg`。

- [ ] **Step 3: 重写 wxss**

`pages/analyze/index.wxss` 全部替换为：
```css
/* pages/analyze/index.wxss */
.page-container { min-height: 100vh; background: var(--bg); padding: 0 var(--sp-4) env(safe-area-inset-bottom); }
.result-image-wrap { margin: var(--sp-3) 0; border-radius: var(--radius-lg); overflow: hidden; }
.result-image { width: 100%; }
.result-score-row { display: flex; justify-content: center; padding: var(--sp-3) 0; }
.radar-wrap { display: flex; justify-content: center; padding: var(--sp-3) 0; }
.concern-card { display: flex; flex-direction: column; gap: var(--sp-2); }
.concern-row { display: flex; gap: var(--sp-2); align-items: flex-start; padding: var(--sp-2) 0; border-bottom: 1rpx solid var(--line-soft); }
.concern-row:last-child { border-bottom: none; }
.concern-icon { width: 36rpx; height: 36rpx; flex-shrink: 0; }
.concern-info { flex: 1; }
.concern-name { font-size: var(--fs-body); color: var(--text-1); font-weight: 600; display: block; }
.concern-suggestion { font-size: var(--fs-caption); color: var(--text-2); margin-top: 4rpx; display: block; line-height: 1.5; }
.result-actions { display: flex; flex-direction: column; gap: var(--sp-2); margin: var(--sp-4) 0; }

/* idle 步骤沿用 */
.analyze-hero { margin: var(--sp-3) 0; }
.ah-title { font-size: var(--fs-h2); font-weight: 600; color: var(--text-1); display: block; }
.ah-desc { font-size: var(--fs-caption); color: var(--text-2); margin: var(--sp-2) 0; display: block; }
.ah-actions { display: flex; flex-direction: column; gap: var(--sp-2); margin-top: var(--sp-3); }
```

- [ ] **Step 4: 验证**

跑一次分析流程到结果页。
Expected: ring 评分 + 雷达图(含问题点橙色环) + 需关注区(橙色 warn 图标) + 操作按钮。

- [ ] **Step 5: Commit**

```bash
cd F:/su/KBjiaolian
git add miniprogram/pages/analyze/ miniprogram/assets/icons/st-warn-orange.svg
git commit -m "feat(page): 分析结果页重排 (ring评分+雷达招牌图+问题点高亮)"
```

---

## Task 9: 历史对比页重排

**规格依据:** spec §7.3

**Files:**
- Modify: `miniprogram/subpkg/history/compare/index.wxml`, `index.wxss`, `index.js`

- [ ] **Step 1: 确认对比接口返回字段**

在 `compare/index.js` 的 `onCompare` 成功后加临时日志：
```js
console.log('[compare] res', JSON.stringify(res).slice(0, 600));
```
跑一次对比，确认 `res` 是否含 `radarA` / `radarB`（两个雷达对象）或 `dims` 数组。若只有 `dims`，在 setData 前转换：
```js
if (!res.radarA && res.dims) {
  const keys = ['headForward','roundShoulder','pelvicTilt','kneeExtension','spinalCurvature','shoulderHeight','legAlignment','coreStability'];
  const toRadar = (arr) => { const o = {}; arr.forEach((d, i) => o[keys[i]] = d.before ?? d.score ?? 0); return o; };
  // 视实际字段调整
}
```
确认后删除临时日志。

- [ ] **Step 2: 重写 wxml（对比结果区）**

`compare/index.wxml` 的 `wx:if="{{compareResult}}"` block 替换为：
```xml
<view wx:if="{{compareResult}}" class="compare-result animate-fade-in">
  <view class="section-title">评分变化</view>
  <view class="card-flat score-change-card">
    <text class="score-change-value {{compareResult.scoreChange >= 0 ? 'text-brand' : 'text-warn'}}">
      {{compareResult.scoreChange >= 0 ? '+' : ''}}{{compareResult.scoreChange}}
    </text>
    <text class="score-change-from">{{compareResult.scoreA}} → {{compareResult.scoreB}}</text>
  </view>

  <view class="section-title">维度对比</view>
  <view class="radar-wrap">
    <kb-radar mode="compare" size="{{260}}" data="{{compareResult.radarB}}" prevData="{{compareResult.radarA}}" />
  </view>

  <view class="section-title">维度变化</view>
  <view class="card-flat dim-change-card">
    <view class="dim-change-row" wx:for="{{compareResult.dims}}" wx:key="name">
      <image class="dim-change-icon" src="/assets/icons/body-{{item.iconKey}}.svg" mode="aspectFit" />
      <text class="dim-change-name">{{item.name}}</text>
      <text class="dim-change-from">{{item.before}}→{{item.after}}</text>
      <text class="dim-change-delta {{item.change >= 0 ? 'text-brand' : 'text-warn'}}">
        {{item.change >= 0 ? '↑' : '↓'}}{{item.change >= 0 ? '+' : ''}}{{item.change}}
      </text>
    </view>
  </view>

  <text class="compare-summary">{{compareResult.summary}}</text>
</view>
```

注意：`item.iconKey` 需后端返回或在 js 里映射。在 `onCompare` 成功后给 dims 加 iconKey：
```js
const iconMap = { '头前伸':'headforward','圆肩':'roundshoulder','骨盆前倾':'pelvictilt','膝超伸':'kneeextension','脊柱侧弯':'spinal','高低肩':'shoulderheight','XO型腿':'leg','核心稳定':'core' };
if (res.dims) res.dims = res.dims.map(d => ({ ...d, iconKey: iconMap[d.name] || 'core' }));
```

- [ ] **Step 3: 重写 wxss**

`compare/index.wxss` 全部替换为：
```css
/* subpkg/history/compare/index.wxss */
.page-container { min-height: 100vh; background: var(--bg); padding: 0 var(--sp-4) env(safe-area-inset-bottom); }
.score-change-card { text-align: center; }
.score-change-value { font-size: var(--fs-display); font-weight: 600; display: block; line-height: 1.1; font-variant-numeric: tabular-nums; }
.score-change-from { font-size: var(--fs-caption); color: var(--text-3); margin-top: var(--sp-1); display: block; }
.radar-wrap { display: flex; justify-content: center; padding: var(--sp-3) 0; }
.dim-change-row { display: flex; align-items: center; gap: var(--sp-2); padding: var(--sp-2) 0; border-bottom: 1rpx solid var(--line-soft); }
.dim-change-row:last-child { border-bottom: none; }
.dim-change-icon { width: 32rpx; height: 32rpx; }
.dim-change-name { flex: 1; font-size: var(--fs-body); color: var(--text-2); }
.dim-change-from { font-size: var(--fs-caption); color: var(--text-3); font-variant-numeric: tabular-nums; }
.dim-change-delta { font-size: var(--fs-caption); font-weight: 600; font-variant-numeric: tabular-nums; }
.compare-summary { font-size: var(--fs-caption); color: var(--text-2); line-height: 1.6; margin: var(--sp-3) 0; display: block; }
.compare-btn { margin: var(--sp-4) 0; }
```

- [ ] **Step 4: 验证**

选两条记录生成对比。
Expected: 评分变化大数字 + 双层雷达 + 维度变化列表(含体态图标)。

- [ ] **Step 5: Commit**

```bash
cd F:/su/KBjiaolian
git add miniprogram/subpkg/history/compare/
git commit -m "feat(page): 历史对比页重排 (双层雷达+维度变化列表)"
```

---

## Task 10: 登录页重排

**规格依据:** spec §7.4

**Files:**
- Modify: `miniprogram/subpkg/user/login/index.wxml`, `index.wxss`

- [ ] **Step 1: 重写 wxml**

`subpkg/user/login/index.wxml` 全部替换为：
```xml
<!--subpkg/user/login/index.wxml - 登录页（极简留白）-->
<view class="login-page">
  <view class="login-top">
    <view class="login-logo">
      <image src="/assets/icons/tab-exercises.svg" class="login-logo-icon" mode="aspectFit" />
    </view>
    <text class="login-title">KB 教练</text>
    <text class="login-tagline">Know Your Body</text>
    <text class="login-subtitle">AI 驱动的体态评估与康复矫正。拍一张照，看见自己的身体。</text>

    <button class="btn-primary login-wx-btn" bindtap="onWxLogin">
      <image src="/assets/icons/tab-chat.svg" class="login-wx-icon" mode="aspectFit" />
      微信一键登录
    </button>
  </view>

  <view class="login-features">
    <view class="login-feature">
      <image src="/assets/icons/tab-analyze.svg" class="login-feature-icon" mode="aspectFit" />
      <text>8 维度 AI 体态分析</text>
    </view>
    <view class="login-feature">
      <image src="/assets/icons/tab-plan.svg" class="login-feature-icon" mode="aspectFit" />
      <text>个性化训练方案</text>
    </view>
    <view class="login-feature">
      <image src="/assets/icons/tab-chat.svg" class="login-feature-icon" mode="aspectFit" />
      <text>24/7 AI 教练问答</text>
    </view>
  </view>

  <text class="login-terms">登录即同意《用户协议》与《隐私政策》</text>
</view>
```

- [ ] **Step 2: 重写 wxss**

`subpkg/user/login/index.wxss` 全部替换为：
```css
/* subpkg/user/login/index.wxss - 极简留白 */
.login-page { min-height: 100vh; background: var(--bg); display: flex; flex-direction: column; padding: 0 var(--sp-4) env(safe-area-inset-bottom); }
.login-top { flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: flex-start; padding-top: var(--sp-6); }
.login-logo { width: 80rpx; height: 80rpx; border-radius: var(--radius-sm); background: var(--brand); display: flex; align-items: center; justify-content: center; margin-bottom: var(--sp-4); }
.login-logo-icon { width: 44rpx; height: 44rpx; filter: brightness(0) invert(1); }
.login-title { font-size: 56rpx; font-weight: 600; color: var(--text-1); letter-spacing: 2rpx; }
.login-tagline { font-size: var(--fs-h2); color: var(--brand); font-weight: 600; margin-top: var(--sp-1); }
.login-subtitle { font-size: var(--fs-body); color: var(--text-2); line-height: 1.6; margin-top: var(--sp-3); max-width: 560rpx; }
.login-wx-btn { margin-top: var(--sp-5); display: flex; align-items: center; justify-content: center; gap: var(--sp-2); }
.login-wx-icon { width: 32rpx; height: 32rpx; filter: brightness(0) invert(1); }

.login-features { padding-bottom: var(--sp-4); display: flex; flex-direction: column; gap: var(--sp-2); }
.login-feature { display: flex; align-items: center; gap: var(--sp-2); }
.login-feature-icon { width: 32rpx; height: 32rpx; }
.login-feature text { font-size: var(--fs-caption); color: var(--text-2); }
.login-terms { font-size: var(--fs-label); color: var(--text-3); text-align: center; margin: var(--sp-3) 0 var(--sp-4); line-height: 1.5; }
```

注意：`filter: brightness(0) invert(1)` 把 svg 染成白色（logo/wx 图标在 teal 背景上）。特性图标不染色（保持 currentColor 默认黑，但 svg currentColor 在 image 标签下默认为黑——可接受，或加 filter 染 teal）。给特性图标也染 teal：在 wxss 加
```css
.login-feature-icon { filter: invert(29%) sepia(60%) saturate(1400%) hue-rotate(140deg); }
```

- [ ] **Step 3: 验证**

预览登录页。
Expected: 大留白、teal logo 方 + 白图标、单按钮、3 条特性、协议小字。无渐变 banner。

- [ ] **Step 4: Commit**

```bash
cd F:/su/KBjiaolian
git add miniprogram/subpkg/user/login/
git commit -m "feat(page): 登录页重排 (极简留白, 砍掉渐变banner)"
```

---

## Task 11: 全局验收 + 清理

**规格依据:** spec §10（验收标准）

- [ ] **Step 1: 全局搜硬编码颜色**

```bash
cd F:/su/KBjiaolian/miniprogram
grep -rn "#22c55e\|#16a34a\|#dcfce7\|#f0fdf4" pages subpkg app.wxss 2>&1 || echo "无残留草绿"
```
Expected: 无残留草绿色硬编码。

- [ ] **Step 2: 全局搜文字字符占位图标**

```bash
cd F:/su/KBjiaolian/miniprogram
grep -rn '>○<\|>!<\|>📝<' pages subpkg 2>&1 || echo "无字符占位"
```
Expected: 无 `○`/`!`/emoji 字符占位。

- [ ] **Step 3: 全局搜 emoji**

```bash
cd F:/su/KBjiaolian/miniprogram
grep -rPn "[\x{1F300}-\x{1FAFF}]" pages subpkg 2>&1 || echo "无emoji"
```
Expected: 无 emoji。

- [ ] **Step 4: 走查 4 屏**

开发者工具逐屏预览首页/分析结果/对比/登录，对照 spec §7 检查：
- 主色为深 teal #0f766e
- section 间距 ≥48rpx
- 图标全线性 svg
- 雷达图正确（result 含问题点橙环，compare 双层）
- `--accent-warn` 仅出现在问题点/不达标

- [ ] **Step 5: 清理多余文件**

删除旧 tab PNG 图标（已被 svg 取代）：
```bash
cd F:/su/KBjiaolian
git rm miniprogram/assets/icons/home.png miniprogram/assets/icons/home-active.png \
  miniprogram/assets/icons/analyze.png miniprogram/assets/icons/analyze-active.png \
  miniprogram/assets/icons/plan.png miniprogram/assets/icons/plan-active.png \
  miniprogram/assets/icons/chat.png miniprogram/assets/icons/chat-active.png \
  miniprogram/assets/icons/exercises.png miniprogram/assets/icons/exercises-active.png 2>&1 || echo "部分已删"
```
注意：app.json 的 tabBar 仍引用 PNG（小程序 tabBar 不支持 svg）。所以**保留 tabBar 用的 PNG**，不要删！撤销上一步，改为只删未被引用的旧 svg（如 icon-analyze-w.svg 等已被新 tab-*.svg 取代）：
```bash
cd F:/su/KBjiaolian
git rm miniprogram/assets/icons/icon-analyze.svg miniprogram/assets/icons/icon-analyze-w.svg \
  miniprogram/assets/icons/icon-chat.svg miniprogram/assets/icons/icon-chat-w.svg \
  miniprogram/assets/icons/icon-exercises.svg miniprogram/assets/icons/icon-exercises-w.svg \
  miniprogram/assets/icons/icon-plan.svg miniprogram/assets/icons/icon-plan-w.svg \
  miniprogram/assets/icons/icon-nutrition.svg miniprogram/assets/icons/icon-nutrition-w.svg 2>&1 || echo "部分已删"
```
（这些是旧 features-grid/quickActions 用的 svg，已被新 tab-*.svg 取代。）

- [ ] **Step 6: 最终 Commit**

```bash
cd F:/su/KBjiaolian
git add -A
git commit -m "chore: 清理旧图标 svg, 全局验收通过"
```

---

## 完成定义

- [ ] 4 个自定义组件（kb-radar/kb-score/kb-quota/kb-empty）可用
- [ ] app.wxss token 系统，页面颜色无硬编码草绿
- [ ] 4 屏按 spec §7 重排
- [ ] 26 个统一 svg 图标
- [ ] 雷达图两变体正确
- [ ] 无 emoji/字符占位
- [ ] `--accent-warn` 仅用于问题点
