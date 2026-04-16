'use client';

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';

import { cn } from '@/libs/class-helpers';

export interface CustomSwiperState {
  currentPage: number;
  totalPages: number;
  enablePrev: boolean;
  enableNext: boolean;
}

export interface CustomSwiperRef {
  prev: () => void;
  next: () => void;
  goTo: (page: number) => void;
  getState: () => CustomSwiperState;
}

interface CustomSwiperProps<T> {
  items: T[];
  renderItem: (
    item: T,
    index: number,
    meta: { isVisible: boolean; page: number },
  ) => React.ReactNode;
  getItemKey?: (item: T, index: number) => React.Key;
  columns?: number;
  lines?: number;
  /** 列间距（建议列间距小于容器 padding，比如容器组有间距是12px，列间距建议为6或者8） */
  gap?: number;
  /** 溢出模式 */
  overflowMode?: 'normal' | 'peek';
  /** peek 模式下用于抵消外层横向 padding 的值（单位 px） */
  peekPaddingX?: number;
  className?: string;
  itemClassName?: string;
  lazy?: boolean;
  lazyRootMargin?: string;
  onStateChange?: (state: CustomSwiperState) => void;
}

function clamp(num: number, min: number, max: number) {
  if (num < min) return min;
  if (num > max) return max;
  return num;
}

