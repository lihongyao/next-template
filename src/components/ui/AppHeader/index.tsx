'use client';

import { ZIndex } from '@/constants/z-index';
import { useRouter } from '@/router';
import { Routes } from '@/router/routes';

import Icon from '../Icon';

interface AppHeaderProps {
  title: string;
  onBack?: () => void;
}
export default function AppHeader({ title, onBack }: AppHeaderProps) {
  const router = useRouter();

  return (
    <div
      className="isMobile sticky inset-x-0 top-0 z-50 flex h-[56px] w-full items-center justify-center bg-[#161616] transition-none"
      style={{
        zIndex: ZIndex.Header,
      }}
    >
      <div className="absolute top-1/2 left-3 -translate-y-1/2">
        <Icon
          name="arrow_left"
          className="size-3"
          color="white"
          wrapperClass="size-6 bg-white/20 rounded-sm cursor-pointer"
          onClick={() => {
            if (onBack) {
              onBack();
            } else {
              if (history.length > 2) {
                router.back();
                return;
              }
              router.replace(Routes.Home);
            }
          }}
        />
      </div>
      <h1 className="font-semibold text-white">{title}</h1>
      <div className="absolute top-1/2 right-3 -translate-y-1/2"></div>
    </div>
  );
}
