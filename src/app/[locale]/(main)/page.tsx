// src/app/[locale]/(home)/page.tsx
'use client';

import Button from '@/components/ui/Button';
import { ResponsiveImage } from '@/components/ui/ResponsiveImage';
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
        <Button onClick={() => router.push(getMergePath(Routes.ModalProfile), { scroll: false })}>
          路由弹窗(个人中心)
        </Button>
        <Button onClick={() => router.push(getMergePath(Routes.ModalLogin), { scroll: false })}>
          路由弹窗(登录)
        </Button>
        <Button onClick={() => router.push(Routes.Details + '/Slot')}>详情</Button>
        <Button onClick={() => router.push(Routes.Dialog)}>普通弹窗</Button>
        <Button onClick={() => router.push(Routes.I18n)}>国际化</Button>
        <Button onClick={() => router.push(Routes.DataPathThrough)}>数据传递</Button>
      </div>
      <ResponsiveImage
        mobile="https://f88cc7f7-cdbc-4de0-b27f-bbfa4a0d5455.mdnplay.dev/shared-assets/images/examples/grapefruit-slice.jpg"
        desktop="https://7962f838-71f7-4241-a247-d66de3a48854.mdnplay.dev/shared-assets/images/examples/surfer.jpg"
        alt=""
        className="w-[300]"
      />

      <div className="h-[600px] w-full bg-red-500" />
    </div>
  );
}
