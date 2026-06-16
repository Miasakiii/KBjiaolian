# KB教练 — Web 拍照分析页实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建 KB教练 Web 端拍照分析 MVP 页面，支持上传照片、展示 AI 体态分析结果。

**Architecture:** Next.js 14 App Router + Tailwind CSS，单页面应用。左侧上传区，右侧可折叠结果面板。Mock 数据延迟返回模拟分析结果。

**Tech Stack:** Next.js 14, React 18, Tailwind CSS 3, TypeScript

---

## 文件结构

```
web/
├── src/
│   └── app/
│       ├── layout.tsx              # 根布局，引入全局样式
│       ├── page.tsx                # 首页，重定向到 /analyze
│       ├── globals.css             # Tailwind 指令 + 全局样式
│       └── analyze/
│           └── page.tsx            # 拍照分析页主组件
├── src/
│   └── components/
│       ├── PhotoUpload.tsx         # 照片上传组件
│       ├── ResultPanel.tsx         # 结果面板容器
│       ├── ScoreCard.tsx           # 评分展示
│       ├── RadarChart.tsx          # 雷达图（纯 CSS）
│       └── SuggestionList.tsx      # 建议方案列表
├── src/
│   └── types/
│       └── analysis.ts            # 类型定义
├── src/
│   └── data/
│       └── mock-result.ts         # Mock 数据
├── public/
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
├── next.config.js
└── package.json
```

---

## Task 1: 初始化 Next.js 项目

**Files:**
- Create: `web/package.json`
- Create: `web/next.config.js`
- Create: `web/tsconfig.json`
- Create: `web/tailwind.config.js`
- Create: `web/postcss.config.js`
- Create: `web/src/app/globals.css`
- Create: `web/src/app/layout.tsx`
- Create: `web/src/app/page.tsx`

- [ ] **Step 1: 创建 package.json**

```json
{
  "name": "kb-coach-web",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "next": "14.2.18",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@types/node": "^20.14.0",
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.38",
    "tailwindcss": "^3.4.4",
    "typescript": "^5.4.5"
  }
}
```

- [ ] **Step 2: 创建 next.config.js**

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {};
module.exports = nextConfig;
```

- [ ] **Step 3: 创建 tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 4: 创建 tailwind.config.js**

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
      },
    },
  },
  plugins: [],
};
```

- [ ] **Step 5: 创建 postcss.config.js**

```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

- [ ] **Step 6: 创建 globals.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  font-family: system-ui, -apple-system, sans-serif;
}
```

- [ ] **Step 7: 创建 layout.tsx**

```tsx
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'KB教练 — AI 体态分析',
  description: '拍照分析体态，获取个性化训练方案',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="bg-primary-50 min-h-screen">{children}</body>
    </html>
  );
}
```

- [ ] **Step 8: 创建 page.tsx（首页重定向）**

```tsx
import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/analyze');
}
```

- [ ] **Step 9: 安装依赖并验证**

Run: `cd web && npm install && npm run build`
Expected: 构建成功，无错误

- [ ] **Step 10: 提交**

```bash
git add web/
git commit -m "feat: initialize Next.js project with Tailwind CSS"
```

---

## Task 2: 类型定义和 Mock 数据

**Files:**
- Create: `web/src/types/analysis.ts`
- Create: `web/src/data/mock-result.ts`

- [ ] **Step 1: 创建类型定义**

```typescript
export interface AnalysisResult {
  score: number;
  issues: Issue[];
  radar: RadarData;
  suggestions: Suggestion[];
}

export interface Issue {
  name: string;
  severity: 'mild' | 'moderate' | 'severe';
}

export interface RadarData {
  headForward: number;
  roundShoulder: number;
  pelvicTilt: number;
  kneeExtension: number;
}

export interface Suggestion {
  exercise: string;
  sets: string;
  description: string;
}
```

- [ ] **Step 2: 创建 Mock 数据**

