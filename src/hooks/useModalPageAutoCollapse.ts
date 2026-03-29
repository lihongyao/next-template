'use client';

import { useLayoutEffect } from 'react';

import { useSearchParams } from 'next/navigation';

import { usePathname, useRouter } from '@/i18n/navigation';
import { useDevice } from '@/providers/device.provider';
import { type ModalPageRouteKey, ModalPageRoutes } from '@/router/routes';

const BASE_STORAGE_PREFIX = '__mpc_pc_base__';

function baseStorageKey(routeKey: ModalPageRouteKey): string {
  return `${BASE_STORAGE_PREFIX}${String(routeKey)}`;
}

/**
 * 返回 route 在 pathname 中作为「独立路径段」的起始下标。
 * 例如 /i18n/modal-profile 里 /modal-profile 从 index 5 开始，前一个字符是 n，
 * 不能再用「前一个字符必须是 /」判断；应按段名匹配（modal-profile）。
 */
function segmentIndex(pathname: string, route: string): number {
  const seg = route.replace(/^\//, '').split('/').filter(Boolean);
  if (seg.length !== 1) {
    let i = pathname.indexOf(route);
    while (i !== -1) {
      const beforeOk = i === 0 || pathname[i - 1] === '/';
      const afterOk = i + route.length === pathname.length || pathname[i + route.length] === '/';
      if (beforeOk && afterOk) return i;
      i = pathname.indexOf(route, i + 1);
    }
    return -1;
  }
  const name = seg[0];
  const parts = pathname.split('/').filter(Boolean);
  const k = parts.lastIndexOf(name);
  if (k === -1) return -1;
  const prefix = parts.slice(0, k);
  if (prefix.length === 0) return 0;
  return 1 + prefix.join('/').length;
}

function joinBasePc(base: string, pc: string): string {
  const b = base.replace(/\/$/, '');
  return `${b}${pc}`;
}

function hasParamTail(tail: string): boolean {
  return tail.replace(/^\/+/, '').length > 0;
}

/**
 * PC：弹窗路由可叠在任意页后，如 /order/modal-profile（与 resolveRouteForCurrentDevice + merge 一致）
 * H5：独立页 /profile
 *
 * PC → H5：整段收拢为 h5 + 尾部参数，不再保留底层路径；若有底层路径则写入 localStorage，便于 H5 → PC 时恢复 /order/modal-profile
 */
export default function useModalPageAutoCollapse(): void {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isMobile } = useDevice();

  useLayoutEffect(() => {
    if (isMobile == null || typeof window === 'undefined') return;

    const query = searchParams.toString();
    const withQuery = (path: string) => (query ? `${path}?${query}` : path);

    for (const key of Object.keys(ModalPageRoutes) as ModalPageRouteKey[]) {
      const config = ModalPageRoutes[key];
      const { pc, h5 } = config;
      const onlyWhenParam =
        'onlySwitchWhenParamPresent' in config && config.onlySwitchWhenParamPresent;

      if (isMobile) {
        const i = segmentIndex(pathname, pc);
        if (i === -1) continue;
        const tail = pathname.slice(i + pc.length);
        if (onlyWhenParam && !hasParamTail(tail)) continue;
        const baseBeforeModal = i > 0 ? pathname.slice(0, i).replace(/\/$/, '') : '';
        if (baseBeforeModal) {
          localStorage.setItem(baseStorageKey(key), baseBeforeModal);
        } else {
          localStorage.removeItem(baseStorageKey(key));
        }
        const next = `${h5}${tail}`;
        if (next !== pathname) router.replace(withQuery(next));
        return;
      }

      const i = segmentIndex(pathname, h5);
      if (i === -1) continue;
      const tail = pathname.slice(i + h5.length);
      if (onlyWhenParam && !hasParamTail(tail)) continue;
      // 已经是目标形态（如 /news/modal-news-details/2），避免重复拼接导致循环 replace
      if (tail === pc || tail.startsWith(`${pc}/`)) return;
      const storedBase = localStorage.getItem(baseStorageKey(key)) ?? '';
      // 详情型路由（onlyWhenParam）在首次 H5->PC 且无 base 时，默认挂在 h5 列表路径下
      // 例如：/news/2 -> /news/modal-news-details/2
      const next = storedBase
        ? joinBasePc(storedBase, pc) + tail
        : onlyWhenParam
          ? `${h5}${pc}${tail}`
          : `${pc}${tail}`;
      localStorage.removeItem(baseStorageKey(key));
      if (next !== pathname) router.replace(withQuery(next));
      return;
    }
  }, [pathname, isMobile, router, searchParams]);
}
