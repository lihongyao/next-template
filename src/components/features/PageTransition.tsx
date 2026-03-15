'use client';

import { useContext, useEffect, useRef, useState } from 'react';

import { LayoutRouterContext } from 'next/dist/shared/lib/app-router-context.shared-runtime';

import { AnimatePresence, motion } from 'framer-motion';

import { useSwipeBack } from '@/hooks/useSwipeBack';
import { usePathname } from '@/i18n/navigation';
import { ModalRoutes } from '@/libs/routes';
import { useGlobalStore } from '@/stores/useGlobalStore';

function isModalRoute(path: string): boolean {
  return Object.values(ModalRoutes).some((value) => path.includes(value));
}

/** 冻结 LayoutRouterContext，防止路由切换时布局提前更新 */
function FrozenRouteWrapper({ children }: { children: React.ReactNode }) {
  const context = useContext(LayoutRouterContext ?? {});
  const frozen = useRef(context).current;
  if (!frozen) return <>{children}</>;
  return <LayoutRouterContext.Provider value={frozen}>{children}</LayoutRouterContext.Provider>;
}

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const direction = useGlobalStore((s) => s.direction);
  const [swipeAllow, setSwipeAllow] = useState(true);
  const prevPathnameRef = useRef(pathname);

  useSwipeBack((value) => setSwipeAllow(!value), { enabled: true });

  // modal 跳过动画，其余左右滑动
  const currentIsModal = isModalRoute(pathname);
  const prevWasModal = isModalRoute(prevPathnameRef.current);
  const skipAnimation = currentIsModal || (prevWasModal && !currentIsModal);
  const isAllow = !skipAnimation && swipeAllow;

  useEffect(() => {
    prevPathnameRef.current = pathname;
  }, [pathname]);

  return (
    <AnimatePresence mode="popLayout" initial={isAllow}>
      <motion.div
        key={pathname}
        initial={isAllow ? (direction === 'forward' ? { x: '100%' } : { x: '-100%' }) : undefined}
        animate={isAllow ? { x: 0 } : undefined}
        exit={isAllow ? (direction === 'forward' ? { x: '-100%' } : { x: '100%' }) : undefined}
        transition={{ type: 'tween', duration: 0.25, ease: 'linear' }}
      >
        <FrozenRouteWrapper>{children}</FrozenRouteWrapper>
      </motion.div>
    </AnimatePresence>
  );
}
