'use client';

import { memo, useRef } from 'react';

import { ZIndex } from '@/constants/z-index';
import { cn } from '@/libs/class-helpers';
import { playSound } from '@/libs/sound';
import { Link, usePathname } from '@/router';
import { type Route, Routes } from '@/router/routes';

import Icon, { IconName } from '../ui/Icon';

export interface TabBarItemProps {
  path: Route;
  label: string;
  icon: IconName;
}

export default memo(function AppTabBar() {
  const tabBarConfig: TabBarItemProps[] = [
    { path: Routes.Menu, label: 'Menu', icon: 'menu' },
    { path: Routes.Home, label: 'Home', icon: 'home' },
    { path: Routes.Goods, label: 'Goods', icon: 'goods' },
    { path: Routes.Truco, label: 'Truco', icon: 'truco' },
    { path: Routes.Promotion, label: 'Promotions', icon: 'promotion' },
  ];
  const pathname = usePathname();
  const trackRef = useRef<HTMLDivElement>(null);

  return (
    // bottom-0 才会被 iOS safari 底部工具栏吸取颜色
    <div
      data-name="app-tab-bar"
      className="fixed bottom-0 left-0 w-full"
      style={{
        zIndex: ZIndex.Footer,
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
              onClick={() => playSound('button_click')}
            >
              <Icon
                className="size-5"
                color={pathname === item.path ? '#31ED87' : 'white'}
                name={item.icon}
              />
              <span
                className={cn(
                  'text-xs',
                  pathname === item.path ? 'text-[#31ED87]' : 'text-[white]',
                )}
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
