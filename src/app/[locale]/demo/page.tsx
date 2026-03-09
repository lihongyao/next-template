'use client';
import CustomSwiper from '@/components/ui/CustomSwiper';
import { useDevice } from '@/providers/device.provider';

export default function DemoPage() {
  const { isMobile } = useDevice();
  return (
    <div
      data-name="Demo"
      className="flex min-h-screen w-full flex-col justify-start gap-4 bg-black p-3"
    >
      {/* <SwiperGameList /> */}
      <CustomSwiper columns={isMobile ? 3 : 7} gap={isMobile ? 6 : 8} lines={1} />
      {/* <CustomSwiper columns={isMobile ? 3 : 7} gap={isMobile ? 6 : 8} /> */}
      {/* <CustomSwiper columns={isMobile ? 3 : 7} gap={isMobile ? 6 : 8} /> */}
    </div>
  );
}
