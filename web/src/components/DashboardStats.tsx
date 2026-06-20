'use client';

import Link from 'next/link';
import { BarChart3, Dumbbell, Apple, Beef, TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: number;
  link: string;
}

function StatCard({ title, value, subtitle, icon, trend, link }: StatCardProps) {
  return (
    <Link href={link} className="block">
      <div className="bg-white rounded-2xl border border-primary-200 p-5 hover:shadow-sm transition-all">
        <div className="flex items-start justify-between mb-3">
          <span className="text-primary-400">{icon}</span>
          {trend !== undefined && trend !== 0 && (
            <span className={`text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1 ${
              trend > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
            }`}>
              {trend > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {Math.abs(trend)}
            </span>
          )}
        </div>
        <div className="text-2xl font-bold text-primary-800 mb-1">{value}</div>
        <div className="text-sm text-primary-400">{title}</div>
        {subtitle && <div className="text-xs text-primary-300 mt-1">{subtitle}</div>}
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
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <StatCard
        title="体态评分"
        value={latestScore ?? '--'}
        subtitle={latestScore ? '最新评分' : '未测评'}
        icon={<BarChart3 size={20} />}
        trend={scoreTrend}
        link="/history"
      />
      <StatCard
        title="本周训练"
        value={`${workoutStats.thisWeek}次`}
        subtitle={`连续 ${workoutStats.streak} 天`}
        icon={<Dumbbell size={20} />}
        link="/workouts"
      />
      <StatCard
        title="今日热量"
        value={`${nutrition.calories}`}
        subtitle={`${caloriesPercent}% 目标`}
        icon={<Apple size={20} />}
        link="/nutrition"
      />
      <StatCard
        title="蛋白质"
        value={`${nutrition.protein}g`}
        subtitle={`${Math.round((nutrition.protein / nutrition.proteinGoal) * 100)}% 目标`}
        icon={<Beef size={20} />}
        link="/nutrition"
      />
    </div>
  );
}
