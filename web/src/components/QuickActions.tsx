'use client';

import Link from 'next/link';
import { Camera, Dumbbell, Apple, Bot } from 'lucide-react';

interface ActionItem {
  icon: React.ReactNode;
  label: string;
  description: string;
  link: string;
  color: string;
}

const actions: ActionItem[] = [
  {
    icon: <Camera size={22} />,
    label: '体态分析',
    description: '拍照分析体态',
    link: '/analyze',
    color: 'bg-blue-600',
  },
  {
    icon: <Dumbbell size={22} />,
    label: '开始训练',
    description: '执行训练方案',
    link: '/workout',
    color: 'bg-purple-600',
  },
  {
    icon: <Apple size={22} />,
    label: '饮食记录',
    description: '记录今日饮食',
    link: '/nutrition',
    color: 'bg-green-600',
  },
  {
    icon: <Bot size={22} />,
    label: 'AI 教练',
    description: '咨询健身问题',
    link: '/chat',
    color: 'bg-orange-600',
  },
];

export default function QuickActions() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {actions.map((action) => (
        <Link key={action.link} href={action.link} className="block group">
          <div className="bg-white rounded-2xl border border-primary-200 p-5 hover:shadow-sm transition-all text-center">
            <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center mx-auto mb-3 text-white group-hover:scale-105 transition-transform`}>
              {action.icon}
            </div>
            <div className="font-semibold text-primary-800 mb-0.5 text-sm">{action.label}</div>
            <div className="text-xs text-primary-300">{action.description}</div>
          </div>
        </Link>
      ))}
    </div>
  );
}
