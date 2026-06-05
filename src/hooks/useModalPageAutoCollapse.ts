'use client';

import { useLayoutEffect, useState } from 'react';

import { useSearchParams } from 'next/navigation';

import { notifyMobileModalHistoryChange } from '@/libs/mobile-modal-history';
import {
  getCanonicalHref,
  getLocalPathname,
  shouldOpenAsRouteModal,
} from '@/libs/modal-page-routes-utils';
import { useDevice } from '@/providers/device.provider';
import { usePathname, useRouter } from '@/router';

/**
 * 视窗切换时不再把地址改成 PC/H5 私有路径。
 *
 * URL 始终保持 canonical；如果当前设备应以 route modal 展示，就只通知
 * RouteModalRenderer 重新按设备解释当前地址。若从 modal 展示切到独立页展示，
 * 则让 Next 接管 canonical 路由，补齐页面树。
 */
export default function useModalPageAutoCollapse(): void {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isMobile } = useDevice();
  const [viewportIsMobile, setViewportIsMobile] = useState<boolean | null>(null);
  const routeAsMobile = viewportIsMobile ?? isMobile === true;

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return;

    const mobile = window.matchMedia('(max-width: 767px)');
    const updateViewport = () => setViewportIsMobile(mobile.matches);
    updateViewport();
    mobile.addEventListener('change', updateViewport);
    return () => mobile.removeEventListener('change', updateViewport);
  }, []);

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return;

    const query = searchParams.toString();
    const browserHref = `${window.location.pathname}${query ? `?${query}` : ''}`;
    const canonicalHref = getCanonicalHref(browserHref);
    const canonicalUrl = new URL(canonicalHref, window.location.origin);
    const canonicalPathname = canonicalUrl.pathname;
    const localCanonicalPathname = getLocalPathname(canonicalPathname);
    const localCanonicalHref = `${localCanonicalPathname}${canonicalUrl.search}${canonicalUrl.hash}`;
    const isRouteModal = shouldOpenAsRouteModal(canonicalHref, routeAsMobile);

    if (window.location.pathname !== canonicalPathname) {
      History.prototype.replaceState.call(window.history, window.history.state, '', canonicalHref);
    }

    if (isRouteModal) {
      notifyMobileModalHistoryChange();
      return;
    }

    if (pathname !== localCanonicalPathname) {
      router.replace(localCanonicalHref, { scroll: false });
    }
  }, [routeAsMobile, pathname, router, searchParams]);
}
