'use client';

import { useRouter } from '@/i18n/navigation';

import Button from '../Button';

interface AppHeaderProps {
  title: string;
  onBack?: () => void;
}
export default function AppHeader({ title, onBack }: AppHeaderProps) {
  const router = useRouter();
  // const router = useTransitionRouter();
  return (
    <div className="sticky top-0 left-0 flex h-[56px] shrink-0 items-center justify-center bg-black">
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
  );
}