```typescript
import { AnalysisResult } from '@/types/analysis';

export const mockResult: AnalysisResult = {
  score: 72,
  issues: [
    { name: '圆肩', severity: 'moderate' },
    { name: '头前伸', severity: 'mild' },
  ],
  radar: {
    headForward: 65,
    roundShoulder: 45,
    pelvicTilt: 78,
    kneeExtension: 82,
  },
  suggestions: [
    {
      exercise: '靠墙天使',
      sets: '3组 × 15次',
      description: '背靠墙站立，手臂贴墙上下滑动，改善圆肩',
    },
    {
      exercise: '颈部后缩',
      sets: '3组 × 12次',
      description: '收下巴向后推，强化深层颈屈肌',
    },
    {
      exercise: '臀桥',
      sets: '3组 × 15次',
      description: '仰卧屈膝抬臀，激活臀肌改善骨盆前倾',
    },
  ],
};
```

- [ ] **Step 3: 提交**

```bash
git add web/src/types/ web/src/data/
git commit -m "feat: add analysis types and mock data"
```

---

## Task 3: PhotoUpload 上传组件

**Files:**
- Create: `web/src/components/PhotoUpload.tsx`

- [ ] **Step 1: 创建 PhotoUpload 组件**

```tsx
'use client';

import { useCallback, useState, DragEvent } from 'react';

interface PhotoUploadProps {
  onUpload: (file: File) => void;
  isAnalyzing: boolean;
}

export default function PhotoUpload({ onUpload, isAnalyzing }: PhotoUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    onUpload(file);
  }, [onUpload]);

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleClick = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) handleFile(file);
    };
    input.click();
  }, [handleFile]);

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={handleClick}
      className={`
        h-full flex flex-col items-center justify-center
        border-2 border-dashed rounded-xl p-8
        cursor-pointer transition-all duration-200
        ${isDragging
          ? 'border-primary-500 bg-primary-100'
          : 'border-primary-300 bg-white hover:border-primary-400 hover:bg-primary-50'}
        ${isAnalyzing ? 'opacity-60 pointer-events-none' : ''}
      `}
    >
      {preview ? (
        <img src={preview} alt="上传的照片" className="max-h-64 rounded-lg object-contain" />
      ) : (
        <>
          <div className="text-5xl mb-4">📷</div>
          <p className="text-primary-800 font-medium text-lg">点击或拖拽上传照片</p>
          <p className="text-primary-600 text-sm mt-2">支持 JPG、PNG 格式</p>
        </>
      )}
      {isAnalyzing && (
        <div className="mt-4 flex items-center gap-2 text-primary-600">
          <div className="w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
          <span>分析中...</span>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: 提交**

```bash
git add web/src/components/PhotoUpload.tsx
git commit -m "feat: add PhotoUpload component with drag-and-drop"
```

---

## Task 4: ScoreCard 评分组件

**Files:**
- Create: `web/src/components/ScoreCard.tsx`

- [ ] **Step 1: 创建 ScoreCard 组件**

```tsx
interface ScoreCardProps {
  score: number;
  issues: { name: string; severity: string }[];
}

const severityColor = {
  mild: 'bg-yellow-100 text-yellow-800',
  moderate: 'bg-orange-100 text-orange-800',
  severe: 'bg-red-100 text-red-800',
};

