'use client';

import { useRouter as useIntlRouter, usePathname } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { notifyMobileModalHistoryChange } from '@/libs/mobile-modal-history';
import { markBack, markForward, markReplace } from '@/libs/navigation-direction';
import { useDevice } from '@/providers/device.provider';

import { matchRouteMeta } from './matchRoute';
import { ModalRoutes } from './routes';

type NavigationOptions = {
  scroll?: boolean;
  [key: string]: unknown;
};

const modalSegments = new Set(Object.values(ModalRoutes).map((route) => route.replace(/^\//, '')));

function normalizeHrefPath(href: string): string {
  try {
    return new URL(href, window.location.origin).pathname;
  } catch {
    return href.split('?')[0] || href;
  }
}

function isModalPath(pathname: string): boolean {
  return pathname
    .split('/')
    .filter(Boolean)
    .some((segment) => modalSegments.has(segment));
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
    if (!isMobile || !isModalPath(normalizeHrefPath(href))) return null;

    const nativeHref = resolveNativeHref(href);
    // Modal 只更新自身 URL；绕过 Next 的 history 包装，避免底层页面树切成 modal 路由。
    History.prototype[method].call(window.history, null, '', nativeHref);
    notifyMobileModalHistoryChange();
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

      markForward(href);
      router.push(href, getOptions(href, options));
    },

    replace(href: string, options?: NavigationOptions) {
      const nativeHref = navigateModalWithNativeHistory('replaceState', href);
      if (nativeHref) {
        markReplace(nativeHref);
        return;
      }

      markReplace(href);
      router.replace(href, getOptions(href, options));
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
      router.prefetch(href);
    },
  };
}
