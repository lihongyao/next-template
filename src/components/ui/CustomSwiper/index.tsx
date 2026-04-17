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

/**
 * 自定义 swiper state
 */
export interface CustomSwiperState {
  // 当前页
  currentPage: number;
  // 总页数
  totalPages: number;
  // 是否允许上一页
  enablePrev: boolean;
  // 是否允许下一页
  enableNext: boolean;
}

/**
 * 自定义 swiper ref
 */
export interface CustomSwiperRef {
  // 上一页
  prev: () => void;
  // 下一页
  next: () => void;
  // 跳转到指定页
  goTo: (page: number) => void;
  // 获取当前状态
  getState: () => CustomSwiperState;
}

/**
 * 自定义 swiper props
 */
interface CustomSwiperProps<T> {
  // 数据源
  items: T[];
  // 渲染函数
  renderItem: (
    item: T,
    index: number,
    meta: { isVisible: boolean; page: number },
  ) => React.ReactNode;
  // 列数
  columns?: number;
  // 行数
  lines?: number;
  // 列间距（建议列间距小于容器 padding，比如容器间距是12px，列间距建议为6或者8）
  gap?: number;
  // 溢出模式 normal - 默认不溢出，peek - 溢出一点点
  overflowMode?: 'normal' | 'peek';
  // peek 模式下用于抵消外层横向 padding 的值（单位 px），如果外层 padding 左右是 12，那么这里就传 12
  peekPaddingX?: number;
  // 类名
  className?: string;
  // item 类名
  itemClassName?: string;
  // 是否懒加载
  lazy?: boolean;
  // 懒加载距离
  lazyRootMargin?: string;
  // 懒加载回调
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
    columns = 3,
    lines = 1,
    gap = 8,
    overflowMode = 'normal',
    className,
    itemClassName,
    lazy = true,
    lazyRootMargin = '20%',
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
  const usePeek = overflowMode === 'peek';

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

  // lazy：用 IntersectionObserver 看每个格子是否和横向滚动区有交集，有则记入 visibleIndices，
  // renderItem 里的 isVisible 据此决定要不要渲染重内容。只增不减，滑过去露过面的格子保持为已可见。
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
            // entry.target 是格子 DOM，从 map 取回 items 下标
            const index = elementToIndex.current.get(entry.target as HTMLDivElement);
            if (index !== undefined) next.add(index);
          }
          // 没新下标时沿用 prev，少一次无意义重渲染
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

    const paddingLeft = parseInt(getComputedStyle(container).paddingLeft, 10);
    const paddingRight = parseInt(getComputedStyle(container).paddingRight, 10);
    const containerRect = container.getBoundingClientRect();
    const containerPadding = paddingLeft + paddingRight;
    const containerWidth = usePeek ? containerRect.width - containerPadding : containerRect.width;
    const scrollLeft = container.scrollLeft;
    const maxScrollLeft = Math.max(0, container.scrollWidth - containerWidth - containerPadding);
    const nextPage =
      scrollLeft >= maxScrollLeft
        ? totalPages - 1
        : clamp(Math.floor(scrollLeft / containerWidth), 0, totalPages - 1);

    setCurrentPage(nextPage);
  }, [totalPages, usePeek]);

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
          // 具体情况需要根据外层容器的 padding 决定（也就是页面间距）：
          // 1. 如果页面间距是 px-3，那么这里就是 -mx-3 scroll-pl-3 px-3
          // 2. 如果页面间距是 px-6，那么这里就是 -mx-6 scroll-pl-6 px-6
          // 通过 peekPaddingX 动态抵消外层横向 padding。
          // usePeek ? "-mx-3 scroll-pl-3 px-3" : "",
        )}
        style={{
          gap,
          gridAutoColumns: `calc((100% - ${gap * (columns - 1)}px) / ${columns})`,
          gridTemplateRows: `repeat(${lines}, auto)`,
          ...(usePeek
            ? {
                marginInline: -peekPaddingX,
                scrollPaddingLeft: peekPaddingX,
                paddingInline: peekPaddingX,
              }
            : undefined),
        }}
        onTouchStart={() => {
          isTouchScroll.current = true;
        }}
        onWheel={() => {
          isTouchScroll.current = true;
        }}
        onScroll={handleScroll}
        onScrollEnd={syncCurrentPage}
      >
        {items.map((item, index) => {
          const isVisible = !lazy || visibleIndices.has(index);
          return (
            <div
              key={index}
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
