'use client';

import { getImageUrl } from '@/libs/cdn-image';
import { useDevice } from '@/providers/device.provider';
import { useModal } from '@/providers/modal.provider';

export default function Login() {
  const { closeModal } = useModal();
  const { isMobile } = useDevice();
  const bannerSrc = getImageUrl(`auth/banner-${isMobile ? 'h5' : 'pc'}_pt-br.jpg`);
  return (
    <div
      data-name="Login"
      className="flex h-screen w-screen flex-col items-center justify-center gap-4 bg-white sm:h-[600px] sm:w-[800px] sm:overflow-hidden sm:rounded-lg"
    >
      <img src={bannerSrc} alt="" />
      <div
        className="h-full flex-1 bg-amber-600"
        style={{
          background: `url(${bannerSrc}) no-repeat center center / cover`,
          // backgroundSize: '100% 100%',
        }}
      />
      <div className="flex h-full flex-1 items-center justify-center p-3">
        <h1>登录</h1>
        <div className="cursor-pointer hover:text-blue-500" onClick={closeModal}>
          返回
        </div>
      </div>
    </div>
  );
}
