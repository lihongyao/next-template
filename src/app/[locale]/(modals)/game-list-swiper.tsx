'use client';
import AppHeader from '@/components/ui/AppHeader';
import CustomSwiper from '@/components/ui/CustomSwiper';
import { useDevice } from '@/providers/device.provider';

export default function GameListSwiper() {
  const { isMobile } = useDevice();
  return (
    <div data-name="game-list-swiper" className="flex h-dvh w-dvw flex-col bg-(--page-bg)">
      <AppHeader title="游戏列表" />
      <div className="no-scrollbar flex-1 overflow-auto p-3">
        <CustomSwiper columns={isMobile ? 3 : 5} gap={6} lines={2} isOver />
      </div>
    </div>
  );
}
