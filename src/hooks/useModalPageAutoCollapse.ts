'use client';

import { useLayoutEffect, useRef } from 'react';

import { usePathname, useRouter } from '@/i18n/navigation';
import { ModalPageRouteKey, ModalPageRoutes } from '@/libs/routes';

import { useDevice } from './useDevices';
import { useMounted } from './useMounted';

const BASE_KEY = '__modal_base_path__';

export default function useModalPageAutoCollapse(): void {
  const pathname = usePathname();
  const router = useRouter();
  const mounted = useMounted();
  const { isMobile } = useDevice();

  const prevIsMobile = useRef(isMobile);

  useLayoutEffect(() => {
    if (!mounted) return;

    // ✅ 防止 resize 抖动
    if (prevIsMobile.current === isMobile) return;
    prevIsMobile.current = isMobile;

    const query = window.location.search;

    let matchedKey: ModalPageRouteKey | '' = '';
    let matchedPrefix = '';
    let basePath = '';
    let paramSegment = '';

    for (const key of Object.keys(ModalPageRoutes) as ModalPageRouteKey[]) {
      const { pc, h5 } = ModalPageRoutes[key];

      // ---- 匹配 PC 独立页 ----
      const pcIndex = pathname.indexOf(pc);
      if (
        pcIndex !== -1 &&
        (pathname === pc || pathname.startsWith(pc + '/') || pathname.includes(pc + '/'))
      ) {
        matchedKey = key;
        matchedPrefix = pc;

        basePath = pathname.slice(0, pcIndex);
        paramSegment = pathname.slice(pcIndex + pc.length);
        break;
      }

      // ---- 匹配 H5 弹窗 ----
      const h5Index = pathname.indexOf(h5);
      if (h5Index !== -1 && (pathname === h5 || pathname.includes(h5 + '/'))) {
        matchedKey = key;
        matchedPrefix = h5;

        basePath = pathname.slice(0, h5Index);
        paramSegment = pathname.slice(h5Index + h5.length);
        break;
      }
    }

    if (!matchedKey) return;

    const config = ModalPageRoutes[matchedKey];

    let targetPath = '';

    if (isMobile) {
      // PC → H5
      // 挂在 basePath 下
      const finalBase = basePath || localStorage.getItem(BASE_KEY) || '';
      targetPath = finalBase + config.h5 + paramSegment;

      localStorage.setItem(BASE_KEY, finalBase);
    } else {
      // H5 → PC
      targetPath = config.pc + paramSegment;
    }

    if (targetPath === pathname) return;

    router.replace(targetPath + query);
  }, [pathname, isMobile, mounted, router]);
}
