'use client';

import { useLayoutEffect, useRef } from 'react';

import { usePathname, useRouter } from '@/i18n/navigation';
import { ModalPageRouteKey, ModalPageRoutes } from '@/libs/routes';

import { useDevice } from './useDevices';
import { useMounted } from './useMounted';

const BASE_KEY = '__modal_base_path__';

/** pathname 是否匹配 route（精确或带子路径） */
function matchRoute(pathname: string, route: string): boolean {
  if (pathname.indexOf(route) === -1) return false;
  return pathname === route || pathname.includes(route + '/') || pathname.endsWith(route);
}

/** PC/H5 视窗切换时在 modal 路由与独立页路由间切换，带 base 的 modal 会记 base 便于切回 */
export default function useModalPageAutoCollapse(): void {
  const pathname = usePathname();
  const router = useRouter();
  const mounted = useMounted();
  const { isMobile } = useDevice();
  const prevIsMobile = useRef(isMobile);

  useLayoutEffect(() => {
    if (!mounted) return;

    let matchedKey: ModalPageRouteKey | '' = '';
    let basePath = '';
    let paramSegment = '';

    // 先匹配 h5 再匹配 pc，否则 /game-list/modal-game-details/1 会误命中 pc，paramSegment 带 modal 段，切 PC 不生效
    for (const key of Object.keys(ModalPageRoutes) as ModalPageRouteKey[]) {
      const { pc, h5 } = ModalPageRoutes[key];

      const h5Index = pathname.indexOf(h5);
      if (h5Index !== -1 && matchRoute(pathname, h5)) {
        matchedKey = key;
        basePath = pathname.slice(0, h5Index);
        paramSegment = pathname.slice(h5Index + h5.length);
        break;
      }

      const pcIndex = pathname.indexOf(pc);
      if (pcIndex !== -1 && matchRoute(pathname, pc)) {
        matchedKey = key;
        basePath = pathname.slice(0, pcIndex);
        paramSegment = pathname.slice(pcIndex + pc.length);
        break;
      }
    }

    if (!matchedKey) {
      localStorage.removeItem(BASE_KEY);
      return;
    }

    // 仅 gameDetails 区分列表/详情：列表页不随视窗切换，详情页才切；profile 等无参页始终随视窗切换
    if (matchedKey === 'gameDetails' && paramSegment.length <= 1) return;
    if (prevIsMobile.current === isMobile) return;
    prevIsMobile.current = isMobile;

    const config = ModalPageRoutes[matchedKey];
    let targetPath: string;
    if (isMobile) {
      const finalBase = basePath || localStorage.getItem(BASE_KEY) || '';
      targetPath = finalBase + config.h5 + paramSegment;
      localStorage.setItem(BASE_KEY, finalBase);
    } else {
      targetPath = config.pc + paramSegment;
      localStorage.setItem(BASE_KEY, basePath);
    }
    if (targetPath !== pathname) router.replace(targetPath);
  }, [pathname, isMobile, mounted, router]);
}