function CustomSwiperInner<T>(
  {
    items,
    renderItem,
    getItemKey,
    columns = 3,
    lines = 1,
    gap = 6,
    overflowMode = 'normal',
    className,
    itemClassName,
    lazy = true,
    lazyRootMargin = '0px 20%',
    peekPaddingX = 12,
    onStateChange,
  }: CustomSwiperProps<T>,
  ref: React.ForwardedRef<CustomSwiperRef>,
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const elementToIndex = useRef(new Map<HTMLDivElement, number>());
  const isTouchScroll = useRef(false);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const itemsPerPage = columns * lines;
  const totalPages = Math.ceil(items.length / itemsPerPage);

  const [currentPage, setCurrentPage] = useState(0);
  const [visibleIndices, setVisibleIndices] = useState<Set<number>>(() => {
    const set = new Set<number>();
    for (let i = 0; i < Math.min(itemsPerPage, items.length); i++) set.add(i);
    return set;
  });

  const enablePrev = currentPage > 0;
  const enableNext = currentPage < totalPages - 1;
  const usePeekMode = overflowMode === 'peek';

  const swiperState = useMemo<CustomSwiperState>(
    () => ({ currentPage, totalPages, enablePrev, enableNext }),
    [currentPage, totalPages, enablePrev, enableNext],
  );

  useEffect(() => {
    onStateChange?.(swiperState);
  }, [onStateChange, swiperState]);

  useEffect(() => {
    setCurrentPage((prev) => {
      if (totalPages === 0) return 0;
      return clamp(prev, 0, totalPages - 1);
    });
  }, [totalPages]);

  useEffect(() => {
    if (!lazy) return;
    const container = containerRef.current;
    if (!container || items.length === 0) return;

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
        rootMargin: lazyRootMargin,
        threshold: 0,
      },
    );

    const refs = itemRefs.current;
    for (let i = 0; i < items.length; i++) {
      const el = refs[i];
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [items.length, lazy, lazyRootMargin]);

  const syncCurrentPage = useCallback(() => {
    if (!isTouchScroll.current) return;
    isTouchScroll.current = false;

    const container = containerRef.current;
    if (!container || totalPages === 0) return;

    const paddingLeft = parseInt(getComputedStyle(container).paddingLeft);
    const paddingRight = parseInt(getComputedStyle(container).paddingRight);
    const containerRect = container.getBoundingClientRect();
    const containerPadding = paddingLeft + paddingRight;
    const containerWidth = usePeekMode
      ? containerRect.width - containerPadding
      : containerRect.width;
    const scrollLeft = container.scrollLeft;
    const maxScrollLeft = Math.max(0, container.scrollWidth - containerWidth - containerPadding);
    const nextPage =
      scrollLeft >= maxScrollLeft
        ? totalPages - 1
        : clamp(Math.floor(scrollLeft / containerWidth), 0, totalPages - 1);

    setCurrentPage(nextPage);
  }, [totalPages, usePeekMode]);

  const scrollToPage = useCallback(
    (page: number) => {
      if (totalPages === 0) return;
      const safePage = clamp(page, 0, totalPages - 1);
      const start = safePage * itemsPerPage;
      const end = Math.min(start + itemsPerPage, items.length);

      // 点击翻页时提前标记目标页，避免切换后短暂白块。
      setVisibleIndices((prev) => {
        const next = new Set(prev);
        for (let i = start; i < end; i++) next.add(i);
        return next;
      });

      const el = itemRefs.current[start];
      if (el) {
        el.scrollIntoView({
          behavior: 'smooth',
          inline: 'start',
          block: 'nearest',
        });
      }
      setCurrentPage(safePage);
    },
    [items.length, itemsPerPage, totalPages],
  );

  const handlePrev = useCallback(() => {
    if (!enablePrev) return;
    scrollToPage(Math.max(currentPage - 1, 0));
  }, [currentPage, enablePrev, scrollToPage]);

  const handleNext = useCallback(() => {
    if (!enableNext) return;
    scrollToPage(Math.min(currentPage + 1, totalPages - 1));
  }, [currentPage, enableNext, scrollToPage, totalPages]);

  useImperativeHandle(
    ref,
    () => ({
      prev: handlePrev,
      next: handleNext,
      goTo: scrollToPage,
      getState: () => swiperState,
    }),
    [handleNext, handlePrev, scrollToPage, swiperState],
  );

  useEffect(() => {
    return () => {
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
    };
  }, []);

  const handleScroll = () => {
    isTouchScroll.current = true;
    if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
    scrollTimerRef.current = setTimeout(syncCurrentPage, 80);
  };

  return (
    <div data-name="custom-swiper" className={className}>
      {/* no-scrollbar -mx-3 grid snap-x snap-mandatory scroll-pl-3 grid-flow-col overflow-x-auto overflow-y-hidden scroll-smooth px-3 */}
      <div
        ref={containerRef}
        className={cn(
          'no-scrollbar grid snap-x snap-mandatory grid-flow-col overflow-x-auto overflow-y-hidden scroll-smooth',
          // ⚠️ 具体情况需要根据外出容器的 padding 决定
          // 比如页面间距是 px-3，那么这里就是 “-mx-3 scroll-pl-3 px-3”
          // 比如页面间距是 px-6，那么这里就是 “-mx-6 scroll-pl-6 px-6”
          // 通过 peekPaddingX 动态抵消外层横向 padding。
          usePeekMode ? '-mx-3 scroll-pl-3 px-3' : '',
        )}
        style={{
          gap,
          gridAutoColumns: `calc((100% - ${gap * (columns - 1)}px) / ${columns})`,
          gridTemplateRows: `repeat(${lines}, auto)`,
          // ...(usePeekMode
          //   ? {
          //       marginLeft: -peekPaddingX,
          //       marginRight: -peekPaddingX,
          //       paddingLeft: peekPaddingX,
          //       paddingRight: peekPaddingX,
          //       scrollPaddingLeft: peekPaddingX,
          //       // scrollPaddingRight: peekPaddingX,
          //     }
          //   : undefined),
        }}
        onTouchStart={() => (isTouchScroll.current = true)}
        onWheel={() => (isTouchScroll.current = true)}
        onScroll={handleScroll}
        onScrollEnd={syncCurrentPage}
      >
        {items.map((item, index) => {
          const isVisible = !lazy || visibleIndices.has(index);
          return (
            <div
              key={getItemKey ? getItemKey(item, index) : index}
              ref={(el) => {
                if (el) {
                  itemRefs.current[index] = el;
                  elementToIndex.current.set(el, index);
                } else {
                  itemRefs.current[index] = null;
                }
              }}
              className={cn('shrink-0 snap-start', itemClassName)}
            >
              {renderItem(item, index, { isVisible, page: Math.floor(index / itemsPerPage) })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const CustomSwiper = forwardRef(CustomSwiperInner) as <T>(
  props: CustomSwiperProps<T> & { ref?: React.Ref<CustomSwiperRef> },
) => React.ReactElement;

export default CustomSwiper;
