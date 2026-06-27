// @See https://www.embla-carousel.com/

'use client';

import { useCallback, useEffect, useState } from 'react';

import { EmblaCarouselType } from 'embla-carousel';
import Autoplay from 'embla-carousel-autoplay';
import useEmblaCarousel from 'embla-carousel-react';

import { cn } from '@/libs/class-helpers';

export const items = [
  { id: 1, url: '/banner/1.jpg' },
  { id: 2, url: '/banner/2.jpg' },
  { id: 3, url: '/banner/3.jpg' },
  { id: 4, url: '/banner/4.jpg' },
  { id: 5, url: '/banner/5.jpg' },
  { id: 6, url: '/banner/6.jpg' },
];

type CarouselProps = {
  loop?: boolean;
};

export default function Carousel({ loop = true }: CarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop, align: 'center' }, [
    Autoplay({
      instant: false,
      delay: 3000,
      defaultInteraction: false,
    }),
  ]);

  const [selectedSnap, setSelectedSnap] = useState(0);
  const [prevBtnDisabled, setPrevBtnDisabled] = useState(true);
  const [nextBtnDisabled, setNextBtnDisabled] = useState(true);
  const [snapCount, setSnapCount] = useState(0);

  const goToPrev = () => emblaApi?.goToPrev();
  const goToNext = () => emblaApi?.goToNext();

  const onSelect = useCallback((emblaApi: EmblaCarouselType) => {
    setSelectedSnap(emblaApi?.selectedSnap());
    setPrevBtnDisabled(!emblaApi.canGoToPrev());
    setNextBtnDisabled(!emblaApi.canGoToNext());
  }, []);

  const updateScrollSnapState = useCallback((emblaApi: EmblaCarouselType) => {
    setSnapCount(emblaApi.snapList().length);
    setSelectedSnap(emblaApi.selectedSnap());
  }, []);

  // 事件监听
  useEffect(() => {
    if (!emblaApi) return;
    onSelect(emblaApi);
    updateScrollSnapState(emblaApi);
    emblaApi.on('reinit', onSelect).on('select', onSelect);
    emblaApi.on('select', updateScrollSnapState);
    emblaApi.on('reinit', updateScrollSnapState);
  }, [emblaApi, onSelect, updateScrollSnapState]);

  // 自动播放
  useEffect(() => {
    emblaApi?.plugins()?.autoplay?.play();
  }, [emblaApi]);

  return (
    <div className="w-full">
      <style>{`
        .bullet-animate::after {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background: ${'#31ED87'};
          width: 0%;
          transform-origin: left;
          animation: bullet-progress ${3000}ms linear forwards;
        }
        @keyframes bullet-progress { from { width: 0%; } to { width: 100%; }}
      `}</style>
      {/* 轮播图内容区域 */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="-ml-3 flex touch-pan-y touch-pinch-zoom">
          {items.map((item) => (
            <div key={item.id} className="min-w-0 shrink-0 basis-full pl-3 sm:basis-1/3">
              <div
                className="aspect-[351/195] rounded-xl bg-cover bg-center"
                style={{
                  backgroundImage: `url(${item.url})`,
                }}
              />
            </div>
          ))}
        </div>
      </div>
      {/* 轮播图分页指示器 */}
      <div className="mt-2 flex h-[6px] justify-center gap-2">
        {Array.from({ length: snapCount }).map((_, index) => (
          <div
            className={cn(
              'bullet-base relative h-[6px] w-[6px] rounded-full bg-[#2D2D2D]',
              selectedSnap === index ? 'bullet-animate w-[56px]' : '',
            )}
            key={index}
          />
        ))}
      </div>
    </div>
  );
}
