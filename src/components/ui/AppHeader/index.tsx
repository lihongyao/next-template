'use client';

import { useRouter } from '@/i18n/navigation';

import Button from '../Button';

interface AppHeaderProps {
  title: string;
}
export default function AppHeader({ title }: AppHeaderProps) {
  const router = useRouter();
  return (
    <div className="relative flex h-[56px] items-center justify-center bg-black">
      <div className="absolute top-1/2 left-3 -translate-y-1/2">
        <Button onClick={() => router.back()}>返回</Button>
      </div>
      <h1 className="font-semibold text-white">{title}</h1>
      <div className="absolute top-1/2 right-3 -translate-y-1/2"></div>
    </div>
  );
}
