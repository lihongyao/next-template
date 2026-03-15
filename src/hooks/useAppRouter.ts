'use client';

import { useRouter as useIntlRouter } from '@/i18n/navigation';
import { useGlobalStore } from '@/stores/useGlobalStore';

export default function useAppRouter() {
  const router = useIntlRouter();
  const { setDirection: setNextDirection } = useGlobalStore((s) => s);

  return {
    push(href: string, options?: any) {
      setNextDirection('forward');
      router.push(href, options);
    },

    replace(href: string, options?: any) {
      // replace 不应该产生 forward 动画
      setNextDirection('forward');
      router.replace(href, options);
    },

    back() {
      setNextDirection('backward');
      router.back();
    },

    forward() {
      setNextDirection('forward');
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
