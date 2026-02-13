'use client';
import { useEffect } from 'react';

type SwipeBackOptions = {
  enabled?: boolean;
  edge?: number; // 左边缘阈值
  distance?: number; // 触发距离
};

export function useSwipeBack(onSwipe: (value: boolean) => void, options: SwipeBackOptions = {}) {
  const { enabled = true, edge = 30, distance = 50 } = options;

  useEffect(() => {
    if (!enabled) return;
    let startX = 0;
    let startY = 0;
    let swiped = false;

    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      startX = t.clientX;
      startY = t.clientY;
      swiped = false;
    };

    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      const dx = Math.abs(t.clientX - startX);
      const dy = Math.abs(t.clientY - startY);

      if (startX < edge && dx > distance && dx > dy) {
        swiped = true;
      }
    };

    const onTouchEnd = () => {
      onSwipe(swiped);
    };

    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [enabled, onSwipe, edge, distance]);
}
