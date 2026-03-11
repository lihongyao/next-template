'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import { games } from '@/constants/data';

import LazyImg from '../ui/LazyImage';

/** 拷贝到末尾的项数，用于无缝循环（需能填满视口） */
const PREFETCH_COUNT = 5;

export default function Marquee() {
  // refs
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const elementToLogicalIndex = useRef(new Map<HTMLDivElement, number>());

  // 单份数据 + 拷贝前 N 项拼接，实现无缝循环
  const displayData = useMemo(() => [...games, ...games.slice(0, PREFETCH_COUNT)], []);

  // 动画需平移第一份数据的宽度，重置时视觉无缝
  const translatePercent = useMemo(
    () => (games.length / displayData.length) * 100,
    [displayData.length],
  );

  const [visibleLogicalIndices, setVisibleLogicalIndices] = useState<Set<number>>(
    () => new Set(Array.from({ length: Math.min(PREFETCH_COUNT, games.length) }, (_, i) => i)),
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container || games.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        setVisibleLogicalIndices((prev) => {
          const next = new Set(prev);
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            const logicalIndex = elementToLogicalIndex.current.get(entry.target as HTMLDivElement);
            if (logicalIndex !== undefined) next.add(logicalIndex);
          }
          return next.size === prev.size ? prev : next;
        });
      },
      {
        root: container,
        rootMargin: '100px 0px',
        threshold: 0,
      },
    );

    for (let i = 0; i < displayData.length; i++) {
      const el = itemRefs.current[i];
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [displayData.length]);

  const registerRef = (el: HTMLDivElement | null, displayIndex: number) => {
    itemRefs.current[displayIndex] = el;
    if (el) {
      const logicalIndex = displayIndex % games.length;
      elementToLogicalIndex.current.set(el, logicalIndex);
    }
  };

  return (
    // 溢出隐藏，可考虑给 overflow: hidden
    <div ref={containerRef} className="relative flex w-full">
      <div
        className="animate-marquee flex shrink-0 items-center gap-3"
        style={
          {
            '--marquee-translate': `-${translatePercent}%`,
          } as React.CSSProperties
        }
      >
        {displayData.map((game, displayIndex) => {
          const logicalIndex = displayIndex % games.length;
          const isVisible = visibleLogicalIndices.has(logicalIndex);

          return (
            <div
              key={displayIndex}
              ref={(el) => registerRef(el, displayIndex)}
              className="flex aspect-[110/162] h-[110px] flex-none flex-col items-center"
            >
              {isVisible ? (
                <LazyImg
                  className="h-full w-full rounded-lg bg-amber-950 object-cover"
                  src={game.src}
                  blurSrc={game.blurSrc}
                  alt=""
                  loading="eager"
                />
              ) : (
                <div className="h-full w-full rounded-lg bg-amber-950" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
