'use client';

import { useContext, useEffect, useRef, useState } from 'react';

import { LayoutRouterContext } from 'next/dist/shared/lib/app-router-context.shared-runtime';

import { AnimatePresence, motion } from 'framer-motion';

import { useSwipeBack } from '@/hooks/useSwipeBack';
import { usePathname } from '@/i18n/navigation';
import { ModalRoutes, TabRoutes } from '@/libs/routes';
import { useGlobalStore } from '@/stores/useGlobalStore';

function isModalRoute(path: string): boolean {
  return Object.values(ModalRoutes).some((value) => path.includes(value));
}

function isTabRoute(path: string): boolean {
  return Object.values(TabRoutes).some((value) => {
    if (value === '/') {
      return path === '/' || path === '' || /^\/[a-z]{2}(-[A-Z]{2})?\/?$/.test(path);
    }
    return path.includes(value);
  });
}

// 阻止页面立即打开，先让退场动画走完，再显示新的页面内容
function FrozenRouter(props: { children: React.ReactNode }) {
  const context = useContext(LayoutRouterContext ?? {});
  const frozen = useRef(context).current;

  return (
    <LayoutRouterContext.Provider value={frozen}>{props.children}</LayoutRouterContext.Provider>
  );
}

export default function PageTransition({
  children,
  tab = false,
}: {
  children: React.ReactNode;
  tab?: boolean;
}) {
  const pathname = usePathname();
  const direction = useGlobalStore((s) => s.direction);
  const [swipeAllow, setSwipeAllow] = useState(true);
  const pathnameRef = useRef(pathname);
  const prevPathnameRef = useRef<string | null>(null);

  useSwipeBack((value) => setSwipeAllow(!value), { enabled: true });

  useEffect(() => {
    if (pathnameRef.current !== pathname) {
      prevPathnameRef.current = pathnameRef.current;
      pathnameRef.current = pathname;
    }
  }, [pathname]);

  const prevPathname = prevPathnameRef.current ?? pathname;
  // modal 跳过动画；tab 页淡入淡出；其余左右滑动
  const currentIsModal = isModalRoute(pathname);
  const prevWasModal = isModalRoute(prevPathname);
  const currentIsTab = isTabRoute(pathname);
  const prevWasTab = isTabRoute(prevPathname);
  const skipAnimation = currentIsModal || (prevWasModal && !currentIsModal);
  const isAllow = !skipAnimation && swipeAllow;
  const useFade = tab || currentIsTab || (prevWasTab && currentIsTab);

  const transition = { type: 'tween' as const, duration: 0.25, ease: 'linear' as const };
  const initial = isAllow
    ? useFade
      ? { opacity: 0 }
      : direction === 'forward'
        ? { x: '100%' }
        : { x: '-100%' }
    : undefined;
  const animate = isAllow ? (useFade ? { opacity: 1 } : { x: 0 }) : undefined;
  const exit = isAllow
    ? useFade
      ? { opacity: 0 }
      : direction === 'forward'
        ? { x: '-100%' }
        : { x: '100%' }
    : undefined;

  return (
    <AnimatePresence mode="popLayout" initial={isAllow}>
      <motion.div
        key={pathname}
        initial={initial}
        animate={animate}
        exit={exit}
        transition={transition}
      >
        <FrozenRouter>{children}</FrozenRouter>
      </motion.div>
    </AnimatePresence>
  );
}
