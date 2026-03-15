'use client';

import { memo } from 'react';

import { Link, usePathname } from '@/i18n/navigation';
import { cn } from '@/libs/class-helpers';
import { type Route, Routes } from '@/libs/routes';

import Icon from '../ui/Icon';

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
  return (
    <div
      data-name="app-tab-bar"
      className="isMobile fixed bottom-0 left-0 w-full bg-black"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <div className="flex h-[65px] w-full items-center justify-around">
        {tabBarConfig.map((item) => (
          <Link className="flex flex-col gap-1" href={item.path} key={item.path} scroll={false}>
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
  );
});
