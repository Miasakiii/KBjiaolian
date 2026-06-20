'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import WorkoutTimer from '@/components/WorkoutTimer';
import ExerciseSet from '@/components/ExerciseSet';
import { TrainingPlan, DayPlan, Exercise } from '@/types/plan';
import { CompletedExercise, CompletedSet, WorkoutRecord } from '@/types/workout';
import { getAllPlans } from '@/lib/planStorage';

export default function WorkoutPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<TrainingPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<TrainingPlan | null>(null);
  const [selectedDay, setSelectedDay] = useState<DayPlan | null>(null);
  const [exercises, setExercises] = useState<CompletedExercise[]>([]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [startTime, setStartTime] = useState(0);

  useEffect(() => {
    const loadPlans = async () => {
      const allPlans = await getAllPlans();
      setPlans(allPlans);
    };
    loadPlans();
  }, []);

  const initializeWorkout = useCallback((plan: TrainingPlan, day: DayPlan) => {
    setSelectedPlan(plan);
    setSelectedDay(day);
    setExercises(
      day.exercises.map((ex) => ({
        name: ex.name,
        targetMuscle: ex.targetMuscle,
        sets: Array.from({ length: ex.sets }, () => ({
          reps: 0,
          completed: false,
        })),
      }))
    );
    setCurrentExerciseIndex(0);
    const now = Date.now();
    // 持久化 startTime 到 sessionStorage，避免刷新页面后变成 0 导致 duration 异常巨大
    try {
      sessionStorage.setItem('workout-start-time', String(now));
      sessionStorage.setItem('workout-plan-id', plan.id);
    } catch (e) {
      console.warn('持久化训练开始时间失败:', e);
    }
    setStartTime(now);
    setIsStarted(true);
  }, []);

  const handleSetUpdate = (exerciseIndex: number, setIndex: number, set: CompletedSet) => {
    setExercises((prev) => {
      const newExercises = [...prev];
      newExercises[exerciseIndex] = {
        ...newExercises[exerciseIndex],
        sets: [...newExercises[exerciseIndex].sets],
      };
      newExercises[exerciseIndex].sets[setIndex] = set;
      return newExercises;
    });
  };

  const handleCompleteExercise = () => {
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex((prev) => prev + 1);
    }
  };

  const handleFinishWorkout = () => {
    const endTime = Date.now();
    const safeStart = startTime || (() => {
      // 兜底：从 sessionStorage 恢复，避免刷新页面导致 startTime=0
      const stored = sessionStorage.getItem('workout-start-time');
      return stored ? Number(stored) : endTime;
    })();
    const duration = Math.max(0, Math.round((endTime - safeStart) / 60000));

    const record: WorkoutRecord = {
      id: Date.now().toString(36) + Math.random().toString(36).substring(2),
      planId: selectedPlan?.id || '',
      planName: selectedPlan?.name || '',
      dayNumber: selectedDay?.day || 0,
      dayName: selectedDay?.name || '',
      startTime: safeStart,
      endTime,
      duration,
      exercises,
      rating: 0,
      notes: '',
      createdAt: Date.now(),
    };

    localStorage.setItem('pendingWorkout', JSON.stringify(record));
    // 清理 sessionStorage 的训练开始时间
    sessionStorage.removeItem('workout-start-time');
    sessionStorage.removeItem('workout-plan-id');
    router.push('/workout/complete');
  };

  const allSetsCompleted = exercises.every((ex) =>
    ex.sets.every((s) => s.completed)
  );

  // 选择训练日
  if (!isStarted) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100">
        <header className="text-center pt-12 pb-8">
          <div className="inline-flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/30">
              <span className="text-2xl">🏃</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary-700 to-primary-500 bg-clip-text text-transparent">开始训练</h1>
          </div>
          <p className="text-primary-600 text-lg">选择训练方案和训练日</p>
        </header>

        <div className="max-w-2xl mx-auto px-4 pb-12">
          <Link
            href="/plans"
            className="inline-flex items-center gap-2 px-4 py-2 text-primary-600 hover:text-primary-700 font-medium mb-6"
          >
            ← 返回方案列表
          </Link>

          {plans.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">📝</span>
              </div>
              <h2 className="text-xl font-semibold text-primary-800 mb-2">暂无训练方案</h2>
              <p className="text-primary-500 mb-6">请先生成训练方案</p>
              <Link
                href="/plan"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-colors"
              >
                生成训练方案
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl border border-primary-200/50 p-6"
                >
                  <h3 className="text-lg font-semibold text-primary-800 mb-4">{plan.name}</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {plan.schedule.map((day) => (
                      <button
                        key={day.day}
                        onClick={() => initializeWorkout(plan, day)}
                        className="p-4 bg-primary-50 hover:bg-primary-100 rounded-xl border border-primary-200 transition-all text-left"
                      >
                        <div className="font-semibold text-primary-800">Day {day.day}</div>
                        <div className="text-sm text-primary-600 mt-1">{day.name}</div>
                        <div className="text-xs text-primary-500 mt-2">
                          {day.exercises.length} 个动作 · {day.estimatedDuration} 分钟
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    );
  }

  // 训练中
  if (isStarted && exercises.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="text-gray-700 font-medium">该训练日没有动作数据</div>
        <p className="text-sm text-gray-500">请重新生成训练方案后再开始训练</p>
        <Link href="/plans" className="mt-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm">
          返回方案列表
        </Link>
      </main>
    );
  }

  const currentExercise = exercises[currentExerciseIndex];
  if (!currentExercise) {
    return null;
  }
  const currentPlanExercise = selectedDay?.exercises[currentExerciseIndex];

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100">
      {/* 顶部状态栏 */}
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-primary-100">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <div>
            <div className="text-sm text-primary-500">Day {selectedDay?.day}</div>
            <div className="font-semibold text-primary-800">{selectedDay?.name}</div>
          </div>
          <WorkoutTimer startTime={startTime} isRunning={isStarted} />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* 进度指示 */}
        <div className="flex gap-2 mb-6">
          {exercises.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentExerciseIndex(i)}
              className={`flex-1 h-2 rounded-full transition-all ${
                i === currentExerciseIndex
                  ? 'bg-primary-500'
                  : exercises[i].sets.every((s) => s.completed)
                    ? 'bg-green-400'
                    : 'bg-primary-200'
              }`}
            />
          ))}
        </div>

        {/* 当前动作 */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-primary-200/50 p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="text-sm text-primary-500">
                动作 {currentExerciseIndex + 1}/{exercises.length}
              </div>
              <h2 className="text-xl font-bold text-primary-800">{currentExercise.name}</h2>
              <div className="text-sm text-primary-600 mt-1">{currentExercise.targetMuscle}</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary-600">
                {currentExercise.sets.filter((s) => s.completed).length}/{currentExercise.sets.length}
              </div>
              <div className="text-xs text-primary-500">组完成</div>
            </div>
          </div>

          {/* 动作说明 */}
          {currentPlanExercise?.notes && (
            <div className="mb-4 p-3 bg-primary-50 rounded-xl">
              <p className="text-sm text-primary-700">💡 {currentPlanExercise.notes}</p>
            </div>
          )}

          {/* 组列表 */}
          <div className="space-y-3">
            {currentExercise.sets.map((set, setIndex) => (
              <ExerciseSet
                key={setIndex}
                setNumber={setIndex + 1}
                targetReps={currentPlanExercise?.reps || '10'}
                set={set}
                onUpdate={(newSet) => handleSetUpdate(currentExerciseIndex, setIndex, newSet)}
              />
            ))}
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-3">
          {currentExerciseIndex < exercises.length - 1 ? (
            <button
              onClick={handleCompleteExercise}
              disabled={!currentExercise.sets.every((s) => s.completed)}
              className="flex-1 py-3 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 text-white font-medium rounded-xl transition-colors"
            >
              下一个动作
            </button>
          ) : (
            <button
              onClick={handleFinishWorkout}
              disabled={!allSetsCompleted}
              className="flex-1 py-3 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white font-medium rounded-xl transition-colors"
            >
              完成训练
            </button>
          )}
        </div>

        {/* 退出提示 */}
        <div className="mt-6 text-center">
          <Link
            href="/plans"
            className="text-sm text-primary-500 hover:text-primary-700"
          >
            退出训练
          </Link>
        </div>
      </div>
    </main>
  );
}
