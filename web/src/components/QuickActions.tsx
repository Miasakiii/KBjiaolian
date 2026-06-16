'use client';

import Link from 'next/link';

interface ActionItem {
  icon: string;
  label: string;
  description: string;
  link: string;
  color: string;
}

const actions: ActionItem[] = [
  {
    icon: '📸',
    label: '体态分析',
    description: '拍照分析体态',
    link: '/analyze',
    color: 'from-primary-500 to-primary-600',
  },
  {
    icon: '🏋️',
    label: '开始训练',
    description: '执行训练方案',
    link: '/workout',
    color: 'from-blue-500 to-blue-600',
  },
  {
    icon: '🍎',
    label: '饮食记录',
    description: '记录今日饮食',
    link: '/nutrition',
    color: 'from-green-500 to-green-600',
  },
  {
    icon: '🤖',
    label: 'AI 教练',
    description: '咨询健身问题',
    link: '/chat',
    color: 'from-purple-500 to-purple-600',
  },
];

export default function QuickActions() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {actions.map((action) => (
        <Link key={action.link} href={action.link} className="block group">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-primary-200/50 p-5 hover:shadow-lg hover:border-primary-300 transition-all text-center">
            <div className={`w-14 h-14 bg-gradient-to-br ${action.color} rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
              <span className="text-2xl">{action.icon}</span>
            </div>
            <div className="font-semibold text-primary-800 mb-1">{action.label}</div>
            <div className="text-xs text-primary-500">{action.description}</div>
          </div>
        </Link>
      ))}
    </div>
  );
}
