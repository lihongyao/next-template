import { headers } from 'next/headers';

import Marquee from '@/components/features/Marquee';

export default async function DemoPage() {
  const userAgent = (await headers()).get('user-agent') || '';
  return (
    <div
      data-name="Demo"
      className="flex min-h-screen w-full flex-col justify-start gap-4 bg-black p-3"
    >
      {/* <SwiperGameList /> */}
      {/* <CustomSwiper columns={isMobile ? 3 : 7} gap={isMobile ? 6 : 8} lines={1} /> */}
      <Marquee />
      {/* <CustomSwiper columns={isMobile ? 3 : 7} gap={isMobile ? 6 : 8} /> */}
      {/* <CustomSwiper columns={isMobile ? 3 : 7} gap={isMobile ? 6 : 8} /> */}
    </div>
  );
}
