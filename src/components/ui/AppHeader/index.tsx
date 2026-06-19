'use client';

import { ZIndex } from '@/constants/z-index';
import { useRouter } from '@/router';
import { Routes } from '@/router/routes';

import Button from '../Button';

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
        <Button
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
        >
          返回
        </Button>
      </div>
      <h1 className="font-semibold text-white">{title}</h1>
      <div className="absolute top-1/2 right-3 -translate-y-1/2"></div>
    </div>
  );
}
