'use client';

import { HistoryRecord } from '@/types/analysis';

interface HistoryCardProps {
  record: HistoryRecord;
  onSelect: (record: HistoryRecord) => void;
  onDelete: (id: string) => void;
}

export default function HistoryCard({ record, onSelect, onDelete }: HistoryCardProps) {
  const date = new Date(record.timestamp);
  const dateStr = date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const timeStr = date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const scoreColor =
    record.result.score >= 80
      ? 'text-green-600 bg-green-50'
      : record.result.score >= 60
        ? 'text-orange-600 bg-orange-50'
        : 'text-red-600 bg-red-50';

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-primary-200/50 p-4 hover:shadow-lg hover:border-primary-300 transition-all cursor-pointer group">
      <div className="flex gap-4">
        {/* 缩略图 */}
        <div className="w-20 h-28 rounded-xl overflow-hidden flex-shrink-0 bg-primary-50">
          <img
            src={record.imagePreview}
            alt="体态照片"
            className="w-full h-full object-cover"
          />
        </div>

        {/* 内容 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-primary-500">{dateStr}</p>
              <p className="text-xs text-primary-400">{timeStr}</p>
            </div>
            <div className={`px-3 py-1.5 rounded-xl ${scoreColor}`}>
              <span className="text-xl font-bold">{record.result.score}</span>
              <span className="text-xs ml-0.5">分</span>
            </div>
          </div>

          {/* 问题标签 */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {record.result.issues.map((issue) => {
              const severityColor =
                issue.severity === 'severe'
                  ? 'bg-red-100 text-red-700'
                  : issue.severity === 'moderate'
                    ? 'bg-orange-100 text-orange-700'
                    : 'bg-yellow-100 text-yellow-700';
              return (
                <span
                  key={issue.name}
                  className={`px-2 py-0.5 rounded-full text-xs ${severityColor}`}
                >
                  {issue.name}
                </span>
              );
            })}
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelect(record);
              }}
              className="flex-1 py-1.5 text-xs font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors"
            >
              查看详情
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(record.id);
              }}
              className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
            >
              删除
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
