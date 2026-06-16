'use client';

import { useEffect, useState } from 'react';
import { Suggestion } from '@/types/analysis';
import ExerciseDetail from './ExerciseDetail';

interface SuggestionListProps {
  suggestions: Suggestion[];
}

export default function SuggestionList({ suggestions }: SuggestionListProps) {
  const [visibleItems, setVisibleItems] = useState<number[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<Suggestion | null>(null);

  useEffect(() => {
    suggestions.forEach((_, i) => {
      setTimeout(() => {
        setVisibleItems((prev) => [...prev, i]);
      }, i * 150);
    });
  }, [suggestions]);

  const difficultyColor = {
    '初级': 'bg-green-100 text-green-700',
    '中级': 'bg-yellow-100 text-yellow-700',
    '高级': 'bg-red-100 text-red-700',
  };

  return (
    <div className="space-y-3">
      <h4 className="text-primary-800 font-semibold">建议方案</h4>
      {suggestions.map((s, i) => (
        <div
          key={i}
          onClick={() => setSelectedExercise(s)}
          className={`bg-gradient-to-r from-primary-50 to-white rounded-xl p-4 border border-primary-200/50 hover:shadow-md hover:border-primary-300 cursor-pointer transition-all duration-300 ${
            visibleItems.includes(i) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-primary-800">{s.exercise}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${difficultyColor[s.difficulty]}`}>
                {s.difficulty}
              </span>
            </div>
            <span className="text-xs font-medium text-primary-600 bg-primary-100 px-2.5 py-1 rounded-lg">{s.sets}</span>
          </div>
          <p className="text-sm text-primary-600 leading-relaxed">{s.description}</p>
          <div className="flex items-center justify-between mt-3 pt-2 border-t border-primary-100">
            <span className="text-xs text-primary-500">目标肌群：{s.targetMuscle}</span>
            <span className="text-xs text-primary-400">点击查看详情 →</span>
          </div>
        </div>
      ))}

      {selectedExercise && (
        <ExerciseDetail
          exercise={selectedExercise}
          onClose={() => setSelectedExercise(null)}
        />
      )}
    </div>
  );
}
