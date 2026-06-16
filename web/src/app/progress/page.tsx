'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ProgressChart from '@/components/ProgressChart';
import { getAllRecords } from '@/lib/storage';
import { getAllWorkouts } from '@/lib/workoutStorage';

interface ChartData {
  date: string;
  value: number;
}

export default function ProgressPage() {
  const [scoreData, setScoreData] = useState<ChartData[]>([]);
  const [radarData, setRadarData] = useState<{
    headForward: ChartData[];
    roundShoulder: ChartData[];
    pelvicTilt: ChartData[];
    kneeExtension: ChartData[];
  }>({
    headForward: [],
    roundShoulder: [],
    pelvicTilt: [],
    kneeExtension: [],
  });
  const [workoutData, setWorkoutData] = useState<ChartData[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const analysisRecords = await getAllRecords();
    const workoutRecords = await getAllWorkouts();

    // 评分趋势
    const scoreTrend = analysisRecords
      .reverse()
      .slice(-10)
      .map((r) => ({
        date: new Date(r.timestamp).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
        value: r.result.score,
      }));
    setScoreData(scoreTrend);

    // 雷达图数据趋势
    const radarTrend = {
      headForward: [] as ChartData[],
      roundShoulder: [] as ChartData[],
      pelvicTilt: [] as ChartData[],
      kneeExtension: [] as ChartData[],
    };

    analysisRecords.slice(-10).forEach((r) => {
      const date = new Date(r.timestamp).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
      radarTrend.headForward.push({ date, value: r.result.radar.headForward });
      radarTrend.roundShoulder.push({ date, value: r.result.radar.roundShoulder });
      radarTrend.pelvicTilt.push({ date, value: r.result.radar.pelvicTilt });
      radarTrend.kneeExtension.push({ date, value: r.result.radar.kneeExtension });
    });
    setRadarData(radarTrend);

    // 训练次数趋势（按周统计）
    const workoutByWeek = new Map<string, number>();
    workoutRecords.forEach((r) => {
      const date = new Date(r.createdAt);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
      workoutByWeek.set(weekKey, (workoutByWeek.get(weekKey) || 0) + 1);
    });

    const workoutTrend = Array.from(workoutByWeek.entries())
      .slice(-8)
      .map(([date, count]) => ({ date, value: count }));
    setWorkoutData(workoutTrend);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100">
      <header className="text-center pt-12 pb-8">
        <div className="inline-flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/30">
            <span className="text-2xl">📈</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary-700 to-primary-500 bg-clip-text text-transparent">进度趋势</h1>
        </div>
        <p className="text-primary-600 text-lg">查看你的体态变化和训练进度</p>
      </header>

      <div className="max-w-4xl mx-auto px-4 pb-12">
        {/* 返回按钮 */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 text-primary-600 hover:text-primary-700 font-medium"
          >
            ← 返回首页
          </Link>
        </div>

        <div className="space-y-8">
          {/* 体态评分趋势 */}
          <section>
            <h2 className="text-lg font-semibold text-primary-800 mb-4">体态评分趋势</h2>
            <ProgressChart
              data={scoreData}
              title="综合评分"
              unit="分"
              color="#16a34a"
              height={200}
            />
          </section>

          {/* 体态问题趋势 */}
          <section>
            <h2 className="text-lg font-semibold text-primary-800 mb-4">体态问题趋势</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <ProgressChart
                data={radarData.headForward}
                title="头前伸"
                unit="%"
                color="#f59e0b"
                height={150}
              />
              <ProgressChart
                data={radarData.roundShoulder}
                title="圆肩"
                unit="%"
                color="#ef4444"
                height={150}
              />
              <ProgressChart
                data={radarData.pelvicTilt}
                title="骨盆前倾"
                unit="%"
                color="#8b5cf6"
                height={150}
              />
              <ProgressChart
                data={radarData.kneeExtension}
                title="膝超伸"
                unit="%"
                color="#06b6d4"
                height={150}
              />
            </div>
          </section>

          {/* 训练次数趋势 */}
          <section>
            <h2 className="text-lg font-semibold text-primary-800 mb-4">训练次数趋势</h2>
            <ProgressChart
              data={workoutData}
              title="每周训练次数"
              unit="次"
              color="#3b82f6"
              height={200}
            />
          </section>

          {/* 提示 */}
          {scoreData.length === 0 && workoutData.length === 0 && (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">📊</span>
              </div>
              <h2 className="text-xl font-semibold text-primary-800 mb-2">暂无数据</h2>
              <p className="text-primary-500 mb-6">完成体态分析和训练后，这里会显示你的进度趋势</p>
              <div className="flex justify-center gap-4">
                <Link
                  href="/analyze"
                  className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-colors"
                >
                  体态分析
                </Link>
                <Link
                  href="/workout"
                  className="px-6 py-3 bg-white hover:bg-primary-50 text-primary-700 font-medium rounded-xl border border-primary-200 transition-colors"
                >
                  开始训练
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
