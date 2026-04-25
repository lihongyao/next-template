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
  // 数据源，可传入范型指定 item 类型
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
  // 列间距（建议列间距小于容器 padding，比如容器间距是12px，列间距建议为6或者8，peek 模式才看得到效果）
  gap?: number;
  // 溢出模式 normal - 默认不溢出，peek - 溢出一点点
  overflowMode?: 'normal' | 'peek';
  // peek 模式下用于抵消外层横向 padding 的值（单位 px），如果外层 padding 左右是 12，那么这里就传 12
  peekPaddingX?: number;
  // 自定义容器类名
  className?: string;
  // 自定义元素类名
  itemClassName?: string;
  // 是否懒加载
  lazy?: boolean;
  // 懒加载阈值
  lazyRootMargin?: string;
  // 状态回调
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
  const dragRef = useRef<{
    isDragging: boolean;
    isActive: boolean;
    pointerId: number | null;
    startClientX: number;
  }>({
    isDragging: false,
    isActive: false,
    pointerId: null,
    startClientX: 0,
  });
  const [isMouseDragging, setIsMouseDragging] = useState(false);
  const supportsPointerEvents = typeof window !== 'undefined' && 'PointerEvent' in window;

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
  // renderItem 里的 isVisible 据此决定要不要渲染重内容，只增不减，滑过去露过面的格子保持为已可见。
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
          'cursor-grab',
          isMouseDragging ? 'cursor-grabbing select-none' : 'select-auto',
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
        onPointerDownCapture={(e) => {
          // 只在 PC 鼠标左键时启用“拖拽滚动”，避免影响触摸滚动。
          if (e.pointerType !== 'mouse') return;
          if (e.button !== 0) return;
          const container = containerRef.current;
          if (!container) return;

          dragRef.current.isDragging = true;
          dragRef.current.isActive = false;
          dragRef.current.pointerId = e.pointerId;
          dragRef.current.startClientX = e.clientX;

          isTouchScroll.current = true;
        }}
        onMouseDownCapture={(e) => {
          // fallback：Safari 等环境 pointer 事件不可用时，走 mouse 事件
          if (supportsPointerEvents) return;
          if (e.button !== 0) return;
          const container = containerRef.current;
          if (!container) return;

          dragRef.current.isDragging = true;
          dragRef.current.isActive = false;
          dragRef.current.pointerId = null;
          dragRef.current.startClientX = e.clientX;
          isTouchScroll.current = true;
        }}
        onPointerMoveCapture={(e) => {
          if (e.pointerType !== 'mouse') return;
          if (!dragRef.current.isDragging) return;
          if (dragRef.current.pointerId !== e.pointerId) return;

          const dx = e.clientX - dragRef.current.startClientX;
          // 只有移动超过阈值，才进入“拖拽翻页模式”，避免影响点击功能
          if (!dragRef.current.isActive) {
            if (Math.abs(dx) < 6) return;
            dragRef.current.isActive = true;
            setIsMouseDragging(true);
            const container = containerRef.current;
            if (container) container.setPointerCapture(e.pointerId);
          }

          // 进入拖拽模式后，阻止默认行为（避免选中文本/触发原生拖拽）
          e.preventDefault();
        }}
        onMouseMoveCapture={(e) => {
          if (supportsPointerEvents) return;
          if (!dragRef.current.isDragging) return;
          const dx = e.clientX - dragRef.current.startClientX;
          if (!dragRef.current.isActive) {
            if (Math.abs(dx) < 6) return;
            dragRef.current.isActive = true;
            setIsMouseDragging(true);
          }
          e.preventDefault();
        }}
        onPointerUpCapture={(e) => {
          if (e.pointerType !== 'mouse') return;
          const container = containerRef.current;
          if (!container) return;
          if (dragRef.current.pointerId !== e.pointerId) return;

          // 如果没有进入拖拽模式，放行 click
          if (!dragRef.current.isActive) {
            dragRef.current.isDragging = false;
            dragRef.current.isActive = false;
            dragRef.current.pointerId = null;
            return;
          }

          const dragDx = e.clientX - dragRef.current.startClientX;

          dragRef.current.isDragging = false;
          dragRef.current.isActive = false;
          dragRef.current.pointerId = null;
          setIsMouseDragging(false);
          try {
            container.releasePointerCapture(e.pointerId);
          } catch {
            // ignore
          }

          // 将鼠标拖拽映射为“翻页”动作：拖动距离越大，可跨多页
          const paddingLeft = parseInt(getComputedStyle(container).paddingLeft, 10);
          const paddingRight = parseInt(getComputedStyle(container).paddingRight, 10);
          const containerRect = container.getBoundingClientRect();
          const containerPadding = paddingLeft + paddingRight;
          const pageWidth = usePeek ? containerRect.width - containerPadding : containerRect.width;

          const threshold = Math.max(36, pageWidth * 0.08);
          if (Math.abs(dragDx) < threshold) {
            // 拖动不足阈值：回到最近的 snap 点
            isTouchScroll.current = true;
            syncCurrentPage();
            return;
          }

          const pages = clamp(
            Math.round(Math.abs(dragDx) / Math.max(1, pageWidth)),
            1,
            Math.max(1, totalPages - 1),
          );

          const dir = dragDx < 0 ? 1 : -1; // 向左拖 => 下一页；向右拖 => 上一页
          scrollToPage(currentPage + dir * pages);
        }}
        onMouseUpCapture={(e) => {
          if (supportsPointerEvents) return;
          const container = containerRef.current;
          if (!container) return;
          if (!dragRef.current.isDragging) return;

          if (!dragRef.current.isActive) {
            dragRef.current.isDragging = false;
            dragRef.current.isActive = false;
            dragRef.current.pointerId = null;
            return;
          }

          const dragDx = e.clientX - dragRef.current.startClientX;
          dragRef.current.isDragging = false;
          dragRef.current.isActive = false;
          dragRef.current.pointerId = null;
          setIsMouseDragging(false);

          const paddingLeft = parseInt(getComputedStyle(container).paddingLeft, 10);
          const paddingRight = parseInt(getComputedStyle(container).paddingRight, 10);
          const containerRect = container.getBoundingClientRect();
          const containerPadding = paddingLeft + paddingRight;
          const pageWidth = usePeek ? containerRect.width - containerPadding : containerRect.width;

          const threshold = Math.max(36, pageWidth * 0.08);
          if (Math.abs(dragDx) < threshold) {
            isTouchScroll.current = true;
            syncCurrentPage();
            return;
          }

          const pages = clamp(
            Math.round(Math.abs(dragDx) / Math.max(1, pageWidth)),
            1,
            Math.max(1, totalPages - 1),
          );
          const dir = dragDx < 0 ? 1 : -1;
          scrollToPage(currentPage + dir * pages);
        }}
        onPointerCancelCapture={(e) => {
          if (e.pointerType !== 'mouse') return;
          const container = containerRef.current;
          if (!container) return;
          if (dragRef.current.pointerId !== e.pointerId) return;

          dragRef.current.isDragging = false;
          dragRef.current.isActive = false;
          dragRef.current.pointerId = null;
          setIsMouseDragging(false);
          try {
            container.releasePointerCapture(e.pointerId);
          } catch {
            // ignore
          }
          isTouchScroll.current = true;
          syncCurrentPage();
        }}
        onMouseLeave={() => {
          if (supportsPointerEvents) return;
          if (!dragRef.current.isDragging) return;
          // 鼠标移出时取消拖拽状态，避免卡住
          dragRef.current.isDragging = false;
          dragRef.current.isActive = false;
          dragRef.current.pointerId = null;
          setIsMouseDragging(false);
        }}
        onDragStartCapture={(e) => {
          // 防止在卡片/图片/链接上拖动时触发浏览器原生拖拽（会导致“拖出链接/图片”，并抢走翻页手势）
          e.preventDefault();
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
              {renderItem(item, index, {
                isVisible,
                page: Math.floor(index / itemsPerPage),
              })}
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
