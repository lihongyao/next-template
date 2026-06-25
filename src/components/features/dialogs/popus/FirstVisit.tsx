'use client';
import { memo } from 'react';

import { MainButton } from '@/components/ui/Buttons';
import { useDialog } from '@/components/ui/Dialog';
import Icon from '@/components/ui/Icon';
import { getImageUrl } from '@/libs/cdn-image';
import { useDevice } from '@/providers/device.provider';
import { useRouter } from '@/router';
import { Routes } from '@/router/routes';

export default memo(function FirstVisit() {
  const { isMobile } = useDevice();
  const router = useRouter();
  const dialog = useDialog();
  return (
    <div
      data-name="FirstVisit"
      className="relative w-[310px] overflow-hidden rounded-[12px] bg-[#212121] sm:w-[480px] sm:rounded-[16px]"
    >
      <div className="h-[282px] sm:h-[411px]">
        <img
          className="h-full w-full align-middle"
          src={getImageUrl(`popus/first-visit/${isMobile ? 'h5' : 'pc'}.png`)}
          alt=""
        />
      </div>
      <div className="relative h-[114px] sm:h-[160px]">
        <Icon name="first_visit_frame" className="h-full w-full" />
        <div className="absolute top-0 left-0 flex h-full w-full flex-col gap-4 p-4">
          <div className="flex items-center justify-between gap-4">
            <MainButton
              className="bg-[#353535] bg-none text-white"
              onClick={() => {
                dialog.close('FirstVisit');
                router.push(Routes.ModalLogin);
              }}
            >
              Sign In
            </MainButton>
            <MainButton
              onClick={() => {
                dialog.close('FirstVisit');
                router.push(Routes.ModalRegister);
              }}
            >
              Sign Up
            </MainButton>
          </div>
          <div className="flex items-center justify-center gap-1">
            <Icon className="h-[22px] w-[24px]" name="adult" />
            <div className="text-[8px] leading-[10px] font-medium text-white">
              <p>You must be at least 18 years old.</p>
              <p>Please play responsibly.</p>
            </div>
          </div>
        </div>
      </div>
      <Icon
        name="close"
        className="size-3"
        color="white"
        wrapperClass="size-6 bg-white/20 rounded-sm cursor-pointer absolute right-3 top-3 sm:right-4 sm:top-4"
        onClick={() => dialog.close('FirstVisit')}
      />
    </div>
  );
});
