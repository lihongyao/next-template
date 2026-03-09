import { headers } from 'next/headers';

import CustomSwiper from '@/components/ui/CustomSwiper';
import { getDeviceType } from '@/libs/device';

export default async function DemoPage() {
  const userAgent = (await headers()).get('user-agent') || '';
  const { isMobile } = getDeviceType(userAgent);
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
