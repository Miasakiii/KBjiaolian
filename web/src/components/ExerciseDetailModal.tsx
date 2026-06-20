'use client';

import {
  ExerciseDef,
  difficultyLabels,
  equipmentLabels,
  muscleGroupLabels,
  muscleGroupEmojis,
} from '@/data/exercises';
import { DynamicIcon } from '@/lib/iconMap';
import { AlertTriangle } from 'lucide-react';

interface ExerciseDetailModalProps {
  exercise: ExerciseDef;
  onClose: () => void;
}

const difficultyColors = {
  beginner: 'bg-green-100 text-green-700',
  intermediate: 'bg-yellow-100 text-yellow-700',
  advanced: 'bg-red-100 text-red-700',
};

export default function ExerciseDetailModal({ exercise, onClose }: ExerciseDetailModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部 */}
        <div className="sticky top-0 bg-gradient-to-r from-primary-500 to-primary-600 text-white p-6 rounded-t-2xl z-10">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <DynamicIcon name={exercise.animation.value} size={24} className="text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">{exercise.name}</h3>
                <p className="text-white/80 text-sm">{exercise.nameEn}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white text-2xl leading-none w-8 h-8 flex items-center justify-center"
              type="button"
            >
              ✕
            </button>
          </div>

          {/* 标签 */}
          <div className="flex flex-wrap gap-2 mt-4">
            <span className="text-sm bg-white/20 px-2.5 py-1 rounded-lg flex items-center gap-1">
              <DynamicIcon name={muscleGroupEmojis[exercise.muscleGroup]} size={14} />
              {muscleGroupLabels[exercise.muscleGroup]}
            </span>
            <span className="text-sm bg-white/20 px-2.5 py-1 rounded-lg">
              {equipmentLabels[exercise.equipment]}
            </span>
            <span
              className={`text-sm px-2.5 py-1 rounded-lg ${
                difficultyColors[exercise.difficulty]
              }`}
            >
              {difficultyLabels[exercise.difficulty]}
            </span>
          </div>
        </div>

        {/* 内容 */}
        <div className="p-6 space-y-6">
          {/* 推荐组数 */}
          <div className="bg-primary-50 rounded-xl p-4 text-center">
            <p className="text-sm text-primary-600">推荐训练量</p>
            <p className="text-lg font-bold text-primary-800 mt-1">
              {exercise.defaultSets}
            </p>
          </div>

          {/* 描述 */}
          <div>
            <p className="text-primary-600 leading-relaxed">{exercise.description}</p>
          </div>

          {/* 训练步骤 */}
          <div>
            <h4 className="font-semibold text-primary-800 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center text-sm">
                📋
              </span>
              训练步骤
            </h4>
            <ol className="space-y-3">
              {exercise.steps.map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    {i + 1}
                  </span>
                  <span className="text-primary-600 leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* 训练要点 */}
          <div>
            <h4 className="font-semibold text-primary-800 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center text-sm">
                💡
              </span>
              训练要点
            </h4>
            <ul className="space-y-2">
              {exercise.tips.map((tip, i) => (
                <li key={i} className="flex gap-2 text-primary-600">
                  <span className="text-primary-500">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 常见错误 */}
          {exercise.commonMistakes.length > 0 && (
            <div>
              <h4 className="font-semibold text-primary-800 mb-3 flex items-center gap-2">
                <span className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle size={14} className="text-yellow-500" />
                </span>
                常见错误
              </h4>
              <ul className="space-y-2">
                {exercise.commonMistakes.map((mistake, i) => (
                  <li key={i} className="flex gap-2 text-primary-600">
                    <span className="text-red-400">✕</span>
                    <span>{mistake}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 辅助肌群 */}
          {exercise.secondaryMuscles.length > 0 && (
            <div>
              <h4 className="font-semibold text-primary-800 mb-2 text-sm">辅助肌群</h4>
              <div className="flex flex-wrap gap-1.5">
                {exercise.secondaryMuscles.map((m) => (
                  <span
                    key={m}
                    className="px-2 py-0.5 bg-primary-50 text-primary-500 rounded-full text-xs flex items-center gap-1"
                  >
                    <DynamicIcon name={muscleGroupEmojis[m]} size={12} />
                    {muscleGroupLabels[m]}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 底部 */}
        <div className="sticky bottom-0 p-4 bg-primary-50 rounded-b-2xl border-t">
          <button
            onClick={onClose}
            className="w-full py-3 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-colors"
            type="button"
          >
            知道了
          </button>
        </div>
      </div>
    </div>
  );
}
