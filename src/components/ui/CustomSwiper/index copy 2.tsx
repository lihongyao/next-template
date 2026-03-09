import { useCallback, useEffect, useRef, useState } from 'react';

import { games } from '@/constants/data';
import { cn } from '@/libs/class-helpers';

import Button from '../Button';
import LazyImg from '../LazyImage';

/** 判定为「快速滑动」的最小速度 (px/ms) */
const FLICK_VELOCITY_THRESHOLD = 0.25;

interface CustomSwiperProps {
  /**  一屏显示几列，默认 3 */
  columns?: number;
  /** 列间距，默认 12px */
  gap?: number;
}

export default function CustomSwiper({ columns = 3, gap = 6 }: CustomSwiperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(0);

  // 拖拽/惯性逻辑用 ref
  const startScrollLeftRef = useRef(0);
  const startXRef = useRef(0);
  const lastXRef = useRef(0);
  const lastTimeRef = useRef(0);
  const isProgrammaticScrollRef = useRef(false);
  const scrollEndTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** 本次手势是否为「快速滑动」；仅在 scrollEnd 时用，避免 pointerUp 时误判导致闪动 */
  const wasFlickRef = useRef(true);

  const totalPages = Math.ceil(games.length / columns);
  const itemCount = games.length;

  /** 单格宽度（含 gap 的步长 = itemWidth + gap） */
  const getStep = useCallback(() => {
    const el = containerRef.current;
    if (!el) return 0;
    const style = window.getComputedStyle(el);
    const paddingLeft = parseFloat(style.paddingLeft) || 0;
    const paddingRight = parseFloat(style.paddingRight) || 0;
    const clientWidth = el.clientWidth;
    const itemWidth = (clientWidth - paddingLeft - paddingRight - gap * (columns - 1)) / columns;
    return itemWidth + gap;
  }, [columns, gap]);

  /** 根据 scrollLeft 计算当前应对齐的元素下标；接近末尾时视为最后一格（避免最后一页不足一屏时页码回跳） */
  const getIndexFromScrollLeft = useCallback(
    (scrollLeft: number, maxScrollLeft?: number) => {
      const step = getStep();
      if (step <= 0) return 0;
      if (maxScrollLeft !== undefined && scrollLeft >= maxScrollLeft - step / 2) {
        return itemCount - 1;
      }
      const index = Math.round(scrollLeft / step);
      return Math.max(0, Math.min(index, itemCount - 1));
    },
    [getStep, itemCount],
  );

  /** 滚动到指定元素位置 */
  const scrollToIndex = useCallback(
    (index: number) => {
      const el = containerRef.current;
      if (!el) return;
      const step = getStep();
      const targetScrollLeft = Math.min(index * step, el.scrollWidth - el.clientWidth);
      isProgrammaticScrollRef.current = true;
      el.scrollTo({ left: Math.max(0, targetScrollLeft), behavior: 'smooth' });
      setCurrentPage(Math.floor(index / columns));
    },
    [getStep, columns],
  );

  /** 滚动结束（含惯性结束）：用最终惯性距离统一做吸附，避免 pointerUp 误判导致闪动 */
  const handleScrollEnd = useCallback(() => {
    if (isProgrammaticScrollRef.current) {
      isProgrammaticScrollRef.current = false;
      return;
    }
    const el = containerRef.current;
    if (!el) return;

    const step = getStep();
    const maxScrollLeft = el.scrollWidth - el.clientWidth;
    const startScrollLeft = startScrollLeftRef.current;
    const finalScrollLeft = el.scrollLeft;
    const totalDelta = finalScrollLeft - startScrollLeft;
    const itemWidth = Math.max(0, step - gap);
    const halfItem = itemWidth / 2;

    let targetScrollLeft: number;

    if (wasFlickRef.current) {
      // 快速滑动：按最终位置吸附到最近元素（末尾不足一屏时按最后一格算）
      const index = getIndexFromScrollLeft(finalScrollLeft, maxScrollLeft);
      targetScrollLeft = Math.max(0, Math.min(maxScrollLeft, index * step));
    } else {
      // 慢速拖拽：用精确的惯性结束距离做半格判断
      if (Math.abs(totalDelta) > halfItem) {
        const oneStep = Math.sign(totalDelta) * step;
        targetScrollLeft = Math.max(0, Math.min(maxScrollLeft, startScrollLeft + oneStep));
      } else {
        targetScrollLeft = startScrollLeft;
      }
    }

    wasFlickRef.current = true;
    el.scrollTo({ left: targetScrollLeft, behavior: 'smooth' });
    const snapIndex = getIndexFromScrollLeft(targetScrollLeft, maxScrollLeft);
    setCurrentPage(Math.floor(snapIndex / columns));
  }, [getStep, getIndexFromScrollLeft, columns]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return undefined;
    if ('onscrollend' in window) {
      el.addEventListener('scrollend', handleScrollEnd);
      return () => el.removeEventListener('scrollend', handleScrollEnd);
    }
    const onScroll = () => {
      if (scrollEndTimerRef.current) clearTimeout(scrollEndTimerRef.current);
      scrollEndTimerRef.current = setTimeout(handleScrollEnd, 120);
    };
    el.addEventListener('scroll', onScroll);
    return () => {
      el.removeEventListener('scroll', onScroll);
      if (scrollEndTimerRef.current) clearTimeout(scrollEndTimerRef.current);
    };
  }, [handleScrollEnd]);

  /** pointerDown：记录起始 scrollLeft，用于 scrollEnd 时计算惯性距离 */
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    const el = containerRef.current;
    if (!el) return;
    const t = Date.now();
    startScrollLeftRef.current = el.scrollLeft;
    startXRef.current = e.clientX;
    lastXRef.current = e.clientX;
    lastTimeRef.current = t;
    wasFlickRef.current = true;
    (el as HTMLElement & { _swiperPointerId?: number })._swiperPointerId = e.pointerId;
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    const el = containerRef.current;
    if (!el) return;
    const id = (el as HTMLElement & { _swiperPointerId?: number })._swiperPointerId;
    if (id !== undefined && e.pointerId !== id) return;
    lastXRef.current = e.clientX;
    lastTimeRef.current = Date.now();
  }, []);

  /** pointerUp：只标记本次是「快速滑动」还是「慢速拖拽」，不在这里滚动，交给 scrollEnd 用最终惯性距离统一处理 */
  const onPointerUp = useCallback((e: React.PointerEvent) => {
    const el = containerRef.current;
    if (!el) return;
    const id = (el as HTMLElement & { _swiperPointerId?: number })._swiperPointerId;
    if (id !== undefined && e.pointerId !== id) return;
    (el as HTMLElement & { _swiperPointerId?: number })._swiperPointerId = undefined;

    const dt = Math.max(Date.now() - lastTimeRef.current, 1);
    const velocity = (e.clientX - lastXRef.current) / dt;
    wasFlickRef.current = Math.abs(velocity) > FLICK_VELOCITY_THRESHOLD;
  }, []);

  // 点击下一页：滚到目标页的精确位置并标记为程序滚动，避免 scrollEnd 重算导致页码回跳
  const handleNext = () => {
    const el = containerRef.current;
    if (!el) return;
    const nextPage = Math.min(currentPage + 1, totalPages - 1);
    const step = getStep();
    const maxScrollLeft = el.scrollWidth - el.clientWidth;
    const targetScrollLeft = Math.min(nextPage * columns * step, maxScrollLeft);
    isProgrammaticScrollRef.current = true;
    el.scrollTo({ left: Math.max(0, targetScrollLeft), behavior: 'smooth' });
    setCurrentPage(nextPage);
  };

  // 点击上一页
  const handlePrev = () => {
    const el = containerRef.current;
    if (!el) return;
    const prevPage = Math.max(currentPage - 1, 0);
    const step = getStep();
    const targetScrollLeft = prevPage * columns * step;
    isProgrammaticScrollRef.current = true;
    el.scrollTo({ left: Math.max(0, targetScrollLeft), behavior: 'smooth' });
    setCurrentPage(prevPage);
  };

  return (
    <div data-name="custom-swiper">
      <header className="mb-3 flex items-center justify-between">
        <h1 className="text-white">
          游戏列表 - {currentPage + 1}/{totalPages}
        </h1>
        <div className="flex items-center gap-2">
          <Button onClick={handlePrev} disabled={currentPage === 0}>
            上一页
          </Button>
          <Button onClick={handleNext} disabled={currentPage === totalPages - 1}>
            下一页
          </Button>
        </div>
      </header>

      <div
        ref={containerRef}
        className={cn(
          'custom-swiper no-scrollbar -mx-3 grid snap-x snap-mandatory grid-flow-col overflow-x-scroll overflow-y-hidden scroll-smooth px-3',
        )}
        style={{
          gap: gap,
          gridAutoColumns: `calc((100% - ${gap * (columns - 1)}px) / ${columns})`,
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {games.map((item, index) => (
          <div
            key={index}
            className="custom-swiper-item aspect-[200/267] overflow-hidden rounded-md"
          >
            <LazyImg className="h-full w-full object-cover" src={item.src} blurSrc={item.blurSrc} />
          </div>
        ))}
      </div>
    </div>
  );
}
