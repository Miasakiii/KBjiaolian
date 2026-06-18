'use client';

import { useState } from 'react';
import {
  ExerciseDef,
  difficultyLabels,
  equipmentLabels,
  muscleGroupLabels,
  muscleGroupEmojis,
} from '@/data/exercises';

interface ExerciseCardProps {
  exercise: ExerciseDef;
  onClick?: (exercise: ExerciseDef) => void;
}

const difficultyColors = {
  beginner: 'bg-green-100 text-green-700',
  intermediate: 'bg-yellow-100 text-yellow-700',
  advanced: 'bg-red-100 text-red-700',
};

export default function ExerciseCard({ exercise, onClick }: ExerciseCardProps) {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <button
      onClick={() => onClick?.(exercise)}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      className={`w-full text-left bg-white/80 backdrop-blur-sm rounded-2xl border border-primary-200/50 p-4 transition-all hover:border-primary-300 hover:shadow-md ${
        isPressed ? 'scale-[0.98]' : ''
      }`}
    >
      <div className="flex items-start gap-4">
        {/* 动画/图标区域 */}
        <div className="w-14 h-14 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center flex-shrink-0">
          <span className="text-2xl">{exercise.animation.value}</span>
        </div>

        {/* 信息区域 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-gray-900 truncate">{exercise.name}</h3>
              <p className="text-xs text-gray-500 mt-0.5">{exercise.nameEn}</p>
            </div>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${
                difficultyColors[exercise.difficulty]
              }`}
            >
              {difficultyLabels[exercise.difficulty]}
            </span>
          </div>

          {/* 标签 */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            <span className="px-2 py-0.5 bg-primary-50 text-primary-600 rounded-full text-xs">
              {muscleGroupEmojis[exercise.muscleGroup]}{' '}
              {muscleGroupLabels[exercise.muscleGroup]}
            </span>
            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
              {equipmentLabels[exercise.equipment]}
            </span>
          </div>

          {/* 推荐组数 */}
          <p className="text-xs text-gray-500 mt-2">{exercise.defaultSets}</p>
        </div>
      </div>
    </button>
  );
}
