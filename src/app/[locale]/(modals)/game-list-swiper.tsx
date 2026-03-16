'use client';
import AppHeader from '@/components/ui/AppHeader';
import CustomSwiper from '@/components/ui/CustomSwiper';
import { useDevice } from '@/providers/device.provider';

export default function GameListSwiper() {
  const { isMobile } = useDevice();
  return (
    <div
      data-name="game-list-swiper"
      className="flex h-dvh w-dvw flex-col overflow-hidden bg-(--page-bg) sm:h-[667px] sm:w-[375px] sm:rounded-md"
    >
      <AppHeader title="游戏列表" />
      <div className="no-scrollbar flex-1 overflow-auto p-3">
        <CustomSwiper columns={3} gap={6} lines={2} isOver />
        <div className="mt-4 h-[1000px] bg-red-400"></div>
      </div>
    </div>
  );
}
