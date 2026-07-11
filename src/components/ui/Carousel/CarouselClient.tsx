// @See https://www.embla-carousel.com/

'use client';

import type { CSSProperties, ReactNode, Ref } from 'react';
import {
  Children,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';

import { EmblaCarouselType } from 'embla-carousel';
import Autoplay from 'embla-carousel-autoplay';
import useEmblaCarousel from 'embla-carousel-react';

import { cn } from '@/libs/class-helpers';

export interface CarouselState {
  selectedSnap: number;
  prevBtnDisabled: boolean;
  nextBtnDisabled: boolean;
  snapCount: number;
}

export interface CarouselRef extends CarouselState {
  goToPrev: () => void;
  goToNext: () => void;
}

export type CarouselDesktopColumns = 1 | 2 | 3;

export type CarouselClientProps = {
  ref?: Ref<CarouselRef>;
  className?: string;
  loop?: boolean;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showPagination?: boolean;
  desktopColumns?: CarouselDesktopColumns;
  children: ReactNode;
};

const getDefaultCarouselState = (snapCount = 0): CarouselState => ({
  selectedSnap: 0,
  prevBtnDisabled: true,
  nextBtnDisabled: true,
  snapCount,
});

export default function CarouselClient({
  ref,
  className,
  loop = true,
  autoPlay = true,
  autoPlayInterval = 3000,
  showPagination = true,
  desktopColumns = 3,
  children,
}: CarouselClientProps) {
  const slides = useMemo(() => Children.toArray(children), [children]);
  const canLoop = loop && slides.length > 1;
  const canAutoPlay = autoPlay && slides.length > 1;
  const plugins = useMemo(
    () =>
      canAutoPlay
        ? [
            Autoplay({
              instant: false,
              delay: autoPlayInterval,
              defaultInteraction: false,
            }),
          ]
        : [],
    [autoPlayInterval, canAutoPlay],
  );
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: canLoop, align: 'center' }, plugins);

  const [carouselState, setCarouselState] = useState<CarouselState>(() =>
    getDefaultCarouselState(slides.length),
  );
  const manualInteractionRef = useRef(false);
  const manualSelectionChangedRef = useRef(false);

  const goToPrev = useCallback(() => emblaApi?.goToPrev(), [emblaApi]);
  const goToNext = useCallback(() => emblaApi?.goToNext(), [emblaApi]);

  const syncCarouselState = useCallback((emblaApi: EmblaCarouselType) => {
    setCarouselState({
      selectedSnap: emblaApi.selectedSnap(),
      prevBtnDisabled: !emblaApi.canGoToPrev(),
      nextBtnDisabled: !emblaApi.canGoToNext(),
      snapCount: emblaApi.snapList().length,
    });
  }, []);

  const getAutoplayPlugin = useCallback((emblaApi: EmblaCarouselType) => {
    return emblaApi.plugins()?.autoplay;
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      goToPrev,
      goToNext,
      ...carouselState,
    }),
    [carouselState, goToNext, goToPrev],
  );

  // 事件监听
  useEffect(() => {
    if (!emblaApi) return;

    const handlePointerDown = (emblaApi: EmblaCarouselType) => {
      manualInteractionRef.current = true;
      manualSelectionChangedRef.current = false;
      if (canAutoPlay) getAutoplayPlugin(emblaApi)?.stop();
    };
    const handleReInit = (emblaApi: EmblaCarouselType) => {
      syncCarouselState(emblaApi);
      manualInteractionRef.current = false;
      manualSelectionChangedRef.current = false;
      if (canAutoPlay) getAutoplayPlugin(emblaApi)?.play();
    };
    const handleSelect = (emblaApi: EmblaCarouselType) => {
      syncCarouselState(emblaApi);

      if (!manualInteractionRef.current) return;

      manualSelectionChangedRef.current = true;
      manualInteractionRef.current = false;
      if (canAutoPlay) getAutoplayPlugin(emblaApi)?.play();
    };
    const handleSettle = (emblaApi: EmblaCarouselType) => {
      if (!manualInteractionRef.current) return;
      if (manualSelectionChangedRef.current) return;
      manualInteractionRef.current = false;
      manualSelectionChangedRef.current = false;
      if (canAutoPlay) getAutoplayPlugin(emblaApi)?.play();
    };

    syncCarouselState(emblaApi);

    emblaApi.on('reinit', handleReInit); // 轮播参数或尺寸变化后重新初始化时，刷新 UI 并重新启动自动播放计时
    emblaApi.on('select', handleSelect); // 当前激活页变化时触发：同步 UI，并在手动切页后重启自动播放
    emblaApi.on('pointerdown', handlePointerDown); // 用户开始拖拽/按下轮播时触发：先暂停自动播放
    emblaApi.on('settle', handleSettle); // 滚动完全稳定后触发：用于兜底恢复“拖了但未切页”的自动播放

    return () => {
      emblaApi.off('reinit', handleReInit);
      emblaApi.off('select', handleSelect);
      emblaApi.off('pointerdown', handlePointerDown);
      emblaApi.off('settle', handleSettle);
    };
  }, [canAutoPlay, emblaApi, getAutoplayPlugin, syncCarouselState]);

  // 自动播放
  useEffect(() => {
    if (!emblaApi) return;
    if (canAutoPlay) {
      getAutoplayPlugin(emblaApi)?.play();
    } else {
      getAutoplayPlugin(emblaApi)?.stop();
    }
  }, [canAutoPlay, emblaApi, getAutoplayPlugin]);

  useEffect(() => {
    if (slides.length > 0) {
      if (!emblaApi) setCarouselState(getDefaultCarouselState(slides.length));
      return;
    }

    setCarouselState(getDefaultCarouselState());
  }, [emblaApi, slides.length]);

  const rootStyle = {
    '--carousel-progress-duration': `${autoPlayInterval}ms`,
  } as CSSProperties;

  const canShowPagination = showPagination && slides.length > 1 && carouselState.snapCount > 1;
  const slideClassName = cn(
    'min-w-0 shrink-0 basis-full pl-3',
    desktopColumns === 1 && 'sm:basis-full',
    desktopColumns === 2 && 'sm:basis-1/2',
    desktopColumns === 3 && 'sm:basis-1/3',
  );

  return (
    <div data-name="CarouselClient" className={cn('w-full', className)} style={rootStyle}>
      <style>{`
        .bullet-animate::after {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background: ${'#31ED87'};
          width: 0%;
          transform-origin: left;
          animation: bullet-progress var(--carousel-progress-duration) linear forwards;
        }
        @keyframes bullet-progress { from { width: 0%; } to { width: 100%; }}
      `}</style>
      {/* 轮播图内容区域 */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="-ml-3 flex touch-pan-y touch-pinch-zoom">
          {slides.map((slide, index) => (
            <div key={index} className={slideClassName}>
              {slide}
            </div>
          ))}
        </div>
      </div>
      {/* 轮播图分页指示器 */}
      {canShowPagination && (
        <div className="mt-2 flex h-[6px] justify-center gap-2">
          {Array.from({ length: carouselState.snapCount }).map((_, index) => (
            <div
              className={cn(
                'bullet-base relative h-[6px] w-[6px] rounded-full bg-[#2D2D2D]',
                carouselState.selectedSnap === index ? 'w-[56px]' : '',
                canAutoPlay && carouselState.selectedSnap === index ? 'bullet-animate' : '',
              )}
              key={index}
            />
          ))}
        </div>
      )}
    </div>
  );
}
