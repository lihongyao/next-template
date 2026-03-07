'use client';
import AppHeader from '@/components/ui/AppHeader';
import CustomSwiper from '@/components/ui/CustomSwiper';

export default function GameListSwiper() {
  return (
    <div data-name="game-list-swiper" className="flex h-dvh w-dvw flex-col bg-(--page-bg)">
      <AppHeader title="游戏列表" />
      <div className="no-scrollbar flex-1 overflow-auto p-3">
        <CustomSwiper />
      </div>
    </div>
  );
}
