'use client';

import { useTranslations } from 'next-intl';

import { getImageUrl } from '@/libs/cdn-image';
import { useRouter } from '@/router';
import { Routes } from '@/router/routes';

export default function NotFound() {
  const t = useTranslations();
  const router = useRouter();
  return (
    <div className="flex h-dvh w-dvw flex-col p-5 sm:flex-row sm:items-center sm:justify-center">
      <div className="aspect-[335/252] w-full sm:order-2 sm:max-w-[520px]">
        <img className="w-full" src={getImageUrl('404.png')} alt="404" />
      </div>
      <div className="flex flex-col items-center justify-center gap-[20px] text-center sm:order-1 sm:items-start sm:justify-start sm:text-left">
        <img src={'/res/afun/logo.png'} alt="logo" className="h-[30px] w-auto sm:h-[51px]" />
        <div className="flex flex-col gap-[10px]">
          <p className="text-[16px] leading-[19px] font-extrabold text-white">
            404 — Page Not Found
          </p>
          <p className="text-[14px] leading-[21px] font-medium text-white">
            Oops! The page you’re looking for doesn’t exist.
          </p>
          <p className="text-[14px] leading-[21px] font-medium text-[#D6C4C4]">
            It may have been moved or the URL may be incorrect.
          </p>
        </div>
        <div className="w-full px-[17px] sm:px-0">
          <div
            className="curp animate-pressable flex h-[44px] w-full items-center justify-center rounded-[8px] bg-linear-90 from-[#31ed87] to-[#95e974]"
            onClick={() => router.replace(Routes.Home)}
          >
            <span className="text-[14px] font-extrabold text-[#5C191D]">Go To Home</span>
          </div>
        </div>
      </div>
    </div>
  );
}
