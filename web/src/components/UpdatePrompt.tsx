'use client';

import { useEffect, useRef } from 'react';
import { useServiceWorker } from '@/hooks/useServiceWorker';
import { toast } from 'sonner';

/**
 * Service Worker 更新提示 + 离线状态提示
 *
 * 放置在 layout 中，全局生效：
 * - 离线时显示横幅提示
 * - 有新版本时显示 toast（仅触发一次）
 */
export default function UpdatePrompt() {
  const { hasUpdate, isOffline, applyUpdate } = useServiceWorker();
  const toastShownRef = useRef(false);

  useEffect(() => {
    if (hasUpdate && !toastShownRef.current) {
      toastShownRef.current = true;
      toast('发现新版本', {
        description: '点击更新以获取最新功能',
        action: {
          label: '更新',
          onClick: applyUpdate,
        },
        duration: Infinity,
      });
    }
  }, [hasUpdate, applyUpdate]);

  if (!isOffline) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-80">
      <div className="bg-gray-800 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3">
        <span className="text-lg">📡</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">离线模式</p>
          <p className="text-xs text-gray-300">部分功能可能不可用</p>
        </div>
      </div>
    </div>
  );
}
