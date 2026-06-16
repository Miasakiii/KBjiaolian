'use client';

import { CompletedSet } from '@/types/workout';

interface ExerciseSetProps {
  setNumber: number;
  targetReps: string;
  set: CompletedSet;
  onUpdate: (set: CompletedSet) => void;
}

export default function ExerciseSet({ setNumber, targetReps, set, onUpdate }: ExerciseSetProps) {
  const handleToggle = () => {
    onUpdate({ ...set, completed: !set.completed });
  };

  const handleRepsChange = (delta: number) => {
    const newReps = Math.max(0, set.reps + delta);
    onUpdate({ ...set, reps: newReps });
  };

  return (
    <div
      className={`flex items-center gap-4 p-3 rounded-xl transition-all ${
        set.completed
          ? 'bg-green-50 border border-green-200'
          : 'bg-primary-50/50 border border-primary-100'
      }`}
    >
      {/* 组号 */}
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
          set.completed
            ? 'bg-green-500 text-white'
            : 'bg-primary-200 text-primary-700'
        }`}
      >
        {set.completed ? '✓' : setNumber}
      </div>

      {/* 次数控制 */}
      <div className="flex-1 flex items-center gap-3">
        <button
          onClick={() => handleRepsChange(-1)}
          className="w-8 h-8 rounded-full bg-white border border-primary-200 text-primary-700 hover:bg-primary-100 flex items-center justify-center"
        >
          -
        </button>
        <div className="text-center min-w-[60px]">
          <div className="text-lg font-bold text-primary-800">{set.reps}</div>
          <div className="text-xs text-primary-500">目标 {targetReps}</div>
        </div>
        <button
          onClick={() => handleRepsChange(1)}
          className="w-8 h-8 rounded-full bg-white border border-primary-200 text-primary-700 hover:bg-primary-100 flex items-center justify-center"
        >
          +
        </button>
      </div>

      {/* 完成按钮 */}
      <button
        onClick={handleToggle}
        className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
          set.completed
            ? 'bg-green-500 text-white hover:bg-green-600'
            : 'bg-primary-500 text-white hover:bg-primary-600'
        }`}
      >
        {set.completed ? '已完成' : '完成'}
      </button>
    </div>
  );
}
