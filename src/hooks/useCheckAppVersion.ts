'use client';

import { useEffect } from 'react';

import { useRouter } from 'next/navigation';

import { CURRENT_VERSION } from '@/constants';

export function useCheckAppVersion() {
  const router = useRouter();
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;

    let timer: number | null = null;
    let interval = 60_000; // 初始 1 分钟

    async function checkVersion() {
      // 页面可见才检测，避免内存泄露
      if (document.visibilityState !== 'visible') {
        schedule();
        return;
      }

      try {
        const res = await fetch('/api/version', {
          cache: 'no-store',
        });
        const { version } = await res.json();
        console.log('当前版本：', CURRENT_VERSION, '最新版本：', version);

        if (version !== CURRENT_VERSION) {
          console.log('版本已更新，即将刷新页面...');
          // window.dispatchEvent(new Event('app-version-update'));
          router.refresh();
          return;
        }
        // 没更新 → 延长检测间隔（指数退避）
        interval = Math.min(interval * 1.5, 10 * 60_000);
      } catch {
        // 网络错误 → 快速重试
        interval = 5_000;
      }

      schedule();
    }

    function schedule() {
      timer = window.setTimeout(() => {
        // 在浏览器空闲时检测
        if ('requestIdleCallback' in window) {
          (window as any).requestIdleCallback(checkVersion);
        } else {
          checkVersion();
        }
      }, interval);
    }

    schedule();

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, []);
}
