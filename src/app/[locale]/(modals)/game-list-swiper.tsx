'use client';

import { useRef, useState } from 'react';

import AppHeader from '@/components/ui/AppHeader';
import Button from '@/components/ui/Button';
import CustomSwiper, {
  type CustomSwiperRef,
  type CustomSwiperState,
} from '@/components/ui/CustomSwiper';
import LazyImg from '@/components/ui/LazyImage';
import { games } from '@/constants/data';
import { cn } from '@/libs/class-helpers';

export default function GameListSwiper() {
  const swiperRef = useRef<CustomSwiperRef>(null);
  const columns = 3;
  const lines = 2;
  const [swiperState, setSwiperState] = useState<CustomSwiperState>({
    currentPage: 0,
    totalPages: Math.ceil(games.length / (columns * lines)),
    enablePrev: false,
    enableNext: games.length > columns * lines,
  });

  return (
    <div
      data-name="game-list-swiper"
      className="flex h-dvh w-dvw flex-col overflow-hidden bg-(--page-bg) sm:h-[667px] sm:w-[375px] sm:rounded-md"
    >
      <AppHeader title="游戏列表" />
      <div className="no-scrollbar flex-1 overflow-auto p-3">
        <header className="mb-3 flex items-center justify-between">
          <h1 className="text-white">
            游戏列表 - {swiperState.currentPage + 1}/{swiperState.totalPages}
          </h1>

          <div className="flex items-center gap-2">
            <Button
              className={cn(!swiperState.enablePrev && 'cursor-not-allowed opacity-35')}
              onClick={() => swiperRef.current?.prev()}
              disabled={!swiperState.enablePrev}
            >
              上一页
            </Button>

            <Button
              className={cn(!swiperState.enableNext && 'cursor-not-allowed opacity-35')}
              onClick={() => swiperRef.current?.next()}
              disabled={!swiperState.enableNext}
            >
              下一页
            </Button>
          </div>
        </header>

        <CustomSwiper
          ref={swiperRef}
          items={games}
          columns={columns}
          gap={8}
          lines={lines}
          overflowMode="peek"
          onStateChange={setSwiperState}
          // peekPaddingX={24}
          renderItem={(item, _index, { isVisible }) => (
            <div
              className="aspect-[200/267] overflow-hidden rounded-md bg-gray-800"
              onClick={() => {
                console.log(item, _index, isVisible);
              }}
            >
              {isVisible && (
                <LazyImg
                  className="h-full w-full object-cover"
                  src={item.src}
                  blurSrc={item.blurSrc}
                />
              )}
            </div>
          )}
        />
      </div>
    </div>
  );
}
