'use client';

import { useRouter as useIntlRouter } from '@/i18n/navigation';
import { markBack, markForward, markReplace } from '@/libs/navigation-direction';

export default function useAppRouter() {
  const router = useIntlRouter();

  return {
    push(href: string, options?: any) {
      markForward(href);
      router.push(href, options);
    },

    replace(href: string, options?: any) {
      markReplace(href);
      router.replace(href, options);
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