export default function ScoreCard({ score, issues }: ScoreCardProps) {
  const scoreColor = score >= 80 ? 'text-primary-600' : score >= 60 ? 'text-orange-500' : 'text-red-500';

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-primary-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-primary-800 font-semibold">体态评分</h3>
        <span className={`text-3xl font-bold ${scoreColor}`}>{score}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {issues.map((issue) => (
          <span
            key={issue.name}
            className={`px-3 py-1 rounded-full text-sm font-medium ${severityColor[issue.severity as keyof typeof severityColor]}`}
          >
            {issue.name}
          </span>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 提交**

```bash
git add web/src/components/ScoreCard.tsx
git commit -m "feat: add ScoreCard component"
```

---

## Task 5: RadarChart 雷达图组件

**Files:**
- Create: `web/src/components/RadarChart.tsx`

- [ ] **Step 1: 创建 RadarChart 组件（纯 CSS）**

```tsx
interface RadarChartProps {
  data: {
    headForward: number;
    roundShoulder: number;
    pelvicTilt: number;
    kneeExtension: number;
  };
}

const labels = [
  { key: 'headForward', label: '头前伸' },
  { key: 'roundShoulder', label: '圆肩' },
  { key: 'pelvicTilt', label: '骨盆前倾' },
  { key: 'kneeExtension', label: '膝超伸' },
];

export default function RadarChart({ data }: RadarChartProps) {
  const size = 200;
  const center = size / 2;
  const radius = 80;

  const getPoint = (index: number, value: number) => {
    const angle = (Math.PI * 2 * index) / 4 - Math.PI / 2;
    const r = (value / 100) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  const points = labels
    .map((l, i) => {
      const p = getPoint(i, data[l.key as keyof typeof data]);
      return `${p.x},${p.y}`;
    })
    .join(' ');

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* 背景网格 */}
        {[0.25, 0.5, 0.75, 1].map((scale) => (
          <polygon
            key={scale}
            points={[0, 1, 2, 3]
              .map((i) => {
                const angle = (Math.PI * 2 * i) / 4 - Math.PI / 2;
                return `${center + radius * scale * Math.cos(angle)},${center + radius * scale * Math.sin(angle)}`;
              })
              .join(' ')}
            fill="none"
            stroke="#dcfce7"
            strokeWidth="1"
          />
        ))}
        {/* 轴线 */}
        {[0, 1, 2, 3].map((i) => {
          const angle = (Math.PI * 2 * i) / 4 - Math.PI / 2;
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={center + radius * Math.cos(angle)}
              y2={center + radius * Math.sin(angle)}
              stroke="#dcfce7"
              strokeWidth="1"
            />
          );
        })}
        {/* 数据区域 */}
        <polygon points={points} fill="rgba(22, 163, 74, 0.2)" stroke="#16a34a" strokeWidth="2" />
        {/* 数据点 */}
        {labels.map((l, i) => {
          const p = getPoint(i, data[l.key as keyof typeof data]);
          return <circle key={l.key} cx={p.x} cy={p.y} r="4" fill="#16a34a" />;
        })}
      </svg>
      {/* 标签 */}
      <div className="flex justify-between w-full mt-4 px-4">
        {labels.map((l) => (
          <div key={l.key} className="text-center">
            <div className="text-xs text-primary-600">{l.label}</div>
            <div className="text-sm font-semibold text-primary-800">{data[l.key as keyof typeof data]}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 提交**

```bash
git add web/src/components/RadarChart.tsx
git commit -m "feat: add RadarChart component with pure CSS/SVG"
```

---

## Task 6: SuggestionList 建议列表组件

**Files:**
- Create: `web/src/components/SuggestionList.tsx`

- [ ] **Step 1: 创建 SuggestionList 组件**

```tsx
interface Suggestion {
  exercise: string;
  sets: string;
  description: string;
}

interface SuggestionListProps {
  suggestions: Suggestion[];
}

export default function SuggestionList({ suggestions }: SuggestionListProps) {
  return (
    <div className="space-y-3">
      <h4 className="text-primary-800 font-semibold text-sm">建议方案</h4>
      {suggestions.map((s, i) => (
        <div key={i} className="bg-primary-50 rounded-lg p-3 border border-primary-200">
          <div className="flex justify-between items-center mb-1">
            <span className="font-medium text-primary-800">{s.exercise}</span>
            <span className="text-xs text-primary-600 bg-primary-100 px-2 py-0.5 rounded">{s.sets}</span>
          </div>
          <p className="text-sm text-primary-700">{s.description}</p>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: 提交**

```bash
git add web/src/components/SuggestionList.tsx
git commit -m "feat: add SuggestionList component"
```

---

## Task 7: ResultPanel 结果面板组件

**Files:**
- Create: `web/src/components/ResultPanel.tsx`

- [ ] **Step 1: 创建 ResultPanel 组件**

```tsx
'use client';

import { useState } from 'react';
import { AnalysisResult } from '@/types/analysis';
import ScoreCard from './ScoreCard';
import RadarChart from './RadarChart';
import SuggestionList from './SuggestionList';

interface ResultPanelProps {
  result: AnalysisResult | null;
  isAnalyzing: boolean;
}

export default function ResultPanel({ result, isAnalyzing }: ResultPanelProps) {
  const [expanded, setExpanded] = useState(false);

  if (isAnalyzing) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-white rounded-xl border border-primary-200 p-8">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-primary-700 font-medium">AI 正在分析您的体态...</p>
        <p className="text-primary-500 text-sm mt-1">通常需要 3-5 秒</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-white rounded-xl border border-primary-200 p-8 text-center">
        <div className="text-5xl mb-4">📊</div>
        <p className="text-primary-700 font-medium">等待上传照片</p>
        <p className="text-primary-500 text-sm mt-1">上传后 AI 将自动分析体态</p>
      </div>
    );
  }

  return (
    <div className="h-full bg-white rounded-xl border border-primary-200 p-6 overflow-y-auto">
      <ScoreCard score={result.score} issues={result.issues} />

      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full mt-4 py-2 text-primary-600 text-sm font-medium hover:bg-primary-50 rounded-lg transition-colors flex items-center justify-center gap-1"
      >
        <span>{expanded ? '收起详细分析' : '查看详细分析'}</span>
        <span className={`transition-transform ${expanded ? 'rotate-180' : ''}`}>▼</span>
      </button>

      {expanded && (
        <div className="mt-4 space-y-6 animate-in slide-in-from-top-2">
          <RadarChart data={result.radar} />
          <SuggestionList suggestions={result.suggestions} />
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: 提交**

```bash
git add web/src/components/ResultPanel.tsx
git commit -m "feat: add ResultPanel with collapsible details"
```

---

## Task 8: analyze 页面主组件

**Files:**
- Create: `web/src/app/analyze/page.tsx`

- [ ] **Step 1: 创建 analyze 页面**

```tsx
'use client';

import { useState, useCallback } from 'react';
import PhotoUpload from '@/components/PhotoUpload';
import ResultPanel from '@/components/ResultPanel';
import { AnalysisResult } from '@/types/analysis';
import { mockResult } from '@/data/mock-result';

export default function AnalyzePage() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleUpload = useCallback(async (file: File) => {
    setIsAnalyzing(true);
    setResult(null);
    // Mock API 调用，延迟 1.5 秒
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setResult(mockResult);
    setIsAnalyzing(false);
  }, []);

  return (
    <main className="min-h-screen p-4 md:p-8">
      <header className="text-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-primary-800">KB教练</h1>
        <p className="text-primary-600 mt-1">AI 体态分析</p>
      </header>

      <div className="max-w-6xl mx-auto">
        {/* 桌面：左右分栏 */}
        <div className="hidden md:grid md:grid-cols-5 gap-6" style={{ minHeight: '70vh' }}>
          <div className="col-span-2">
            <PhotoUpload onUpload={handleUpload} isAnalyzing={isAnalyzing} />
          </div>
          <div className="col-span-3">
            <ResultPanel result={result} isAnalyzing={isAnalyzing} />
          </div>
        </div>

        {/* 移动：上下布局 */}
        <div className="md:hidden space-y-4">
          <div className="h-64">
            <PhotoUpload onUpload={handleUpload} isAnalyzing={isAnalyzing} />
          </div>
          <div className="min-h-96">
            <ResultPanel result={result} isAnalyzing={isAnalyzing} />
          </div>
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: 提交**

```bash
git add web/src/app/analyze/page.tsx
git commit -m "feat: add analyze page with responsive layout"
```

---

## Task 9: 验证和修复

**Files:**
- Modify: `web/src/app/globals.css` (if needed)

- [ ] **Step 1: 构建项目**

Run: `cd web && npm run build`
Expected: 构建成功，无错误

- [ ] **Step 2: 启动开发服务器**

Run: `cd web && npm run dev`
Expected: 服务器启动在 http://localhost:3000

- [ ] **Step 3: 手动验证**

在浏览器中访问 http://localhost:3000/analyze，验证：
1. 页面正确显示左右分栏
2. 点击上传区可以选择文件
3. 选择照片后显示预览和加载动画
4. 1.5 秒后显示分析结果
5. 评分和问题标签可见
6. 点击"查看详细分析"展开雷达图和建议
7. 再次点击可折叠
8. 缩小浏览器窗口到 768px 以下，布局切换为上下

- [ ] **Step 4: 修复问题（如有）**

根据验证结果修复发现的问题。

- [ ] **Step 5: 最终提交**

```bash
git add -A
git commit -m "fix: final adjustments for analyze page"
```
