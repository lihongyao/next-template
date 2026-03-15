'use client';

import useAppRouter from '@/hooks/useAppRouter';

import Button from '../Button';

interface AppHeaderProps {
  title: string;
  onBack?: () => void;
}
export default function AppHeader({ title, onBack }: AppHeaderProps) {
  const router = useAppRouter();
  // const router = useTransitionRouter();
  return (
    <div className="sticky top-0 left-0 h-[56px]">
      <div className="flex h-[56px] w-full items-center justify-center bg-black transition-none">
        <div className="absolute top-1/2 left-3 -translate-y-1/2">
          <Button
            onClick={() => {
              if (onBack) {
                onBack();
              } else {
                router.back();
              }
            }}
          >
            返回
          </Button>
        </div>
        <h1 className="font-semibold text-white">{title}</h1>
        <div className="absolute top-1/2 right-3 -translate-y-1/2"></div>
      </div>
    </div>
  );
}
