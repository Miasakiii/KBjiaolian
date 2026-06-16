'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { syncLocalToCloud } from '@/lib/cloudStorage';

// 不需要认证的页面
const PUBLIC_PATHS = ['/login', '/about'];

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (isLoading) return;

    const isPublicPath = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

    if (!isPublicPath && !isAuthenticated) {
      // 未登录且访问受保护页面，跳转到登录页
      router.push('/login');
    } else {
      setChecking(false);

      // 如果已登录，尝试同步本地数据到云端
      if (isAuthenticated) {
        syncLocalToCloud().catch(console.warn);
      }
    }
  }, [pathname, router, isAuthenticated, isLoading]);

  // 正在检查登录状态时显示加载
  if ((checking || isLoading) && !PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-primary-600">加载中...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
