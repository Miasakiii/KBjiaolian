'use client';

import Link from 'next/link';
import { Task } from '@/lib/dashboard';

interface TodayTasksProps {
  tasks: Task[];
}

export default function TodayTasks({ tasks }: TodayTasksProps) {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-primary-200/50 p-5">
      <h3 className="font-semibold text-primary-800 mb-4 flex items-center gap-2">
        <span>📋</span>
        今日任务
      </h3>

      <div className="space-y-3">
        {tasks.map((task) => (
          <Link
            key={task.id}
            href={task.link}
            className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
              task.completed
                ? 'bg-green-50 border border-green-200'
                : 'bg-primary-50/50 border border-primary-100 hover:bg-primary-100'
            }`}
          >
            <span className="text-xl">{task.icon}</span>
            <span className={`flex-1 text-sm font-medium ${
              task.completed ? 'text-green-700' : 'text-primary-800'
            }`}>
              {task.title}
            </span>
            {task.completed ? (
              <span className="text-green-500">✓</span>
            ) : (
              <span className="text-primary-400">→</span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
