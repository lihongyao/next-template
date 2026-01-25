'use client';

import { useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';

import { motion } from 'framer-motion';

import { cn } from '@/libs/class-helpers';

export interface ScrollableTabsRef {
  /** 重置滚动位置 */
  resetIndex: () => void;
}

interface ScrollableTabsProps<T = unknown> {
  /** ref */
  ref?: React.Ref<ScrollableTabsRef>;
  /** 容器名称 */
  dataName?: string;
  /** 容器样式 */
  className?: string;
  /** wrapper 样式（可滚动容器） */
  wrapperClassName?: string;
  /** 选项 */
  items: T[];
  /** 默认选中 */
  defaultIndex?: number;
  /** 受控选中 */
  currentIndex?: number;
  /** 是否显示分割线 */
  divider?: boolean;
  /** 分割线样式 */
  dividerClassName?: string;
  /** 是否显示游标 */
  cursor?: boolean;
  /** 游标样式 */
  cursorClassName?: string;
  /** 渲染选项 */
  renderItem: (item: T, index: number, isSelected: boolean) => React.ReactNode;
  /** 选项点击 */
  onItemClick?: (item: T, index: number) => void;
}

export default function ScrollableTabs<T = unknown>({
  dataName,
  className,
  wrapperClassName,
  items,
  currentIndex = 0,
  defaultIndex = 0,
  divider = false,
  dividerClassName,
  cursor = false,
  cursorClassName,
  renderItem,
  onItemClick,
  ref,
}: ScrollableTabsProps<T>) {
  // -- refs
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollStart = useRef(0);
  const isInitialMount = useRef(true); // 标记是否是首次挂载
  const prevIndexRef = useRef(currentIndex); // 记录上一次的 currentIndex
  const isUserInteraction = useRef(false); // 标记是否是用户交互导致的索引变化

  // -- state
  // 优先使用 currentIndex，如果没有则使用 defaultIndex
  const [innerIndex, setInnerIndex] = useState(
    currentIndex !== undefined ? currentIndex : defaultIndex,
  );
  // 游标位置和宽度
  const [cursorStyle, setCursorStyle] = useState<{
    left: number;
    width: number;
  } | null>(null);

  // -- effects
  // 处理 items 变化导致的无效索引
  useEffect(() => {
    if (items.length > 0 && innerIndex >= items.length) {
      setInnerIndex(Math.max(0, items.length - 1));
    }
  }, [items.length, innerIndex]);

  // 处理 currentIndex 变化（路由变化导致）
  useEffect(() => {
    const isCurrentIndexChanged = prevIndexRef.current !== currentIndex;

    if (isCurrentIndexChanged) {
      // currentIndex 变化时（路由变化），标记为非用户交互，直接设置位置（无动画）
      isUserInteraction.current = false;
      setInnerIndex(currentIndex);
      prevIndexRef.current = currentIndex;
    }

    // 首次挂载后，标记为非首次
    if (isInitialMount.current) {
      isInitialMount.current = false;
    }
  }, [currentIndex]);

  // 处理 innerIndex 变化时的滚动
  useEffect(() => {
    // 使用 requestAnimationFrame 确保 DOM 已渲染
    requestAnimationFrame(() => {
      // 首次挂载或非用户交互时（路由变化），使用无动画方式
      // 用户交互时，使用平滑滚动
      const shouldSkipAnimation = isInitialMount.current || !isUserInteraction.current;
      scrollToIndex(innerIndex, shouldSkipAnimation);
    });
  }, [innerIndex]);

  // 更新游标位置和宽度
  useEffect(() => {
    if (!cursor) {
      setCursorStyle(null);
      return;
    }

    const updateCursorStyle = () => {
      const wrapper = wrapperRef.current;
      if (!wrapper) return;

      // 通过 data-index 属性查找选中的 item，避免获取到游标元素
      const selectedItem = wrapper.querySelector(
        `[data-item-index="${innerIndex}"]`,
      ) as HTMLElement;
      if (!selectedItem) return;

      // 使用 offsetLeft 获取相对于 wrapper 的位置（更准确）
      // 因为 wrapper 是 position: relative，游标也是 absolute，所以 offsetLeft 就是相对于 wrapper 的位置
      const left = selectedItem.offsetLeft;
      const width = selectedItem.offsetWidth;

      setCursorStyle({ left, width });
    };

    // 使用 requestAnimationFrame 确保 DOM 已渲染
    const rafId = requestAnimationFrame(() => {
      updateCursorStyle();
    });

    // 监听滚动事件，更新游标位置（当容器滚动时）
    const container = containerRef.current;
    const handleScroll = () => {
      requestAnimationFrame(updateCursorStyle);
    };
    const handleResize = () => {
      requestAnimationFrame(updateCursorStyle);
    };

    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true });
      window.addEventListener('resize', handleResize);

      return () => {
        cancelAnimationFrame(rafId);
        container.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', handleResize);
      };
    }

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [cursor, innerIndex, items]);

  // -- methods
  const scrollToIndex = (index: number, skipAnimation = false) => {
    const container = containerRef.current;
    const wrapper = wrapperRef.current;

    if (!container || !wrapper) return;

    // 边界检查
    if (index < 0 || index >= items.length) return;

    // 使用 data-item-index 属性查找正确的 item，避免获取到游标元素
    const slideEl = wrapper.querySelector(`[data-item-index="${index}"]`) as HTMLElement;
    if (!slideEl) return;

    const containerRect = container.getBoundingClientRect();
    const slideRect = slideEl.getBoundingClientRect();

    const slideCenter =
      slideRect.left - containerRect.left + container.scrollLeft + slideRect.width / 2;

    const targetLeft = slideCenter - container.clientWidth / 2;

    // 如果需要跳过动画（首次挂载或 currentIndex 变化），直接设置位置
    if (skipAnimation) {
      container.scrollLeft = targetLeft;
    } else {
      // 用户交互导致的索引变化，使用平滑滚动
      container.scrollTo({
        left: targetLeft,
        behavior: 'smooth',
      });
    }
  };

  // -- events
  const onItemTap = useCallback(
    (item: T, index: number) => {
      // 拖拽状态下或已经选中，不触发
      if (isDragging.current || innerIndex === index) return;
      // 标记为用户交互，后续滚动会使用平滑动画
      isUserInteraction.current = true;
      setInnerIndex(index);
      onItemClick?.(item, index);
    },
    [innerIndex, onItemClick],
  );

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    const container = containerRef.current;
    if (!container) return;

    isDragging.current = true;
    startX.current = e.clientX;
    scrollStart.current = container.scrollLeft;
    container.classList.add('cursor-grabbing');
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    const container = containerRef.current;
    if (!container || !isDragging.current) return;

    const dx = e.clientX - startX.current;
    container.scrollLeft = scrollStart.current - dx;
  }, []);

  const stopDragging = useCallback(() => {
    isDragging.current = false;
    containerRef.current?.classList.remove('cursor-grabbing');
  }, []);

  // -- expose methods
  useImperativeHandle(
    ref,
    () => ({
      resetIndex: () => setInnerIndex(0),
    }),
    [setInnerIndex],
  );

  return (
    <div
      ref={containerRef}
      data-name={dataName ?? 'ScrollableTabs'}
      className={cn('no-scrollbar cursor-grab overflow-x-auto', className)}
      onMouseDown={onMouseDown}
      onMouseMove={(e) => isDragging.current && onMouseMove(e)}
      onMouseUp={stopDragging}
      onMouseLeave={stopDragging}
    >
      <div className="w-max">
        <div
          ref={wrapperRef}
          className={cn('relative flex w-max items-center select-none', wrapperClassName)}
        >
          {cursor && cursorStyle && (
            <motion.div
              data-name="cursor"
              className={cn(
                'pointer-events-none absolute bottom-0 h-full bg-blue-500',
                cursorClassName,
              )}
              initial={{
                left: cursorStyle.left,
                width: cursorStyle.width,
              }}
              animate={{
                left: cursorStyle.left,
                width: cursorStyle.width,
              }}
              transition={{
                type: 'spring',
                stiffness: 350,
                damping: 35,
                duration: 0.6,
              }}
            />
          )}
          {items.map((item, idx) => {
            const isSelected = idx === innerIndex;
            const isLastItem = idx === items.length - 1;
            const showDivider = divider && !isLastItem && !isSelected && idx !== innerIndex - 1;

            return (
              <div
                key={String(idx)}
                data-item-index={idx}
                className="relative shrink-0"
                onClick={() => onItemTap(item, idx)}
              >
                {renderItem(item, idx, isSelected)}
                {showDivider && (
                  <div
                    className={cn(
                      'absolute top-1/2 right-0 h-[22px] w-px shrink-0 -translate-y-1/2 bg-(--color-fade-white-10)',
                      dividerClassName,
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
