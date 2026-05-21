'use client';

import { memo, useLayoutEffect, useRef, useState } from 'react';

import { Link, usePathname } from '@/i18n/navigation';
import { cn } from '@/libs/class-helpers';
import { type Route, Routes } from '@/router/routes';

import Icon from '../ui/Icon';

const BUBBLE_H = Math.round((65 * 66) / 80);
const TRACK_H = 65;
const TRACK_PAD_X = 8;

export interface TabBarItemProps {
  path: Route;
  label: string;
  icon: string;
}

export const TabRoutes: Route[] = [Routes.Home, Routes.Cart, Routes.Order, Routes.Profile];
export default memo(function AppTabBar() {
  const tabBarConfig: TabBarItemProps[] = [
    { path: Routes.Home, label: '首页', icon: 'home' },
    { path: Routes.Cart, label: '购物车', icon: 'cart' },
    { path: Routes.Order, label: '订单', icon: 'order' },
    { path: Routes.Profile, label: '个人中心', icon: 'profile' },
  ];
  const pathname = usePathname();
  const trackRef = useRef<HTMLDivElement>(null);
  const [slotWidth, setSlotWidth] = useState(0);

  const activeIndex = Math.max(
    0,
    tabBarConfig.findIndex((item) => item.path === pathname),
  );

  useLayoutEffect(() => {
    const el = trackRef.current;
    if (!el || typeof window === 'undefined') return;

    const apply = () => {
      const tw = el.offsetWidth;
      const sw = Math.max(0, (tw - TRACK_PAD_X * 2) / tabBarConfig.length);
      setSlotWidth(sw);
    };

    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const bubbleTop = (TRACK_H - BUBBLE_H) / 2;

  return (
    // bottom-0 才会被 iOS safari 底部工具栏吸取颜色
    <div
      data-name="app-tab-bar"
      className="fixed bottom-0 left-0 w-full"
      style={{
        paddingBottom: 'calc(env(safe-area-inset-bottom))',
      }}
    >
      <div
        className="relative h-[65px] w-full overflow-hidden rounded-t-3xl bg-[#161616] px-2"
        ref={trackRef}
      >
        <div className="relative z-20 flex h-full w-full">
          {tabBarConfig.map((item) => (
            <Link
              className="flex flex-1 flex-col items-center justify-center gap-1"
              href={item.path}
              key={item.path}
              scroll={false}
            >
              <Icon
                className="size-5"
                color={pathname === item.path ? 'orange' : 'white'}
                src={item.icon}
              />
              <span
                className={cn('text-xs', pathname === item.path ? 'text-[orange]' : 'text-[white]')}
              >
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
});
