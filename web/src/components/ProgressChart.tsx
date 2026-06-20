'use client';

import { useEffect, useState } from 'react';

interface DataPoint {
  date: string;
  value: number;
}

interface ProgressChartProps {
  data: DataPoint[];
  title: string;
  unit?: string;
  color?: string;
  height?: number;
}

export default function ProgressChart({
  data,
  title,
  unit = '',
  color = '#16a34a',
  height = 200,
}: ProgressChartProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  if (data.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-primary-200/50 p-6">
        <h3 className="font-semibold text-primary-800 mb-4">{title}</h3>
        <div className="flex items-center justify-center h-40">
          <p className="text-primary-500 text-sm">暂无数据</p>
        </div>
      </div>
    );
  }

  // 计算图表尺寸
  const padding = { top: 20, right: 20, bottom: 40, left: 50 };
  const chartWidth = 400;
  const chartHeight = height;
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  // 计算数据范围
  const values = data.map((d) => d.value);
  const minValue = Math.min(...values) * 0.9;
  const maxValue = Math.max(...values) * 1.1;
  const valueRange = maxValue - minValue || 1;

  // 计算点坐标
  const points = data.map((d, i) => ({
    x: padding.left + (i / (data.length - 1)) * innerWidth,
    y: padding.top + ((maxValue - d.value) / valueRange) * innerHeight,
  }));

  // 生成路径
  const linePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ');

  // 生成填充区域
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${padding.top + innerHeight} L ${points[0].x} ${padding.top + innerHeight} Z`;

  // 计算趋势
  const trend = data.length >= 2 ? data[data.length - 1].value - data[0].value : 0;

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-primary-200/50 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-primary-800">{title}</h3>
        {trend !== 0 && (
          <span className={`text-sm font-medium px-2 py-1 rounded-full ${
            trend > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend).toFixed(1)}{unit}
          </span>
        )}
      </div>

      <svg
        width="100%"
        height={height}
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        className={`transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      >
        {/* 网格线 */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = padding.top + ratio * innerHeight;
          const value = maxValue - ratio * valueRange;
          return (
            <g key={ratio}>
              <line
                x1={padding.left}
                y1={y}
                x2={padding.left + innerWidth}
                y2={y}
                stroke="#e5e7eb"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <text
                x={padding.left - 8}
                y={y + 4}
                textAnchor="end"
                className="text-[10px] fill-primary-400"
              >
                {value.toFixed(0)}
              </text>
            </g>
          );
        })}

        {/* X 轴标签 */}
        {data.map((d, i) => {
          const x = padding.left + (i / (data.length - 1)) * innerWidth;
          return (
            <text
              key={i}
              x={x}
              y={padding.top + innerHeight + 20}
              textAnchor="middle"
              className="text-[10px] fill-primary-400"
            >
              {d.date}
            </text>
          );
        })}

        {/* 填充区域 */}
        <path
          d={areaPath}
          fill={color}
          fillOpacity="0.1"
          className={`transition-all duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        />

        {/* 线条 */}
        <path
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-all duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
          style={{
            strokeDasharray: isVisible ? 'none' : '1000',
            strokeDashoffset: isVisible ? '0' : '1000',
          }}
        />

        {/* 数据点 */}
        {points.map((p, i) => (
          <g key={i}>
            <circle
              cx={p.x}
              cy={p.y}
              r="4"
              fill="white"
              stroke={color}
              strokeWidth="2"
              className={`transition-all duration-500 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}
              style={{ transitionDelay: `${i * 100}ms` }}
            />
            {/* 数值标签 */}
            <text
              x={p.x}
              y={p.y - 12}
              textAnchor="middle"
              className="text-[10px] font-medium fill-primary-700"
            >
              {data[i].value}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
