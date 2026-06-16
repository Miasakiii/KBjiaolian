'use client';

import { Activity } from '@/lib/dashboard';

interface RecentActivityProps {
  activities: Activity[];
}

export default function RecentActivity({ activities }: RecentActivityProps) {
  if (activities.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-primary-200/50 p-5">
        <h3 className="font-semibold text-primary-800 mb-4 flex items-center gap-2">
          <span>⏱️</span>
          最近活动
        </h3>
        <div className="text-center py-8">
          <span className="text-4xl">📭</span>
          <p className="text-primary-500 text-sm mt-2">暂无活动记录</p>
        </div>
      </div>
    );
  }

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`;
    if (diff < 172800000) return '昨天';
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-primary-200/50 p-5">
      <h3 className="font-semibold text-primary-800 mb-4 flex items-center gap-2">
        <span>⏱️</span>
        最近活动
      </h3>

      <div className="space-y-3">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-center gap-3 p-3 bg-primary-50/50 rounded-xl"
          >
            <span className="text-xl">{activity.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-primary-800 truncate">
                {activity.title}
              </div>
            </div>
            <div className="text-xs text-primary-400 flex-shrink-0">
              {formatTime(activity.time)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
