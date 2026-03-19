'use client';

import { useEffect } from 'react';

export function useDetectHistoryNavigation() {
  useEffect(() => {
    let lastIdx = window.history.state?.idx ?? 0;
    console.log('lastIdx', window.history.state);

    const handlePopState = () => {
      const currentIdx = window.history.state?.idx ?? 0;

      if (currentIdx < lastIdx) {
        console.log('后退'); // ⬅️ 后退（包括手机返回手势）
      } else if (currentIdx > lastIdx) {
        console.log('前进'); // ➡️ 前进
      }

      lastIdx = currentIdx;
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);
}
