// src/app/[locale]/(home)/page.tsx
'use client';

import Button from '@/components/ui/Button';
import { useModalRoutes } from '@/hooks/useModalRoutes';
import { useRouter } from '@/i18n/navigation';
import { Routes } from '@/libs/routes';

export default function HomePage() {
  const router = useRouter();
  const { getMergePath } = useModalRoutes();
  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <div className="h-[600px] w-full bg-red-500" />
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => router.push(getMergePath(Routes.ModalProfile))}>路由弹窗</Button>
        <Button onClick={() => router.push(Routes.Dialog)}>普通弹窗</Button>
        <Button onClick={() => router.push(Routes.I18n)}>国际化</Button>
      </div>

      <div className="h-[600px] w-full bg-red-500" />
    </div>
  );
}
