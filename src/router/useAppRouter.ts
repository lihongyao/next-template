'use client';

import { useRouter as useIntlRouter, usePathname } from '@/i18n/navigation';
import { markBack, markForward, markReplace } from '@/libs/navigation-direction';
import { useDevice } from '@/providers/device.provider';

import { matchRouteMeta } from './matchRoute';

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
      markForward(href);
      router.push(href, getOptions(href, options));
    },

    replace(href: string, options?: NavigationOptions) {
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
