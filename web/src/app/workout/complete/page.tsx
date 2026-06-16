'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { WorkoutRecord } from '@/types/workout';
import { saveWorkout } from '@/lib/workoutStorage';

export default function WorkoutCompletePage() {
  const router = useRouter();
  const [record, setRecord] = useState<WorkoutRecord | null>(null);
  const [rating, setRating] = useState(4);
  const [notes, setNotes] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('pendingWorkout');
    if (stored) {
      try {
        setRecord(JSON.parse(stored));
      } catch {
        console.error('Failed to parse pending workout');
        router.push('/workout');
      }
    } else {
      router.push('/workout');
    }
  }, [router]);

  const handleSave = () => {
    if (!record) return;

    const finalRecord: WorkoutRecord = {
      ...record,
      rating,
      notes,
    };

    saveWorkout(finalRecord);
    localStorage.removeItem('pendingWorkout');
    setSaved(true);
  };

  if (!record) {
    return null;
  }

  const completedSets = record.exercises.reduce(
    (sum, ex) => sum + ex.sets.filter((s) => s.completed).length,
    0
  );
  const totalSets = record.exercises.reduce(
    (sum, ex) => sum + ex.sets.length,
    0
  );

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100">
      <div className="max-w-2xl mx-auto px-4 pt-16">
        {/* 成功动画 */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
            <span className="text-5xl">🎉</span>
          </div>
          <h1 className="text-3xl font-bold text-primary-800">训练完成！</h1>
          <p className="text-primary-600 mt-2">太棒了，坚持就是胜利</p>
        </div>

        {/* 训练总结 */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-primary-200/50 p-6 mb-6">
          <h2 className="text-lg font-semibold text-primary-800 mb-4">训练总结</h2>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-4 bg-primary-50 rounded-xl">
              <div className="text-2xl font-bold text-primary-700">{record.duration}</div>
              <div className="text-xs text-primary-500">分钟</div>
            </div>
            <div className="text-center p-4 bg-primary-50 rounded-xl">
              <div className="text-2xl font-bold text-primary-700">{record.exercises.length}</div>
              <div className="text-xs text-primary-500">动作</div>
            </div>
            <div className="text-center p-4 bg-primary-50 rounded-xl">
              <div className="text-2xl font-bold text-primary-700">{completedSets}/{totalSets}</div>
              <div className="text-xs text-primary-500">组完成</div>
            </div>
          </div>

          <div className="text-sm text-primary-600">
            <span className="font-medium">{record.planName}</span>
            <span className="mx-2">·</span>
            <span>Day {record.dayNumber} {record.dayName}</span>
          </div>
        </div>

        {/* 训练感受 */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-primary-200/50 p-6 mb-6">
          <h2 className="text-lg font-semibold text-primary-800 mb-4">训练感受</h2>

          {/* 评分 */}
          <div className="flex justify-center gap-2 mb-6">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className="text-3xl transition-transform hover:scale-110"
              >
                {star <= rating ? '⭐' : '☆'}
              </button>
            ))}
          </div>

          {/* 备注 */}
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="记录一下今天的训练感受...（可选）"
            className="w-full p-3 bg-primary-50 rounded-xl border border-primary-200 focus:border-primary-400 focus:outline-none resize-none h-24"
          />
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-3">
          {!saved ? (
            <>
              <button
                onClick={() => router.push('/workout')}
                className="flex-1 py-3 text-primary-600 bg-primary-50 hover:bg-primary-100 font-medium rounded-xl transition-colors"
              >
                继续训练
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-3 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-colors"
              >
                保存记录
              </button>
            </>
          ) : (
            <>
              <Link
                href="/workouts"
                className="flex-1 py-3 text-center text-primary-600 bg-primary-50 hover:bg-primary-100 font-medium rounded-xl transition-colors"
              >
                查看训练记录
              </Link>
              <Link
                href="/analyze"
                className="flex-1 py-3 text-center bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-colors"
              >
                返回首页
              </Link>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
