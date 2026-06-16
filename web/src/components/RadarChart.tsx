'use client';

import { useEffect, useState } from 'react';

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
  const [isVisible, setIsVisible] = useState(false);
  const [animProgress, setAnimProgress] = useState(0);

  useEffect(() => {
    setIsVisible(true);
    const duration = 600;
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

  const size = 200;
  const center = size / 2;
  const radius = 80;

  const getPoint = (index: number, value: number) => {
    const angle = (Math.PI * 2 * index) / 4 - Math.PI / 2;
    const r = (value / 100) * radius * animProgress;
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
    <div className={`flex flex-col items-center transition-all duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
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
        <polygon
          points={points}
          fill="rgba(22, 163, 74, 0.2)"
          stroke="#16a34a"
          strokeWidth="2"
          style={{ transition: 'all 0.1s ease-out' }}
        />
        {/* 数据点 */}
        {labels.map((l, i) => {
          const p = getPoint(i, data[l.key as keyof typeof data]);
          return (
            <circle
              key={l.key}
              cx={p.x}
              cy={p.y}
              r="4"
              fill="#16a34a"
              style={{ transition: 'all 0.1s ease-out' }}
            />
          );
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
