// src/app/[locale]/(home)/page.tsx
'use client';

import { useEffect } from 'react';

import Button from '@/components/ui/Button';
import Carousel from '@/components/ui/Carousel';
import Icon from '@/components/ui/Icon';
import { useModalRoutes } from '@/hooks/useModalRoutes';
import { getImgUrl } from '@/libs/helpers';
import { useDevice } from '@/providers/device.provider';
import { useRouter } from '@/router';
import { ModalPageRoutes, Routes } from '@/router/routes';

export default function HomePage() {
  const { isMobile } = useDevice();
  const router = useRouter();
  // const routerA = useTransitionRouter();
  const { mergeRouteIntoCurrentPath, resolveRouteForCurrentDevice } = useModalRoutes();
  useEffect(() => {
    console.log('render home page...');
  }, []);
  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <Carousel loop />
      <div className="flex flex-wrap gap-2">
        {/* <Button
          onClick={() =>
            router.push(resolveRouteForCurrentDevice(ModalPageRoutes.profile), {
              scroll: false,
            })
          }
        >
          路由弹窗(个人中心)
        </Button> */}

        <Button
          onClick={() => {
            const jumpToUrl = resolveRouteForCurrentDevice(ModalPageRoutes['game-list']);
            router.push(jumpToUrl, { scroll: false });
          }}
        >
          游戏列表
        </Button>
        <Button
          onClick={() => {
            if (isMobile) {
              router.push(mergeRouteIntoCurrentPath(Routes.ModalGameListSwiper), { scroll: false });
            }
          }}
        >
          游戏列表（自定义Swiper）
        </Button>
        <Button onClick={() => router.push(Routes.DynamicComps, { scroll: false })}>
          动态加载
        </Button>
        <Button
          onClick={() => {
            router.push(Routes.Details, {
              scroll: false,
            });
          }}
        >
          详情
        </Button>
        <Button
          onClick={() => {
            router.push(Routes.Dialog, { scroll: false });
          }}
        >
          普通弹窗
        </Button>
        <Button
          onClick={() => {
            router.push(Routes.I18n);
          }}
        >
          国际化
        </Button>
        <Button onClick={() => router.push(Routes.DataPathThrough, { scroll: true })}>
          数据传递
        </Button>
      </div>

      <div className="text-[#187843]">1231232</div>
      <Icon
        name="globe"
        className="size-6"
        color="white"
        wrapperClass="size-12 bg-black rounded-full"
      />

      <img
        src={
          'https://7962f838-71f7-4241-a247-d66de3a48854.mdnplay.dev/shared-assets/images/examples/surfer.jpg'
        }
        alt=""
      />

      <img src={getImgUrl('login/login.webp')} alt="" />
      {/* <ResponsiveImage
        mobile="https://f88cc7f7-cdbc-4de0-b27f-bbfa4a0d5455.mdnplay.dev/shared-assets/images/examples/grapefruit-slice.jpg"
        desktop="https://7962f838-71f7-4241-a247-d66de3a48854.mdnplay.dev/shared-assets/images/examples/surfer.jpg"
        alt=""
        className="w-[300]"
      /> */}

      <div className="h-[1000px] w-full bg-blue-500" />
    </div>
  );
}
