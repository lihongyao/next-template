// src/app/[locale]/(home)/page.tsx
'use client';
import { useEffect } from 'react';

import Button from '@/components/ui/Button';
import Carousel from '@/components/ui/Carousel';
import Icon from '@/components/ui/Icon';
import { useRouter } from '@/router';
import { Routes } from '@/router/routes';

export default function HomePage() {
  const router = useRouter();
  // const routerA = useTransitionRouter();
  useEffect(() => {
    console.log('render home page...');
  }, []);
  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <Carousel loop />
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => {
            router.push(Routes.Dashboard);
          }}
        >
          Dashboard
        </Button>
        <Button
          onClick={() => {
            router.push(Routes.GameList, { scroll: false });
          }}
        >
          游戏列表
        </Button>
        <Button
          onClick={() => {
            router.push(Routes.ModalGameListSwiper, {
              scroll: false,
            });
          }}
        >
          游戏列表（自定义Swiper）
        </Button>
        <Button onClick={() => router.push(Routes.DynamicComps)}>动态加载</Button>
        <Button
          onClick={() => {
            router.push(Routes.Details);
          }}
        >
          详情
        </Button>
        <Button
          onClick={() => {
            router.push(Routes.Dialog);
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
        <Button onClick={() => router.push(Routes.DataPathThrough)}>数据传递</Button>
        <Button
          onClick={() => {
            throw new Error('测试 sentry');
          }}
        >
          测试 sentry
        </Button>
      </div>

      <div className="text-[#187843]">1231232</div>
      <div className="w-full max-w-[560px] rounded-xl border border-white/10 bg-black/30 p-4">
        <div className="mb-3 text-sm text-white">Icon 混合渲染示例（sprites + svgr）</div>
        <div className="flex flex-wrap gap-3">
          {/* <Icon
            name="arrow_long_left"
            className="size-6"
            color="orange"
            wrapperClass="size-10 rounded-md bg-white"
          /> */}
          <Icon
            name="home"
            className="size-6"
            color="red"
            wrapperClass="size-10 rounded-md bg-white"
          />
          <Icon
            name="cart"
            className="size-6"
            color="#ff7300"
            wrapperClass="size-10 rounded-md bg-white"
          />
          <Icon
            name="order"
            className="size-6"
            color="#2DEE88"
            wrapperClass="size-10 rounded-md bg-white"
          />
          <Icon
            name="profile"
            className="size-6"
            color="#FC0048"
            wrapperClass="size-10 rounded-md bg-white"
          />
          <Icon
            name="globe"
            className="size-6"
            color="white"
            wrapperClass="size-10 rounded-md bg-black"
          />
          <Icon
            name="file"
            className="size-6"
            color="#FFC271"
            wrapperClass="size-10 rounded-md bg-black"
          />
          <Icon
            name="next"
            className="size-6"
            color="#31ED87"
            wrapperClass="size-10 rounded-md bg-black"
          />
          <Icon
            name="window"
            className="size-6"
            color="#8C928F"
            wrapperClass="size-10 rounded-md bg-black"
          />
        </div>
      </div>

      {/* <DragView
        position={{
          top: 100,
          left: 100,
        }}
      >
        <div id="glassBtn">
          <span className="text-5xl font-bold italic">GLASS</span>
        </div>
      </DragView> */}

      <img
        src={
          'https://7962f838-71f7-4241-a247-d66de3a48854.mdnplay.dev/shared-assets/images/examples/surfer.jpg'
        }
        alt=""
      />
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
