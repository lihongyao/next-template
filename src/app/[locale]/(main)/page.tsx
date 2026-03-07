// src/app/[locale]/(home)/page.tsx
'use client';

import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import { ResponsiveImage } from '@/components/ui/ResponsiveImage';
import { useModalRoutes } from '@/hooks/useModalRoutes';
import { useRouter } from '@/i18n/navigation';
import { ModalPageRoutes, Routes } from '@/libs/routes';
import { useDevice } from '@/providers/device.provider';

export default function HomePage() {
  const { isMobile } = useDevice();
  const router = useRouter();
  const { mergeRouteIntoCurrentPath, resolveRouteForCurrentDevice } = useModalRoutes();
  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <div className="h-[200px] w-full bg-blue-500" />
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() =>
            router.push(resolveRouteForCurrentDevice(ModalPageRoutes.profile), {
              scroll: false,
            })
          }
        >
          路由弹窗(个人中心)
        </Button>
        <Button
          onClick={() => {
            router.push(mergeRouteIntoCurrentPath(Routes.ModalLogin), { scroll: false });
          }}
        >
          登录
        </Button>
        <Button
          onClick={() =>
            router.push(mergeRouteIntoCurrentPath(Routes.ModalRegister), { scroll: false })
          }
        >
          注册
        </Button>
        <Button
          onClick={() => {
            const route = resolveRouteForCurrentDevice(ModalPageRoutes.gameDetails);
            const jumpToUrl = route + '/1';
            router.push(jumpToUrl, {
              scroll: false,
            });
          }}
        >
          游戏详情
        </Button>
        <Button
          onClick={() => {
            const jumpToUrl = resolveRouteForCurrentDevice(ModalPageRoutes.gameList);
            router.push(jumpToUrl, { scroll: false });
          }}
        >
          游戏列表
        </Button>
        <Button
          onClick={() => {
            if (isMobile) {
              router.push(mergeRouteIntoCurrentPath(Routes.ModalGameListSwiper));
            }
          }}
        >
          游戏列表（自定义Swiper）
        </Button>
        <Button onClick={() => router.push(Routes.Details + '/Slot')}>详情</Button>
        <Button onClick={() => router.push(Routes.Dialog)}>普通弹窗</Button>
        <Button onClick={() => router.push(Routes.I18n)}>国际化</Button>
        <Button onClick={() => router.push(Routes.DataPathThrough)}>数据传递</Button>
      </div>

      <Icon
        name="globe"
        className="size-6"
        color="white"
        wrapperClass="size-12 bg-black rounded-full"
      />

      <ResponsiveImage
        mobile="https://f88cc7f7-cdbc-4de0-b27f-bbfa4a0d5455.mdnplay.dev/shared-assets/images/examples/grapefruit-slice.jpg"
        desktop="https://7962f838-71f7-4241-a247-d66de3a48854.mdnplay.dev/shared-assets/images/examples/surfer.jpg"
        alt=""
        className="w-[300]"
      />

      <div className="h-[600px] w-full bg-blue-500" />
    </div>
  );
}
