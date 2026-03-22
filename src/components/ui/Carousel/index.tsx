'use client';
// @See https://www.ui-layouts.com/components/framer-carousel
import { useEffect, useMemo, useRef, useState } from 'react';

import { animate, motion, useMotionValue } from 'framer-motion';

export const items = [
  {
    id: 6,
    url: 'https://images.unsplash.com/photo-1760389005000-bf02bf24f463?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1123',
    title: 'DONM FLY',
  },
  {
    id: 5,
    url: 'https://images.unsplash.com/photo-1761078980679-e89e25fe279b?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=687',
    title: 'SONYPOO',
  },

  {
    id: 3,
    url: 'https://images.unsplash.com/photo-1761882725885-d3d8bd2032d1?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=687',
    title: 'AUSIZE MAM',
  },
  {
    id: 4,
    url: 'https://images.unsplash.com/photo-1761775915848-467e41c1c4db?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=689',
    title: 'RECLKTIKA',
  },
  {
    id: 1,
    url: 'https://images.unsplash.com/photo-1761882835101-02ab45ac0726?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=690',
    title: 'MAXX PHAM',
  },
  {
    id: 2,
    url: 'https://images.unsplash.com/photo-1661980494567-40a5e01b699b?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=685',
    title: 'BOXIEN BAY',
  },
  {
    id: 7,
    url: 'https://images.unsplash.com/photo-1761165307495-56bd564d322f?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=663',
    title: 'Snowy Mountain Highway',
  },
  {
    id: 8,
    url: 'https://images.unsplash.com/photo-1756299792672-157811bf1005?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1074',
    title: 'FOGGY FOLS',
  },
  {
    id: 9,
    url: 'https://images.unsplash.com/photo-1572851899646-a1f69c664e1e?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170',
    title: 'DIM DARKO',
  },
  {
    id: 10,
    url: 'https://images.unsplash.com/photo-1759247178379-0e8eba83a4a6?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=687',
    title: 'BEALIVE',
  },
  {
    id: 11,
    url: 'https://images.unsplash.com/photo-1754968230523-052635c98f99?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=736',
    title: 'DOMEDOM ROME',
  },
  {
    id: 12,
    url: 'https://images.unsplash.com/photo-1643037508102-46fb319979c5?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=764',
    title: 'IKEIMON POVE',
  },
];

type CarouselProps = {
  loop?: boolean;
};

function getNextIndex(next: number, total: number, loop: boolean): number {
  if (total <= 0) return 0;
  if (!loop) return Math.max(0, Math.min(total - 1, next));
  return (next + total) % total;
}

export default function Carousel({ loop = false }: CarouselProps) {
  const total = items.length;
  const canLoop = loop && total > 1;
  // loop 模式下轨道索引: [0]=last克隆, [1..n]=真实项, [n+1]=first克隆
  const [trackIndex, setTrackIndex] = useState<number>(canLoop ? 1 : 0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isInstantJumpRef = useRef(false);

  const x = useMotionValue(0);
  const displayItems = useMemo(
    () => (canLoop ? [items[total - 1], ...items, items[0]] : items),
    [canLoop, total],
  );
  const index = canLoop ? getNextIndex(trackIndex - 1, total, true) : trackIndex;

  useEffect(() => {
    if (!isDragging && containerRef.current) {
      const containerWidth = containerRef.current.offsetWidth || 1;
      const targetX = -trackIndex * containerWidth;

      if (isInstantJumpRef.current) {
        x.set(targetX);
        isInstantJumpRef.current = false;
        return;
      }

      const controls = animate(x, targetX, {
        type: 'spring',
        stiffness: 300,
        damping: 30,
        onComplete: () => {
          if (!canLoop || !containerRef.current) return;
          if (trackIndex === 0) {
            // 从首克隆页回到真实最后一页（下一帧直接 set，不做二次动画）
            isInstantJumpRef.current = true;
            setTrackIndex(total);
          } else if (trackIndex === total + 1) {
            // 从尾克隆页回到真实第一页（下一帧直接 set，不做二次动画）
            isInstantJumpRef.current = true;
            setTrackIndex(1);
          }
        },
      });

      return () => controls.stop();
    }
  }, [trackIndex, x, isDragging, canLoop, total]);

  return (
    <div data-name="carousel" className="w-full">
      <div className="flex flex-col gap-3">
        <div className="relative overflow-hidden rounded-lg" ref={containerRef}>
          <motion.div
            className="flex"
            drag="x"
            dragElastic={0.2}
            dragMomentum={false}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={(e, info) => {
              setIsDragging(false);
              const containerWidth = containerRef.current?.offsetWidth || 1;
              const offset = info.offset.x;
              const velocity = info.velocity.x;

              let nextTrackIndex = trackIndex;

              // If fast swipe, use velocity
              if (Math.abs(velocity) > 500) {
                nextTrackIndex = velocity > 0 ? trackIndex - 1 : trackIndex + 1;
              }
              // Otherwise use offset threshold (30% of container width)
              else if (Math.abs(offset) > containerWidth * 0.3) {
                nextTrackIndex = offset > 0 ? trackIndex - 1 : trackIndex + 1;
              }

              if (!canLoop) {
                nextTrackIndex = Math.max(0, Math.min(total - 1, nextTrackIndex));
              } else {
                nextTrackIndex = Math.max(0, Math.min(total + 1, nextTrackIndex));
              }
              setTrackIndex(nextTrackIndex);
            }}
            style={{ x }}
          >
            {displayItems.map((item, i) => (
              <div key={i} className="h-[400px] w-full shrink-0">
                <img
                  src={item.url}
                  alt={item.title}
                  className="pointer-events-none h-full w-full rounded-lg object-cover select-none"
                  draggable={false}
                />
              </div>
            ))}
          </motion.div>

          {/* Navigation Buttons */}
          <motion.button
            disabled={!loop && index === 0}
            onClick={() =>
              setTrackIndex((i) => {
                if (!canLoop) return Math.max(0, i - 1);
                return i - 1;
              })
            }
            className={`absolute top-1/2 left-4 z-10 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full shadow-lg transition-transform ${
              !loop && index === 0
                ? 'cursor-not-allowed opacity-40'
                : 'bg-white opacity-70 hover:scale-110 hover:opacity-100'
            }`}
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </motion.button>

          {/* Next Button */}
          <motion.button
            disabled={!loop && index === total - 1}
            onClick={() =>
              setTrackIndex((i) => {
                if (!canLoop) return Math.min(total - 1, i + 1);
                return i + 1;
              })
            }
            className={`absolute top-1/2 right-4 z-10 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full shadow-lg transition-transform ${
              !loop && index === total - 1
                ? 'cursor-not-allowed opacity-40'
                : 'bg-white opacity-70 hover:scale-110 hover:opacity-100'
            }`}
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </motion.button>
          {/* Progress Indicator */}
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
            {items.map((_, i) => (
              <button
                key={items[i]?.id ?? items[i]?.url ?? `dot-${i}`}
                onClick={() => setTrackIndex(canLoop ? i + 1 : i)}
                className={`h-2 cursor-pointer rounded-full transition-all ${
                  i === index ? 'w-8 bg-white' : 'w-2 bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
