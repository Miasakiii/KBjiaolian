'use client';

import { WorkoutRecord } from '@/types/workout';

interface WorkoutCardProps {
  record: WorkoutRecord;
  onDelete: (id: string) => void;
}

export default function WorkoutCard({ record, onDelete }: WorkoutCardProps) {
  const date = new Date(record.createdAt);
  const dateStr = date.toLocaleDateString('zh-CN', {
    month: 'long',
    day: 'numeric',
  });
  const timeStr = date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const completedSets = record.exercises.reduce(
    (sum, ex) => sum + ex.sets.filter((s) => s.completed).length,
    0
  );
  const totalSets = record.exercises.reduce(
    (sum, ex) => sum + ex.sets.length,
    0
  );

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-primary-200/50 p-4 hover:shadow-lg hover:border-primary-300 transition-all group">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="text-sm text-primary-500">{dateStr} {timeStr}</div>
          <h3 className="font-semibold text-primary-800">{record.dayName}</h3>
        </div>
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }, (_, i) => (
            <span key={i} className="text-sm">
              {i < record.rating ? '⭐' : '☆'}
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        <span className="px-2.5 py-1 bg-primary-100 text-primary-700 rounded-lg text-xs">
          {record.planName}
        </span>
        <span className="px-2.5 py-1 bg-primary-100 text-primary-700 rounded-lg text-xs">
          Day {record.dayNumber}
        </span>
      </div>

      <div className="flex items-center gap-4 text-sm text-primary-600">
        <span>⏱️ {record.duration} 分钟</span>
        <span>💪 {record.exercises.length} 个动作</span>
        <span>✅ {completedSets}/{totalSets} 组</span>
      </div>

      {record.notes && (
        <p className="mt-3 text-sm text-primary-600 bg-primary-50 p-2 rounded-lg">
          {record.notes}
        </p>
      )}

      <div className="mt-3 pt-3 border-t border-primary-100 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onDelete(record.id)}
          className="text-xs text-red-500 hover:text-red-700"
        >
          删除记录
        </button>
      </div>
    </div>
  );
}
