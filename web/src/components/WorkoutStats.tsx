'use client';

import { WorkoutStats as StatsType } from '@/types/workout';

interface WorkoutStatsProps {
  stats: StatsType;
}

export default function WorkoutStats({ stats }: WorkoutStatsProps) {
  const items = [
    {
      label: '本周训练',
      value: stats.thisWeekWorkouts,
      unit: '次',
      icon: '📅',
      color: 'bg-blue-100 text-blue-700',
    },
    {
      label: '本月训练',
      value: stats.thisMonthWorkouts,
      unit: '次',
      icon: '📊',
      color: 'bg-green-100 text-green-700',
    },
    {
      label: '连续天数',
      value: stats.currentStreak,
      unit: '天',
      icon: '🔥',
      color: 'bg-orange-100 text-orange-700',
    },
    {
      label: '总训练时长',
      value: stats.totalDuration >= 60
        ? Math.round(stats.totalDuration / 60)
        : stats.totalDuration,
      unit: stats.totalDuration >= 60 ? '小时' : '分钟',
      icon: '⏱️',
      color: 'bg-purple-100 text-purple-700',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="bg-white/80 backdrop-blur-sm rounded-2xl border border-primary-200/50 p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{item.icon}</span>
            <span className="text-sm text-primary-500">{item.label}</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-primary-800">{item.value}</span>
            <span className="text-sm text-primary-500">{item.unit}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
