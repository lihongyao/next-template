'use client';

import { useLayoutEffect, useRef } from 'react';

import { useSearchParams } from 'next/navigation';

import { usePathname, useRouter } from '@/i18n/navigation';
import { ModalPageRouteKey, ModalPageRoutes } from '@/libs/routes';
import { useDevice } from '@/providers/device.provider';

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
  const searchParams = useSearchParams();
  const { isMobile } = useDevice();
  const prevIsMobile = useRef(isMobile);

  useLayoutEffect(() => {
    if (isMobile === null) return;

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

    const config = ModalPageRoutes[matchedKey];
    // 列表+详情型：仅当路径带参数（如 /game-list/1、/modal-game-details/1）时才随视窗切换，列表页（无参）不切换
    const onlyWhenParam =
      'onlySwitchWhenParamPresent' in config && config.onlySwitchWhenParamPresent;
    if (onlyWhenParam && paramSegment.length <= 1) return;
    if (prevIsMobile.current === isMobile) return;
    prevIsMobile.current = isMobile;

    let targetPath: string;
    if (isMobile) {
      const finalBase = basePath || localStorage.getItem(BASE_KEY) || '';
      targetPath = finalBase + config.h5 + paramSegment;
      localStorage.setItem(BASE_KEY, finalBase);
    } else {
      targetPath = config.pc + paramSegment;
      localStorage.setItem(BASE_KEY, basePath);
    }
    const queryString = searchParams.toString();
    const targetUrl = queryString ? `${targetPath}?${queryString}` : targetPath;
    if (targetPath !== pathname) router.replace(targetUrl);
  }, [pathname, isMobile, router, searchParams]);
}
