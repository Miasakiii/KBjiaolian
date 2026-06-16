'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardStats from '@/components/DashboardStats';
import QuickActions from '@/components/QuickActions';
import TodayTasks from '@/components/TodayTasks';
import RecentActivity from '@/components/RecentActivity';
import { getDashboardData, DashboardData } from '@/lib/dashboard';

export default function HomePage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const loadData = async () => {
      const dashboardData = await getDashboardData();
      setData(dashboardData);
    };
    loadData();

    const hour = new Date().getHours();
    if (hour < 6) setGreeting('夜深了');
    else if (hour < 12) setGreeting('早上好');
    else if (hour < 18) setGreeting('下午好');
    else setGreeting('晚上好');
  }, []);

  if (!data) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100">
      {/* 头部欢迎区域 */}
      <header className="pt-12 pb-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/30">
              <span className="text-3xl">💪</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-primary-800">{greeting}！</h1>
              <p className="text-primary-600">欢迎使用 KB教练</p>
            </div>
          </div>

          {/* 每日一言 */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-primary-200/50 p-4 mb-6">
            <p className="text-primary-700 text-center italic">
              "坚持训练，你会看到改变。"
            </p>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 pb-12 space-y-8">
        {/* 数据统计 */}
        <section>
          <DashboardStats
            latestScore={data.latestScore}
            scoreTrend={data.scoreTrend}
            workoutStats={data.workoutStats}
            nutrition={data.nutrition}
          />
        </section>

        {/* 快捷操作 */}
        <section>
          <h2 className="text-lg font-semibold text-primary-800 mb-4">快捷操作</h2>
          <QuickActions />
        </section>

        {/* 今日任务和最近活动 */}
        <div className="grid md:grid-cols-2 gap-8">
          <section>
            <TodayTasks tasks={data.todayTasks} />
          </section>
          <section>
            <RecentActivity activities={data.recentActivities} />
          </section>
        </div>

        {/* 更多功能 */}
        <section>
          <h2 className="text-lg font-semibold text-primary-800 mb-4">更多功能</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/plans" className="block">
              <div className="bg-white/60 rounded-xl p-4 text-center hover:bg-white/80 transition-all">
                <span className="text-2xl">📋</span>
                <div className="text-sm text-primary-700 mt-2">训练方案</div>
              </div>
            </Link>
            <Link href="/compare" className="block">
              <div className="bg-white/60 rounded-xl p-4 text-center hover:bg-white/80 transition-all">
                <span className="text-2xl">📊</span>
                <div className="text-sm text-primary-700 mt-2">进度对比</div>
              </div>
            </Link>
            <Link href="/workouts" className="block">
              <div className="bg-white/60 rounded-xl p-4 text-center hover:bg-white/80 transition-all">
                <span className="text-2xl">🏃</span>
                <div className="text-sm text-primary-700 mt-2">训练记录</div>
              </div>
            </Link>
            <Link href="/nutrition/history" className="block">
              <div className="bg-white/60 rounded-xl p-4 text-center hover:bg-white/80 transition-all">
                <span className="text-2xl">🍽️</span>
                <div className="text-sm text-primary-700 mt-2">饮食历史</div>
              </div>
            </Link>
            <Link href="/progress" className="block">
              <div className="bg-white/60 rounded-xl p-4 text-center hover:bg-white/80 transition-all">
                <span className="text-2xl">📈</span>
                <div className="text-sm text-primary-700 mt-2">进度趋势</div>
              </div>
            </Link>
            <Link href="/export" className="block">
              <div className="bg-white/60 rounded-xl p-4 text-center hover:bg-white/80 transition-all">
                <span className="text-2xl">📤</span>
                <div className="text-sm text-primary-700 mt-2">数据导出</div>
              </div>
            </Link>
            <Link href="/settings" className="block">
              <div className="bg-white/60 rounded-xl p-4 text-center hover:bg-white/80 transition-all">
                <span className="text-2xl">⚙️</span>
                <div className="text-sm text-primary-700 mt-2">个人设置</div>
              </div>
            </Link>
            <Link href="/about" className="block">
              <div className="bg-white/60 rounded-xl p-4 text-center hover:bg-white/80 transition-all">
                <span className="text-2xl">ℹ️</span>
                <div className="text-sm text-primary-700 mt-2">关于</div>
              </div>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
