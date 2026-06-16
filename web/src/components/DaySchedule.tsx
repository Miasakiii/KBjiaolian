'use client';

import { DayPlan } from '@/types/plan';
import ExerciseItem from './ExerciseItem';

interface DayScheduleProps {
  dayPlan: DayPlan;
}

export default function DaySchedule({ dayPlan }: DayScheduleProps) {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-primary-200/50 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-primary-800">
            Day {dayPlan.day} · {dayPlan.name}
          </h3>
          <p className="text-sm text-primary-500 mt-1">
            预计时长：{dayPlan.estimatedDuration} 分钟
          </p>
        </div>
        <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
          <span className="text-2xl">💪</span>
        </div>
      </div>

      <div className="space-y-3">
        {dayPlan.exercises.map((exercise, i) => (
          <ExerciseItem key={i} exercise={exercise} index={i + 1} />
        ))}
      </div>
    </div>
  );
}
