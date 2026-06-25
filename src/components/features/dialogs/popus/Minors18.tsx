'use client';
import { memo, useState } from 'react';

import { MainButton } from '@/components/ui/Buttons';
import { useDialog } from '@/components/ui/Dialog';
import Icon from '@/components/ui/Icon';
import { useBrandConfig } from '@/providers/brand.provider';

export default memo(function Minors18() {
  const brand = useBrandConfig();
  const dialog = useDialog();
  const [isTapNo, setIsTapNo] = useState(false);
  return (
    <div
      dta-name="Minors18"
      className="flex w-[310px] flex-col gap-5 rounded-md bg-[#212121] px-3 py-5"
    >
      <header className="relative flex justify-center">
        <img
          className="h-8 w-auto align-middle"
          src={`/res/${process.env.NEXT_PUBLIC_BRAND}/logo.png`}
          alt="logo"
        />
        {isTapNo && (
          <Icon
            name="close"
            className="size-4"
            color="white"
            wrapperClass="size-7 bg-white/20 rounded-sm absolute right-0 top-0 cursor-pointer"
            onClick={() => setIsTapNo(false)}
          />
        )}
      </header>
      <main className="text-center text-white">
        {isTapNo ? (
          <p className="mt-[6px] text-xs leading-[18px] font-medium">
            We're sorry, but you must be 18 years of age or older to access this site. Thank you for
            your understanding.
          </p>
        ) : (
          <>
            <h1 className="text-sm leading-[21px] font-bold">Welcome to {brand.appName}</h1>
            <p className="mt-[6px] text-xs leading-[18px] font-medium">Are you at least 18 ？</p>
          </>
        )}
      </main>

      {!isTapNo && (
        <footer className="flex items-center justify-center gap-3">
          <MainButton className="bg-[#353535]! bg-none text-white" onClick={() => setIsTapNo(true)}>
            No
          </MainButton>
          <MainButton onClick={() => dialog.close('Minors18')}>Yes</MainButton>
        </footer>
      )}
    </div>
  );
});
