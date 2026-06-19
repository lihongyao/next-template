'use client';

import { memo, useRef } from 'react';

import { ZIndex } from '@/constants/z-index';
import { cn } from '@/libs/class-helpers';
import { Link, usePathname } from '@/router';
import { type Route, Routes } from '@/router/routes';

import Icon from '../ui/Icon';

export interface TabBarItemProps {
  path: Route;
  label: string;
  icon: string;
}

export default memo(function AppTabBar() {
  const tabBarConfig: TabBarItemProps[] = [
    { path: Routes.Menu, label: '菜单', icon: 'menu' },
    { path: Routes.Home, label: '首页', icon: 'home' },
    { path: Routes.Cart, label: '购物车', icon: 'cart' },
    { path: Routes.Truco, label: 'Truco', icon: 'truco' },
    { path: Routes.Promotion, label: '线下活动', icon: 'promotion' },
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
