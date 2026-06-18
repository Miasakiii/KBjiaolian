'use client';

import { useEffect, useState } from 'react';

interface ServiceWorkerState {
  /** 是否已注册成功 */
  isRegistered: boolean;
  /** 是否有新版本等待安装 */
  hasUpdate: boolean;
  /** 是否离线 */
  isOffline: boolean;
  /** 应用新版本（刷新页面） */
  applyUpdate: () => void;
}

/**
 * Service Worker 注册与更新检测
 *
 * 功能：
 * - 注册 SW
 * - 检测新版本
 * - 监听在线/离线状态
 * - 提供 applyUpdate() 触发 skipWaiting + 刷新
 */
export function useServiceWorker(): ServiceWorkerState {
  const [isRegistered, setIsRegistered] = useState(false);
  const [hasUpdate, setHasUpdate] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    // 仅在生产环境注册 SW
    if (
      typeof window === 'undefined' ||
      !('serviceWorker' in navigator) ||
      process.env.NODE_ENV !== 'production'
    ) {
      return;
    }

    // 注册 Service Worker
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        setIsRegistered(true);

        // 检测是否有等待中的 SW（新版本）
        if (registration.waiting) {
          setHasUpdate(true);
          setWaitingWorker(registration.waiting);
        }

        // 监听新 SW 安装完成
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (
              newWorker.state === 'installed' &&
              navigator.serviceWorker.controller
            ) {
              // 新版本已安装，但当前页面还在用旧版本
              setHasUpdate(true);
              setWaitingWorker(newWorker);
            }
          });
        });

        // 每小时检查一次更新
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000);
      })
      .catch((err) => {
        console.warn('[SW] 注册失败:', err);
      });

    // 监听控制器变化（skipWaiting 后触发）
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload();
    });
  }, []);

  // 监听在线/离线状态
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    setIsOffline(!navigator.onLine);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const applyUpdate = () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    }
  };

  return { isRegistered, hasUpdate, isOffline, applyUpdate };
}
