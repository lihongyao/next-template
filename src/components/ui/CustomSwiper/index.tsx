'use client';

import { useEffect, useRef, useState } from 'react';

import { games } from '@/constants/data';
import { cn } from '@/libs/class-helpers';

import Button from '../Button';
import LazyImg from '../LazyImage';

interface CustomSwiperProps {
  /** 列数 */
  columns?: number;
  /** 行数 */
  lines?: number;
  /** 列间距（建议列间距小于容器 padding，比如容器组有间距是12px，列间距建议为6或者8） */
  gap?: number;
  /** 是否溢出容器显示 */
  isOver?: boolean;
}

export default function CustomSwiper({
  columns = 3,
  gap = 6,
  lines = 1,
  isOver,
}: CustomSwiperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const elementToIndex = useRef(new Map<HTMLDivElement, number>());
  const isTouchScroll = useRef(false);

  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = columns * lines;
  const totalPages = Math.ceil(games.length / itemsPerPage);

  /** 进入过视口的 item 下标，只增不减，用于懒加载内容 */
  const [visibleIndices, setVisibleIndices] = useState<Set<number>>(() => {
    const set = new Set<number>();
    for (let i = 0; i < Math.min(itemsPerPage, games.length); i++) set.add(i);
    return set;
  });

  const [enablePrev, setEnablePrev] = useState(currentPage > 0);
  const [enableNext, setEnableNext] = useState(currentPage < totalPages - 1);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || games.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        setVisibleIndices((prev) => {
          const next = new Set(prev);
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            const index = elementToIndex.current.get(entry.target as HTMLDivElement);
            if (index !== undefined) next.add(index);
          }
          return next.size === prev.size ? prev : next;
        });
      },
      {
        root: container,
        rootMargin: '100% 0px',
        threshold: 0,
      },
    );

    const refs = itemRefs.current;
    for (let i = 0; i < games.length; i++) {
      const el = refs[i];
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [games.length]);

  const syncCurrentPage = () => {
    // 只在触摸滚动时同步
    if (!isTouchScroll.current) return;
    isTouchScroll.current = false;
    // 边界判断
    const container = containerRef.current;
    if (!container || totalPages === 0) return;
    // 计算当前页
    const paddingLeft = parseInt(getComputedStyle(container).paddingLeft);
    const paddingRight = parseInt(getComputedStyle(container).paddingRight);
    const containerRect = container.getBoundingClientRect();
    const containerPadding = paddingLeft + paddingRight;
    const containerWidth = isOver ? containerRect.width - containerPadding : containerRect.width;
    const scrollLeft = container.scrollLeft;
    const maxScrollLeft = container.scrollWidth - containerWidth - containerPadding;
    const currentPage =
      scrollLeft >= maxScrollLeft ? totalPages - 1 : Math.floor(scrollLeft / containerWidth);

    setCurrentPage(currentPage);
    setEnablePrev(scrollLeft > 0);
    setEnableNext(scrollLeft < maxScrollLeft);
  };

  const scrollToPage = (page: number) => {
    const index = page * itemsPerPage;
    const el = itemRefs.current[index];

    if (!el) return;

    el.scrollIntoView({
      behavior: 'smooth',
      inline: 'start',
      block: 'nearest',
    });

    setCurrentPage(page);
    setEnablePrev(page > 0);
    setEnableNext(page < totalPages - 1);
  };

  const handleNext = () => {
    if (!enableNext) return;
    const next = Math.min(currentPage + 1, totalPages - 1);
    scrollToPage(next);
  };

  const handlePrev = () => {
    if (!enablePrev) return;
    const prev = Math.max(currentPage - 1, 0);
    scrollToPage(prev);
  };

  return (
    <div data-name="custom-swiper">
      <header className="mb-3 flex items-center justify-between">
        <h1 className="text-white">
          游戏列表 - {currentPage + 1}/{totalPages}
        </h1>

        <div className="flex items-center gap-2">
          <Button
            className={cn(!enablePrev && 'cursor-not-allowed opacity-35')}
            onClick={handlePrev}
            disabled={!enablePrev}
          >
            上一页
          </Button>

          <Button
            className={cn(!enableNext && 'cursor-not-allowed opacity-35')}
            onClick={handleNext}
            disabled={!enableNext}
          >
            下一页
          </Button>
        </div>
      </header>

      {/* no-scrollbar -mx-3 grid snap-x snap-mandatory scroll-pl-3 grid-flow-col overflow-x-auto overflow-y-hidden scroll-smooth px-3 */}
      <div
        ref={containerRef}
        className={cn(
          `no-scrollbar grid snap-x snap-mandatory grid-flow-col overflow-x-auto overflow-y-hidden scroll-smooth`,
          // ⚠️ 具体情况需要根据外出容器的 padding 决定
          // 比如页面间距是 px-3，那么这里就是 “-mx-3 scroll-pl-3 px-3”
          // 比如页面间距是 px-6，那么这里就是 “-mx-6 scroll-pl-6 px-6”
          isOver ? '-mx-3 scroll-pl-3 px-3' : '',
        )}
        style={{
          gap,
          gridAutoColumns: `calc((100% - ${gap * (columns - 1)}px) / ${columns})`,
          gridTemplateRows: `repeat(${lines}, auto)`,
        }}
        onTouchStart={() => (isTouchScroll.current = true)}
        onWheel={() => (isTouchScroll.current = true)}
        onScrollEnd={syncCurrentPage}
      >
        {games.map((item, index) => {
          const isVisible = visibleIndices.has(index);
          return (
            <div
              key={index}
              ref={(el) => {
                itemRefs.current[index] = el;
                if (el) elementToIndex.current.set(el, index);
              }}
              className="aspect-[200/267] shrink-0 snap-start overflow-hidden rounded-md bg-gray-800"
            >
              {isVisible && (
                <LazyImg
                  className="h-full w-full object-cover"
                  src={item.src}
                  blurSrc={item.blurSrc}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
