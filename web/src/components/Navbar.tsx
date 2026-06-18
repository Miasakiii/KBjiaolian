'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getUser, logout, isAuthenticated, isGuest as checkIsGuest } from '@/lib/auth';
import { Dumbbell, User, LogOut } from 'lucide-react';

export default function Navbar() {
  const [user, setUser] = useState<{ nickname: string } | null>(null);
  const [guest, setGuest] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setUser(getUser());
    setGuest(checkIsGuest());
  }, []);

  const handleLogout = () => {
    logout();
  };

  const loggedIn = !!user || guest;

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-gray-900 rounded-lg flex items-center justify-center">
            <Dumbbell size={16} className="text-white" />
          </div>
          <span className="font-bold text-gray-900">KB教练</span>
        </Link>

        {/* 已登录：显示功能导航 */}
        {mounted && loggedIn ? (
          <div className="flex items-center gap-5">
            <Link href="/analyze" className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors">
              分析
            </Link>
            <Link href="/plans" className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors">
              方案
            </Link>
            <Link href="/exercises" className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors">
              动作库
            </Link>
            <Link href="/nutrition" className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors">
              饮食
            </Link>
            <Link href="/chat" className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors">
              AI
            </Link>
            <div className="h-5 w-px bg-gray-200" />
            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/profile"
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <User size={15} />
                  <span>{user.nickname}</span>
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  title="退出"
                >
                  <LogOut size={15} />
                </button>
              </div>
            ) : guest ? (
              <div className="flex items-center gap-2">
                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
                  游客
                </span>
                <Link
                  href="/login"
                  className="px-3 py-1.5 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
                >
                  登录
                </Link>
              </div>
            ) : null}
          </div>
        ) : mounted ? (
          /* 未登录：简洁导航 */
          <div className="flex items-center gap-3">
            <Link href="/about" className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors">
              关于
            </Link>
            <Link href="/pricing" className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors">
              定价
            </Link>
            <Link href="/login" className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
              登录
            </Link>
          </div>
        ) : null}
      </div>
    </nav>
  );
}
