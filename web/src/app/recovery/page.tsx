'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { WorkoutRecord } from '@/types/workout';
import { getAllWorkouts } from '@/lib/workoutStorage';
import {
  MuscleRecovery,
  calculateRecovery,
  getFrequencyHeatmap,
  muscleLabels,
  muscleEmojis,
  getRecoveryColor,
  getRecoveryBgColor,
  getRecoveryLabel,
  getHeatmapColor,
  formatHours,
} from '@/lib/recovery';
import { Calendar } from 'lucide-react';
import { DynamicIcon } from '@/lib/iconMap';

export default function RecoveryPage() {
  const [records, setRecords] = useState<WorkoutRecord[]>([]);
  const [recovery, setRecovery] = useState<MuscleRecovery[]>([]);
  const [heatmap, setHeatmap] = useState<
    { date: string; count: number; dayOfWeek: number }[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const allRecords = await getAllWorkouts();
        setRecords(allRecords);
        setRecovery(calculateRecovery(allRecords));
        setHeatmap(getFrequencyHeatmap(allRecords));
      } catch (err) {
        console.warn('加载恢复数据失败:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // 按恢复程度排序（未恢复的在前）
  const sortedRecovery = [...recovery].sort((a, b) => a.recovery - b.recovery);

  // 最近训练的肌群（24小时内）
  const recentMuscles = recovery.filter((r) => r.status === 'fresh');
  // 需要关注的肌群（恢复中）
  const recoveringMuscles = recovery.filter((r) => r.status === 'recovering');
  // 已恢复的肌群
  const recoveredMuscles = recovery.filter((r) => r.status === 'recovered');

  const dayLabels = ['日', '一', '二', '三', '四', '五', '六'];

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-primary-600">加载恢复数据...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100">
      {/* 头部 */}
      <header className="text-center pt-12 pb-6">
        <div className="inline-flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/30">
            <span className="text-2xl"></span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary-700 to-primary-500 bg-clip-text text-transparent">
            恢复追踪
          </h1>
        </div>
        <p className="text-primary-600 text-lg">
          {records.length > 0
            ? `基于 ${records.length} 条训练记录`
            : '开始训练后即可查看恢复状态'}
        </p>
      </header>

      <div className="max-w-2xl mx-auto px-4 pb-12">
        {/* 返回按钮 */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 text-primary-600 hover:text-primary-700 font-medium mb-6"
        >
          ← 返回首页
        </Link>

        {records.length === 0 ? (
          /* 空状态 */
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl"></span>
            </div>
            <h2 className="text-xl font-semibold text-primary-800 mb-2">暂无训练记录</h2>
            <p className="text-primary-500 mb-6">完成训练后即可查看肌肉恢复状态</p>
            <Link
              href="/workout"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-colors"
            >
              开始训练
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {/* 训练频率热力图 */}
            <section className="bg-white/80 backdrop-blur-sm rounded-2xl border border-primary-200/50 p-6">
              <h2 className="text-lg font-semibold text-primary-800 mb-4 flex items-center gap-2">
                <Calendar size={18} className="text-primary-600" /> 最近 4 周训练频率
              </h2>

              {/* 热力图 */}
              <div className="grid grid-cols-7 gap-1.5">
                {/* 星期标签 */}
                {dayLabels.map((label) => (
                  <div
                    key={label}
                    className="text-center text-xs text-primary-400 font-medium pb-1"
                  >
                    {label}
                  </div>
                ))}

                {/* 热力图方块 */}
                {heatmap.map((day, i) => (
                  <div
                    key={day.date}
                    className={`aspect-square rounded-md flex items-center justify-center text-xs font-medium ${
                      getHeatmapColor(day.count)
                    } ${day.count > 0 ? 'text-white' : 'text-primary-300'}`}
                    title={`${day.date}: ${day.count} 次训练`}
                  >
                    {day.count > 0 ? day.count : ''}
                  </div>
                ))}
              </div>

              {/* 图例 */}
              <div className="flex items-center justify-end gap-1.5 mt-3 text-xs text-primary-400">
                <span>少</span>
                <div className="w-4 h-4 rounded-sm bg-primary-50" />
                <div className="w-4 h-4 rounded-sm bg-green-200" />
                <div className="w-4 h-4 rounded-sm bg-green-400" />
                <div className="w-4 h-4 rounded-sm bg-green-600" />
                <span>多</span>
              </div>
            </section>

            {/* 肌肉恢复状态总览 */}
            <section className="bg-white/80 backdrop-blur-sm rounded-2xl border border-primary-200/50 p-6">
              <h2 className="text-lg font-semibold text-primary-800 mb-4 flex items-center gap-2">
                <span></span> 肌肉恢复状态
              </h2>

              <div className="space-y-3">
                {sortedRecovery.map((item) => (
                  <div
                    key={item.muscle}
                    className={`p-4 rounded-xl border ${getRecoveryBgColor(item.recovery)}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <DynamicIcon name={muscleEmojis[item.muscle]} size={18} className="text-primary-600" />
                        <span className="font-medium text-primary-800">
                          {muscleLabels[item.muscle]}
                        </span>
                        <span className="text-xs text-primary-400">
                          {getRecoveryLabel(item.recovery)}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-primary-600">
                        {item.recovery}%
                      </span>
                    </div>

                    {/* 进度条 */}
                    <div className="w-full h-2 bg-primary-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${getRecoveryColor(item.recovery)}`}
                        style={{ width: `${item.recovery}%` }}
                      />
                    </div>

                    {/* 详细信息 */}
                    <div className="flex items-center justify-between mt-2 text-xs text-primary-400">
                      <span>
                        {item.lastTrainedAt
                          ? `上次训练: ${formatHours(item.hoursSinceTraining)}`
                          : '暂无训练记录'}
                      </span>
                      <span>本周 {item.weeklyFrequency} 次</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 训练建议 */}
            {recentMuscles.length > 0 && (
              <section className="bg-white/80 backdrop-blur-sm rounded-2xl border border-primary-200/50 p-6">
                <h2 className="text-lg font-semibold text-primary-800 mb-4 flex items-center gap-2">
                  <span>💡</span> 训练建议
                </h2>
                <div className="space-y-3">
                  {recentMuscles.length > 0 && (
                    <div className="p-3 bg-red-50 rounded-xl">
                      <p className="text-sm text-red-800">
                        <strong>🔴 刚训练的肌群：</strong>
                        {recentMuscles.map((m) => muscleLabels[m.muscle]).join('、')}
                        ，建议休息 48-72 小时
                      </p>
                    </div>
                  )}
                  {recoveringMuscles.length > 0 && (
                    <div className="p-3 bg-yellow-50 rounded-xl">
                      <p className="text-sm text-yellow-800">
                        <strong>🟡 恢复中的肌群：</strong>
                        {recoveringMuscles.map((m) => muscleLabels[m.muscle]).join('、')}
                        ，可进行轻度活动
                      </p>
                    </div>
                  )}
                  {recoveredMuscles.length > 0 && (
                    <div className="p-3 bg-green-50 rounded-xl">
                      <p className="text-sm text-green-800">
                        <strong>🟢 可以训练的肌群：</strong>
                        {recoveredMuscles.map((m) => muscleLabels[m.muscle]).join('、')}
                      </p>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* 快捷操作 */}
            <div className="flex gap-3">
              <Link
                href="/workout"
                className="flex-1 py-3 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-colors text-center"
              >
                开始训练
              </Link>
              <Link
                href="/plan"
                className="flex-1 py-3 bg-white hover:bg-primary-50 text-primary-600 font-medium rounded-xl border border-primary-200 transition-colors text-center"
              >
                生成方案
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
