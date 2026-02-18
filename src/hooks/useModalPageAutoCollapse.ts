'use client';

import { useLayoutEffect, useRef } from 'react';

import { usePathname, useRouter } from '@/i18n/navigation';
import { ModalPageRouteKey, ModalPageRoutes } from '@/libs/routes';

import { useDevice } from './useDevices';
import { useMounted } from './useMounted';

const BASE_KEY = '__modal_base_path__';

/** pathname 是否包含 route（精确 / 前缀 / 后缀） */
function matchRoute(pathname: string, route: string): boolean {
  if (pathname.indexOf(route) === -1) return false;
  return pathname === route || pathname.includes(route + '/') || pathname.endsWith(route);
}

/**
 * 视窗 PC/H5 切换时，自动在 modal 弹窗路由与独立页路由间切换。
 * 二级页面（如 /dialog）下的 modal 会记住 base，切回时恢复。
 */
export default function useModalPageAutoCollapse(): void {
  const pathname = usePathname();
  const router = useRouter();
  const mounted = useMounted();
  const { isMobile } = useDevice();

  const prevIsMobile = useRef(isMobile);

  useLayoutEffect(() => {
    if (!mounted) return;

    const query = window.location.search;

    let matchedKey: ModalPageRouteKey | '' = '';
    let basePath = '';
    let paramSegment = '';

    for (const key of Object.keys(ModalPageRoutes) as ModalPageRouteKey[]) {
      const { pc, h5 } = ModalPageRoutes[key];

      const pcIndex = pathname.indexOf(pc);
      if (pcIndex !== -1 && matchRoute(pathname, pc)) {
        matchedKey = key;
        basePath = pathname.slice(0, pcIndex);
        paramSegment = pathname.slice(pcIndex + pc.length);
        break;
      }

      const h5Index = pathname.indexOf(h5);
      if (h5Index !== -1 && matchRoute(pathname, h5)) {
        matchedKey = key;
        basePath = pathname.slice(0, h5Index);
        paramSegment = pathname.slice(h5Index + h5.length);
        break;
      }
    }

    if (!matchedKey) {
      localStorage.removeItem(BASE_KEY);
      return;
    }

    // 仅详情页（带参数段）随视窗切换；列表页如 /game 不切换，避免拖拽视窗时误跳
    const hasDetailSegment = paramSegment.length > 1;
    if (!hasDetailSegment) return;

    if (prevIsMobile.current === isMobile) return;
    prevIsMobile.current = isMobile;

    const config = ModalPageRoutes[matchedKey];

    if (isMobile) {
      const finalBase = basePath || localStorage.getItem(BASE_KEY) || '';
      const targetPath = finalBase + config.h5 + paramSegment;
      localStorage.setItem(BASE_KEY, finalBase);
      if (targetPath !== pathname) router.replace(targetPath + query);
    } else {
      localStorage.setItem(BASE_KEY, basePath);
      const targetPath = config.pc + paramSegment;
      if (targetPath !== pathname) router.replace(targetPath + query);
    }
  }, [pathname, isMobile, mounted, router]);
}
