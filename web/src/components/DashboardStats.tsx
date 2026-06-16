'use client';

import Link from 'next/link';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: string;
  trend?: number;
  link: string;
  color: string;
}

function StatCard({ title, value, subtitle, icon, trend, link, color }: StatCardProps) {
  return (
    <Link href={link} className="block">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-primary-200/50 p-5 hover:shadow-lg hover:border-primary-300 transition-all">
        <div className="flex items-start justify-between mb-3">
          <span className="text-2xl">{icon}</span>
          {trend !== undefined && trend !== 0 && (
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
              trend > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}
            </span>
          )}
        </div>
        <div className="text-3xl font-bold text-primary-800 mb-1">{value}</div>
        <div className="text-sm text-primary-500">{title}</div>
        {subtitle && <div className="text-xs text-primary-400 mt-1">{subtitle}</div>}
      </div>
    </Link>
  );
}

interface DashboardStatsProps {
  latestScore: number | null;
  scoreTrend: number;
  workoutStats: {
    thisWeek: number;
    streak: number;
    total: number;
  };
  nutrition: {
    calories: number;
    caloriesGoal: number;
    protein: number;
    proteinGoal: number;
  };
}

export default function DashboardStats({
  latestScore,
  scoreTrend,
  workoutStats,
  nutrition,
}: DashboardStatsProps) {
  const caloriesPercent = Math.round((nutrition.calories / nutrition.caloriesGoal) * 100);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard
        title="体态评分"
        value={latestScore ?? '--'}
        subtitle={latestScore ? '最新评分' : '未测评'}
        icon="📊"
        trend={scoreTrend}
        link="/history"
        color="primary"
      />
      <StatCard
        title="本周训练"
        value={`${workoutStats.thisWeek}次`}
        subtitle={`连续 ${workoutStats.streak} 天`}
        icon="💪"
        link="/workouts"
        color="blue"
      />
      <StatCard
        title="今日热量"
        value={`${nutrition.calories}`}
        subtitle={`${caloriesPercent}% 目标`}
        icon="🍎"
        link="/nutrition"
        color="green"
      />
      <StatCard
        title="蛋白质"
        value={`${nutrition.protein}g`}
        subtitle={`${Math.round((nutrition.protein / nutrition.proteinGoal) * 100)}% 目标`}
        icon="🥩"
        link="/nutrition"
        color="orange"
      />
    </div>
  );
}
