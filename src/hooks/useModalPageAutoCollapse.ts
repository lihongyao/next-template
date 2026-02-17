'use client';

import { useLayoutEffect } from 'react';

import { usePathname, useRouter } from '@/i18n/navigation';
import { ModalPageRouteKey, ModalPageRoutes } from '@/libs/routes';

import { useDevice } from './useDevices';
import { useMounted } from './useMounted';

const BASE_KEY = '__modal_base_path__';

/** 反向索引：pc/h5 路由路径 → ModalPageRouteKey */
const routeToKeyMap: Record<string, ModalPageRouteKey> = {};
(Object.keys(ModalPageRoutes) as ModalPageRouteKey[]).forEach((key) => {
  const { pc, h5 } = ModalPageRoutes[key];
  routeToKeyMap[pc] = key;
  routeToKeyMap[h5] = key;
});

/**
 * 监听设备断点变化，自动将 H5 弹窗路由与 PC 页面路由相互切换
 *
 * - 当 pathname 匹配某 ModalPageRoutes 的 pc 或 h5 路由时
 * - 根据当前 isMobile 决定目标路径（PC 独立页 vs H5 弹窗）
 * - 自动 router.replace 到目标路径
 */
export default function useModalPageAutoCollapse(): void {
  const pathname = usePathname();
  const router = useRouter();
  const mounted = useMounted();
  const { isMobile } = useDevice();

  useLayoutEffect(() => {
    if (!mounted) return;

    const query = window.location.search;

    // ① 匹配 pathname 对应的 subPath 与 key
    let matchedKey: ModalPageRouteKey | '' = '';
    let subPath = '';

    for (const key of Object.keys(ModalPageRoutes) as ModalPageRouteKey[]) {
      const { pc, h5 } = ModalPageRoutes[key];
      if (pathname.endsWith(pc)) {
        matchedKey = key;
        subPath = pc;
        break;
      }
      if (pathname.endsWith(h5)) {
        matchedKey = key;
        subPath = h5;
        break;
      }
    }

    if (!matchedKey) return;

    const config = ModalPageRoutes[matchedKey];

    // ② 计算 basePath（pathname 去掉 subPath 后的前缀）
    const basePath = pathname.slice(0, pathname.length - subPath.length) || '';

    // ③ H5 modal 挂在 basePath 下，需记住以便设备切换时恢复
    if (subPath === config.h5) {
      localStorage.setItem(BASE_KEY, basePath);
    }

    const restoredBase = localStorage.getItem(BASE_KEY) || '';

    // ④ 根据设备计算目标路径并跳转
    const targetSub = isMobile ? config.h5 : config.pc;
    let targetPath = '';

    if (isMobile) {
      // H5 modal 挂在 base 下（如 /en/my/modal-rollover）
      targetPath = restoredBase + targetSub;
    } else {
      // PC page 是独立完整路由（如 /wallet/rollover）
      targetPath = targetSub;
    }

    if (targetPath === pathname) return;

    router.replace(targetPath + query);
  }, [pathname, isMobile]);
}
