'use client';
import { getImageUrl } from '@/libs/cdn-image';
import { useDevice } from '@/providers/device.provider';
import { useRouter } from '@/router';
import { Routes } from '@/router/routes';

import JoinCard from './components/JoinCard';

export default function TrucoPage() {
  const { isMobile } = useDevice();
  const router = useRouter();

  return (
    <div data-name="truco-page" className="pb-10">
      <header>
        <img src={getImageUrl(`truco/${isMobile ? 'h5' : 'pc'}-banner.jpg`)} />
      </header>
      <main className="flex flex-col gap-4 px-4">
        {/* 1. 标题 */}
        <div className="relative w-full">
          <div className="absolute top-0 left-0 h-[1px] w-full bg-linear-90 from-transparent via-[#ffffff1a] to-transparent" />
          <div className="text-center text-xs leading-[24px] font-semibold text-[#B3B8C1] sm:leading-[34px]">
            Join for free and compete for great prizes every day.
          </div>
          <div className="absolute bottom-0 left-0 h-[1px] w-full bg-linear-90 from-transparent via-[#ffffff1a] to-transparent" />
        </div>
        {/* 2. join */}
        <JoinCard />
        {/* 3. button */}
        <div
          className="isMobile flex h-12 items-center justify-center rounded-xl bg-linear-180 from-[#2DEE88] to-[#96E974]"
          onClick={() => {
            router.push(Routes.ModalLogin);
          }}
        >
          <span className="text-md font-bold text-[#292D2E]">Join Now</span>
        </div>
      </main>
    </div>
  );
}
