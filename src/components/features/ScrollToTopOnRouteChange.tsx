'use client';

import { useLayoutEffect, useRef } from 'react';

import { usePathname } from '@/i18n/navigation';

/** 过滤路由 */
const MODAL_SEGMENTS = new Set<string>(['']);

/**
 * 路由变化时将页面滚到顶部。
 */
export function ScrollToTopOnRouteChange() {
  const pathname = usePathname();
  const prevPathnameRef = useRef(pathname);
  const tabBarPathsRef = useRef<string[]>(['/']);

  useLayoutEffect(() => {
    if (pathname === prevPathnameRef.current) return;
    const prevPathname = prevPathnameRef.current;
    prevPathnameRef.current = pathname;

    const segments = pathname.split('/').filter(Boolean);
    const isModalRoute = segments.some((s) => MODAL_SEGMENTS.has(s));
    if (isModalRoute) return;

    // 仅当在 tabBar 路径之间相互切换时滚回顶部；从其他页面进入 tabBar 页面不滚动
    const tabPaths = tabBarPathsRef.current;
    const prevInTabBar = tabPaths.length > 0 && tabPaths.includes(prevPathname);
    const currInTabBar = tabPaths.length > 0 && tabPaths.includes(pathname);
    if (!(prevInTabBar && currInTabBar)) return;

    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname]);

  return null;
}
