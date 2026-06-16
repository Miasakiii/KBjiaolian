'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { WorkoutRecord, WorkoutStats as StatsType } from '@/types/workout';
import { getAllWorkouts, deleteWorkout, getWorkoutStats, clearAllWorkouts } from '@/lib/workoutStorage';
import WorkoutStatsComponent from '@/components/WorkoutStats';
import WorkoutCard from '@/components/WorkoutCard';

export default function WorkoutsPage() {
  const [records, setRecords] = useState<WorkoutRecord[]>([]);
  const [stats, setStats] = useState<StatsType | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [workoutRecords, workoutStats] = await Promise.all([
      getAllWorkouts(),
      getWorkoutStats(),
    ]);
    setRecords(workoutRecords);
    setStats(workoutStats);
  };

  const handleDelete = async (id: string) => {
    await deleteWorkout(id);
    loadData();
  };

  const handleClearAll = async () => {
    await clearAllWorkouts();
    loadData();
    setShowConfirm(false);
  };

  // 按日期分组
  const groupedRecords = records.reduce((groups, record) => {
    const date = new Date(record.createdAt).toLocaleDateString('zh-CN');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(record);
    return groups;
  }, {} as Record<string, WorkoutRecord[]>);

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100">
      <header className="text-center pt-12 pb-8">
        <div className="inline-flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/30">
            <span className="text-2xl">📊</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary-700 to-primary-500 bg-clip-text text-transparent">训练记录</h1>
        </div>
        <p className="text-primary-600 text-lg">查看你的训练历史和统计</p>
      </header>

      <div className="max-w-4xl mx-auto px-4 pb-12">
        {/* 操作栏 */}
        <div className="flex justify-between items-center mb-6">
          <Link
            href="/analyze"
            className="inline-flex items-center gap-2 px-4 py-2 text-primary-600 hover:text-primary-700 font-medium"
          >
            ← 返回分析
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/workout"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <span>🏃</span>
              开始训练
            </Link>
            {records.length > 0 && (
              <button
                onClick={() => setShowConfirm(true)}
                className="px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              >
                清空记录
              </button>
            )}
          </div>
        </div>

        {records.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">🏃</span>
            </div>
            <h2 className="text-xl font-semibold text-primary-800 mb-2">暂无训练记录</h2>
            <p className="text-primary-500 mb-6">完成一次训练后，记录会自动保存到这里</p>
            <Link
              href="/workout"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-colors"
            >
              开始训练
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {/* 统计 */}
            {stats && <WorkoutStatsComponent stats={stats} />}

            {/* 训练记录 */}
            {Object.entries(groupedRecords).map(([date, dayRecords]) => (
              <div key={date}>
                <h3 className="text-sm font-medium text-primary-500 mb-3">{date}</h3>
                <div className="space-y-3">
                  {dayRecords.map((record) => (
                    <WorkoutCard
                      key={record.id}
                      record={record}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 确认弹窗 */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">确认清空</h3>
            <p className="text-gray-600 mb-6">确定要清空所有训练记录吗？此操作无法撤销。</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleClearAll}
                className="flex-1 py-2.5 text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors"
              >
                确认清空
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
