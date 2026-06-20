'use client';

import { Exercise } from '@/types/plan';

interface ExerciseItemProps {
  exercise: Exercise;
  index: number;
}

export default function ExerciseItem({ exercise, index }: ExerciseItemProps) {
  return (
    <div className="p-4 bg-primary-50/50 rounded-xl border border-primary-100 hover:border-primary-200 transition-colors">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 bg-primary-500 text-white rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0">
          {index}
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-semibold text-primary-800">{exercise.name}</h4>
              <span className="text-xs text-primary-500">{exercise.targetMuscle}</span>
            </div>
            <div className="flex gap-2">
              <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs font-medium">
                {exercise.sets} 组
              </span>
              <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs font-medium">
                {exercise.reps}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4 mt-2 text-xs text-primary-500">
            <span>休息 {exercise.restSec} 秒</span>
          </div>
          {exercise.notes && (
            <p className="mt-2 text-sm text-primary-600 bg-white/80 px-3 py-2 rounded-lg">
              💡 {exercise.notes}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
