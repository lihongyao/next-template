'use client';

import { useLayoutEffect } from 'react';

import { useDevice } from '@/providers/device.provider';
import { usePathname, useRouter } from '@/router';
import { getDeviceRouteFallback } from '@/router/matchRoute';

export default function useDeviceRouteAvailability(): void {
  const pathname = usePathname();
  const router = useRouter();
  const { isMobile } = useDevice();

  useLayoutEffect(() => {
    const fallback = getDeviceRouteFallback(pathname, isMobile);
    if (!fallback || fallback === pathname) return;

    router.replace(fallback, { scroll: false });
  }, [isMobile, pathname, router]);
}
