'use client';

import { useRouter as useIntlRouter, usePathname } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { writeRouteModalHistoryEntry } from '@/libs/mobile-modal-history';
import { getCanonicalHref, shouldOpenAsRouteModal } from '@/libs/modal-page-routes-utils';
import { markBack, markForward, markReplace } from '@/libs/navigation-direction';
import { useDevice } from '@/providers/device.provider';

import { getDeviceRouteFallback, matchRouteMeta } from './matchRoute';

type NavigationOptions = {
  scroll?: boolean;
  [key: string]: unknown;
};

function normalizeHrefPath(href: string): string {
  try {
    return new URL(href, window.location.origin).pathname;
  } catch {
    return href.split('?')[0] || href;
  }
}

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
