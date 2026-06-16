'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getUser, logout, isAuthenticated } from '@/lib/auth';

export default function Navbar() {
  const [user, setUser] = useState<{ nickname: string } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setUser(getUser());
  }, []);

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-primary-100 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
            <span className="text-lg">💪</span>
          </div>
          <span className="font-bold text-primary-800 text-lg">KB教练</span>
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/analyze" className="text-primary-600 hover:text-primary-800 font-medium transition-colors">
            体态分析
          </Link>
          <Link href="/plans" className="text-primary-600 hover:text-primary-800 font-medium transition-colors">
            训练方案
          </Link>
          <Link href="/nutrition" className="text-primary-600 hover:text-primary-800 font-medium transition-colors">
            饮食记录
          </Link>
          <Link href="/chat" className="text-primary-600 hover:text-primary-800 font-medium transition-colors">
            AI 教练
          </Link>
          <Link href="/workouts" className="text-primary-600 hover:text-primary-800 font-medium transition-colors">
            训练记录
          </Link>
          <Link href="/history" className="text-primary-600 hover:text-primary-800 font-medium transition-colors">
            分析历史
          </Link>
          <Link href="/progress" className="text-primary-600 hover:text-primary-800 font-medium transition-colors">
            进度趋势
          </Link>
          <Link href="/settings" className="text-primary-600 hover:text-primary-800 font-medium transition-colors">
            设置
          </Link>
          <Link href="/about" className="text-primary-600 hover:text-primary-800 font-medium transition-colors">
            关于
          </Link>
          <div className="h-6 w-px bg-primary-200" />
          {mounted && user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-primary-700">
                {user.nickname}
              </span>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 text-sm text-primary-600 hover:text-primary-800 hover:bg-primary-50 rounded-lg transition-colors"
              >
                退出
              </button>
            </div>
          ) : mounted ? (
            <Link href="/login" className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors shadow-sm">
              登录
            </Link>
          ) : null}
        </div>
      </div>
    </nav>
  );
}
