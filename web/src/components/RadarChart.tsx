'use client';

import { useEffect, useState } from 'react';
import { RadarData } from '@/types/analysis';

interface RadarChartProps {
  data: RadarData;
  size?: number;
}

const labels: { key: keyof RadarData; label: string; short: string }[] = [
  { key: 'headForward', label: '头前伸', short: '头' },
  { key: 'roundShoulder', label: '圆肩', short: '肩' },
  { key: 'pelvicTilt', label: '骨盆前倾', short: '盆' },
  { key: 'kneeExtension', label: '膝超伸', short: '膝' },
  { key: 'spineCurve', label: '脊柱侧弯', short: '脊' },
  { key: 'shoulderHeight', label: '高低肩', short: '高' },
  { key: 'legAlignment', label: 'X/O型腿', short: '腿' },
  { key: 'coreStability', label: '核心稳定', short: '核' },
];

// 兼容旧的 4 维度数据
function ensureEightDimensions(data: Partial<RadarData>): RadarData {
  return {
    headForward: data.headForward ?? 0,
    roundShoulder: data.roundShoulder ?? 0,
    pelvicTilt: data.pelvicTilt ?? 0,
    kneeExtension: data.kneeExtension ?? 0,
    spineCurve: data.spineCurve ?? 0,
    shoulderHeight: data.shoulderHeight ?? 0,
    legAlignment: data.legAlignment ?? 0,
    coreStability: data.coreStability ?? 0,
  };
}

function getSeverityColor(value: number): string {
  if (value <= 20) return '#16a34a'; // 绿色-正常
  if (value <= 40) return '#eab308'; // 黄色-轻微
  if (value <= 60) return '#f97316'; // 橙色-中度
  return '#ef4444'; // 红色-严重
}

function getSeverityLabel(value: number): string {
  if (value <= 20) return '正常';
  if (value <= 40) return '轻微';
  if (value <= 60) return '中度';
  return '严重';
}

export default function RadarChart({ data: rawData, size = 240 }: RadarChartProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [animProgress, setAnimProgress] = useState(0);

  const data = ensureEightDimensions(rawData);
  const axisCount = labels.length;

  useEffect(() => {
    setIsVisible(true);
    const duration = 800;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimProgress(eased);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, []);

  const center = size / 2;
  const radius = size * 0.35;

  const getPoint = (index: number, value: number) => {
    const angle = (Math.PI * 2 * index) / axisCount - Math.PI / 2;
    const r = (value / 100) * radius * animProgress;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  const getAxisEnd = (index: number) => {
    const angle = (Math.PI * 2 * index) / axisCount - Math.PI / 2;
    return {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle),
    };
  };

  const points = labels
    .map((l, i) => {
      const p = getPoint(i, data[l.key]);
      return `${p.x},${p.y}`;
    })
    .join(' ');

  return (
    <div className={`flex flex-col items-center transition-all duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* 背景网格（5 层） */}
        {[0.2, 0.4, 0.6, 0.8, 1].map((scale) => (
          <polygon
            key={scale}
            points={labels
              .map((_, i) => {
                const axis = getAxisEnd(i);
                return `${center + (axis.x - center) * scale},${center + (axis.y - center) * scale}`;
              })
              .join(' ')}
            fill="none"
            stroke={scale === 1 ? '#d1d5db' : '#f3f4f6'}
            strokeWidth={scale === 1 ? 1.5 : 0.8}
          />
        ))}

        {/* 刻度线（40 分和 60 分阈值线） */}
        {[0.4, 0.6].map((scale) => (
          <polygon
            key={`threshold-${scale}`}
            points={labels
              .map((_, i) => {
                const axis = getAxisEnd(i);
                return `${center + (axis.x - center) * scale},${center + (axis.y - center) * scale}`;
              })
              .join(' ')}
            fill="none"
            stroke={scale === 0.6 ? '#fbbf24' : '#86efac'}
            strokeWidth="0.8"
            strokeDasharray="4,4"
            opacity={0.6}
          />
        ))}

        {/* 轴线 */}
        {labels.map((_, i) => {
          const end = getAxisEnd(i);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={end.x}
              y2={end.y}
              stroke="#e5e7eb"
              strokeWidth="0.8"
            />
          );
        })}

        {/* 数据区域 */}
        <polygon
          points={points}
          fill="rgba(22, 163, 74, 0.15)"
          stroke="#16a34a"
          strokeWidth="2"
          style={{ transition: 'all 0.1s ease-out' }}
        />

        {/* 数据点 */}
        {labels.map((l, i) => {
          const p = getPoint(i, data[l.key]);
          const color = getSeverityColor(data[l.key]);
          return (
            <g key={l.key}>
              <circle
                cx={p.x}
                cy={p.y}
                r="5"
                fill="white"
                stroke={color}
                strokeWidth="2.5"
                style={{ transition: 'all 0.1s ease-out' }}
              />
            </g>
          );
        })}

        {/* 外圈标签 */}
        {labels.map((l, i) => {
          const axis = getAxisEnd(i);
          const labelR = 1.15;
          const lx = center + (axis.x - center) * labelR;
          const ly = center + (axis.y - center) * labelR;
          const value = data[l.key];
          const color = getSeverityColor(value);

          return (
            <g key={`label-${l.key}`}>
              <text
                x={lx}
                y={ly - 6}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="10"
                fontWeight="600"
                fill="#374151"
              >
                {l.short}
              </text>
              <text
                x={lx}
                y={ly + 7}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="9"
                fill={color}
                fontWeight="700"
              >
                {value}
              </text>
            </g>
          );
        })}
      </svg>

      {/* 底部图例 */}
      <div className="grid grid-cols-4 gap-x-3 gap-y-1 mt-3 text-xs">
        {labels.map((l) => {
          const value = data[l.key];
          const color = getSeverityColor(value);
          return (
            <div key={l.key} className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
              <span className="text-gray-600 truncate">{l.label}</span>
              <span className="font-semibold" style={{ color }}>{value}</span>
            </div>
          );
        })}
      </div>

      {/* 图例说明 */}
      <div className="flex gap-3 mt-2 text-xs text-gray-400">
        <span>🟢 正常</span>
        <span>🟡 轻微</span>
        <span>🟠 中度</span>
        <span>🔴 严重</span>
      </div>
    </div>
  );
}
