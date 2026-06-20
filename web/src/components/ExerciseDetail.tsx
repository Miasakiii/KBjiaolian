'use client';

import { Suggestion } from '@/types/analysis';

interface ExerciseDetailProps {
  exercise: Suggestion;
  onClose: () => void;
}

export default function ExerciseDetail({ exercise, onClose }: ExerciseDetailProps) {
  const difficultyColor = {
    '初级': 'bg-green-100 text-green-700',
    '中级': 'bg-yellow-100 text-yellow-700',
    '高级': 'bg-red-100 text-red-700',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* 头部 */}
        <div className="sticky top-0 bg-gradient-to-r from-primary-500 to-primary-600 text-white p-6 rounded-t-2xl">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-bold">{exercise.exercise}</h3>
              <div className="flex gap-2 mt-2">
                <span className="text-sm bg-white/20 px-2.5 py-1 rounded-lg">{exercise.sets}</span>
                <span className="text-sm bg-white/20 px-2.5 py-1 rounded-lg">{exercise.targetMuscle}</span>
                <span className={`text-sm px-2.5 py-1 rounded-lg ${difficultyColor[exercise.difficulty]}`}>
                  {exercise.difficulty}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white text-2xl leading-none"
            >
              ✕
            </button>
          </div>
        </div>

        {/* 内容 */}
        <div className="p-6 space-y-6">
          {/* 描述 */}
          <div>
            <p className="text-primary-700 leading-relaxed">{exercise.description}</p>
          </div>

          {/* 训练步骤 */}
          <div>
            <h4 className="font-semibold text-primary-800 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center text-sm">📋</span>
              训练步骤
            </h4>
            <ol className="space-y-3">
              {exercise.steps.map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    {i + 1}
                  </span>
                  <span className="text-primary-700 leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* 训练要点 */}
          <div>
            <h4 className="font-semibold text-primary-800 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center text-sm">💡</span>
              训练要点
            </h4>
            <ul className="space-y-2">
              {exercise.tips.map((tip, i) => (
                <li key={i} className="flex gap-2 text-primary-700">
                  <span className="text-primary-400">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="sticky bottom-0 p-4 bg-primary-50 rounded-b-2xl border-t">
          <button
            onClick={onClose}
            className="w-full py-3 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-colors"
          >
            知道了
          </button>
        </div>
      </div>
    </div>
  );
}
