'use client';

import { useRouter as useIntlRouter, usePathname } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import {
  readRouteModalHistoryState,
  startRouteModalPageTransition,
  writeRouteModalHistoryEntry,
} from '@/libs/mobile-modal-history';
import { getCanonicalHref, shouldOpenAsRouteModal } from '@/libs/modal-page-routes-utils';
import { markBack, markForward, markReplace } from '@/libs/navigation-direction';
import { useDevice } from '@/providers/device.provider';

import { getDeviceRouteFallback, matchRouteMeta } from './matchRoute';

type NavigationOptions = {
  scroll?: boolean;
  [key: string]: unknown;
};

// 统一抽出 pathname，避免 query/hash 干扰 routeRules 和 modal 判断。
function normalizeHrefPath(href: string): string {
  try {
    return new URL(href, window.location.origin).pathname;
  } catch {
    return href.split('?')[0] || href;
  }
}

// 当当前页面带 locale、目标地址没带 locale 时，补回本地化前缀给原生 history 用。
function resolveNativeHref(href: string): string {
  const url = new URL(href, window.location.origin);
  const currentFirstSegment = window.location.pathname.split('/').filter(Boolean)[0];
  const targetFirstSegment = url.pathname.split('/').filter(Boolean)[0];
  const currentHasLocale = routing.locales.includes(currentFirstSegment);
  const targetHasLocale = routing.locales.includes(targetFirstSegment);

  if (currentHasLocale && !targetHasLocale && currentFirstSegment !== routing.defaultLocale) {
    url.pathname = `/${currentFirstSegment}${url.pathname === '/' ? '' : url.pathname}`;
  }

  return `${url.pathname}${url.search}${url.hash}`;
}

// 移动端一级/二级页 cover 切换时默认保留滚动位置，避免底页被意外顶回顶部。
function shouldPreserveScrollForMobileCover({
  currentPathname,
  href,
  isMobile,
}: {
  currentPathname: string;
  href: string;
  isMobile: boolean;
}) {
  if (!isMobile) return false;

  const currentMeta = matchRouteMeta(currentPathname);
  const nextMeta = matchRouteMeta(normalizeHrefPath(href));
  return currentMeta.mobileLevel === 2 || nextMeta.mobileLevel === 2;
}

function withMobileCoverScrollOption(
  options: NavigationOptions | undefined,
  shouldPreserveScroll: boolean,
): NavigationOptions | undefined {
  if (!shouldPreserveScroll || options?.scroll !== undefined) return options;
  return { ...options, scroll: false };
}

export default function useAppRouter() {
  const router = useIntlRouter();
  const { isMobile } = useDevice();
  const currentPathname = usePathname();

  // 目标是 route modal 时不切 Next 页面树，只改地址栏和 history state。
  const navigateModalWithNativeHistory = (
    method: 'pushState' | 'replaceState',
    href: string,
  ): string | null => {
    const canonicalHref = getCanonicalHref(href);
    if (!shouldOpenAsRouteModal(canonicalHref, isMobile === true)) return null;

    const nativeHref = resolveNativeHref(canonicalHref);
    // Route modal 只更新地址栏；绕过 Next 的页面树切换，底页由当前 React tree 保持。
    writeRouteModalHistoryEntry({
      method,
      href: nativeHref,
      basePathname: currentPathname || '/',
    });
    return nativeHref;
  };

  // 当前已经在 route modal 里、且目标是普通页面时，先登记“modal 退场 + 页面进场”的桥接状态。
  const prepareActiveRouteModalBeforePageNavigation = (href: string) => {
    const modalState = readRouteModalHistoryState();
    if (!modalState) return;

    const canonicalHref = getCanonicalHref(href);
    if (shouldOpenAsRouteModal(canonicalHref, isMobile === true)) return;

    startRouteModalPageTransition(canonicalHref, modalState.modalPathname);
  };

  const getOptions = (href: string, options?: NavigationOptions) =>
    withMobileCoverScrollOption(
      options,
      shouldPreserveScrollForMobileCover({
        currentPathname,
        href,
        isMobile,
      }),
    );

  return {
    push(href: string, options?: NavigationOptions) {
      const nativeHref = navigateModalWithNativeHistory('pushState', href);
      if (nativeHref) {
        markForward(nativeHref);
        return;
      }

      const canonicalHref = getCanonicalHref(href);
      prepareActiveRouteModalBeforePageNavigation(canonicalHref);
      const nextHref =
        getDeviceRouteFallback(normalizeHrefPath(canonicalHref), isMobile === true) ??
        canonicalHref;
      markForward(nextHref);
      router.push(nextHref, getOptions(nextHref, options));
    },

    replace(href: string, options?: NavigationOptions) {
      const nativeHref = navigateModalWithNativeHistory('replaceState', href);
      if (nativeHref) {
        markReplace(nativeHref);
        return;
      }

      const canonicalHref = getCanonicalHref(href);
      prepareActiveRouteModalBeforePageNavigation(canonicalHref);
      const nextHref =
        getDeviceRouteFallback(normalizeHrefPath(canonicalHref), isMobile === true) ??
        canonicalHref;
      markReplace(nextHref);
      router.replace(nextHref, getOptions(nextHref, options));
    },

    back() {
      markBack();
      router.back();
    },

    forward() {
      markForward();
      window.history.forward();
    },

    refresh() {
      router.refresh();
    },

    prefetch(href: string) {
      router.prefetch(getCanonicalHref(href));
    },
  };
}
