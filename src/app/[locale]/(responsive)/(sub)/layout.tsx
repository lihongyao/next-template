// src/app/[locale]/(responsive)/(sub)/layout.tsx
'use client';

import { useContext, useEffect, useRef } from 'react';

import { LayoutRouterContext } from 'next/dist/shared/lib/app-router-context.shared-runtime';

import { AnimatePresence, motion } from 'framer-motion';

import { usePathname } from '@/i18n/navigation';
import {
  consumeDirection,
  consumeSkipNextTransition,
  shouldSkipNextTransition,
} from '@/libs/navigation-direction';
import { useDevice } from '@/providers/device.provider';
import { ModalRoutes } from '@/router/routes';

function isModalRoute(path: string): boolean {
  return Object.values(ModalRoutes).some((value) => path.includes(value));
}

// 阻止页面立即打开，先让退场动画走完，再显示新的页面内容
function FrozenRouter(props: { children: React.ReactNode }) {
  const context = useContext(LayoutRouterContext ?? {});
  const frozen = useRef(context).current;

  return (
    <LayoutRouterContext.Provider value={frozen}>{props.children}</LayoutRouterContext.Provider>
  );
}

export default function ShellLayout({ children }: { children: React.ReactNode }) {
  const { isMobile } = useDevice();
  const pathname = usePathname();
  const prevPathnameRef = useRef(pathname);
  const pathRef = useRef(pathname);
  const skipForCurrentPathRef = useRef(false);

  if (pathRef.current !== pathname) {
    pathRef.current = pathname;
    const shouldSkip = shouldSkipNextTransition();
    skipForCurrentPathRef.current = shouldSkip;
    if (shouldSkip) {
      consumeSkipNextTransition();
    }
  }

  // modal 跳过动画，其余左右滑动
  const currentIsModal = isModalRoute(pathname);
  const prevWasModal = isModalRoute(prevPathnameRef.current);
  const skipForUaTransition = skipForCurrentPathRef.current;
  const skipAnimation = currentIsModal || (prevWasModal && !currentIsModal) || skipForUaTransition;
  const isAllow = !skipAnimation;

  useEffect(() => {
    prevPathnameRef.current = pathname;
  }, [pathname]);

  // 方向必须同步读取，避免 useEffect 更新慢一拍导致首个 back/forward 方向错误
  const dir = consumeDirection();

  if (!isMobile) return children;
  if (skipForUaTransition) return children;

  const transition = { type: 'tween' as const, duration: 0.25, ease: 'linear' as const };
  const variants = {
    enter: (custom: { dir: 'forward' | 'back'; allow: boolean }) =>
      custom.allow ? { x: custom.dir === 'forward' ? '100%' : '-100%' } : { x: 0 },
    center: { x: 0 },
    exit: (custom: { dir: 'forward' | 'back'; allow: boolean }) =>
      custom.allow ? { x: custom.dir === 'forward' ? '-100%' : '100%' } : { x: 0 },
  };
  const transitionCustom = { dir, allow: isAllow };

  return (
    <AnimatePresence mode="popLayout" initial={true} custom={transitionCustom}>
      <motion.div
        key={pathname}
        custom={transitionCustom}
        variants={variants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={transition}
      >
        <FrozenRouter>{children}</FrozenRouter>
      </motion.div>
    </AnimatePresence>
  );
}
