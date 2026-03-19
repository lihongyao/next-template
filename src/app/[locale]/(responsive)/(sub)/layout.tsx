// src/app/[locale]/(responsive)/(sub)/layout.tsx
'use client';

import { useContext, useEffect, useRef, useState } from 'react';

import { LayoutRouterContext } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { useSearchParams } from 'next/navigation';

import { AnimatePresence, motion } from 'framer-motion';

import { useSwipeBack } from '@/hooks/useSwipeBack';
import { usePathname } from '@/i18n/navigation';
import { consumeDirection } from '@/libs/navigation-direction';
import { useDevice } from '@/providers/device.provider';
import { ModalRoutes } from '@/router/routes';
import { useGlobalStore } from '@/stores/useGlobalStore';

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
  const direction = useGlobalStore((s) => s.direction);
  const [swipeAllow, setSwipeAllow] = useState(true);
  const prevPathnameRef = useRef(pathname);

  useSwipeBack((value) => setSwipeAllow(!value), { enabled: true });

  // modal 跳过动画；tab 页淡入淡出；其余左右滑动
  const currentIsModal = isModalRoute(pathname);
  const prevWasModal = isModalRoute(prevPathnameRef.current);
  const skipAnimation = currentIsModal || (prevWasModal && !currentIsModal);
  const isAllow = !skipAnimation && swipeAllow;

  useEffect(() => {
    prevPathnameRef.current = pathname;
  }, [pathname]);

  const search = useSearchParams();
  const url = pathname;
  // const url = pathname + '?' + search.toString();
  // const dir = resolveDirection(url);
  // console.log('dir:', dir);
  // const rawDir = resolveDirection(url);
  // const dir = useStableDirection(rawDir);

  const [dir, setDir] = useState<'forward' | 'back'>('forward');

  // useEffect(() => {
  //   const next = resolveDirection(url);
  //   setDir(next);
  // }, [url]);

  useEffect(() => {
    setDir(consumeDirection());
  }, [url]);

  if (!isMobile) return children;

  const transition = { type: 'tween' as const, duration: 0.25, ease: 'linear' as const };
  // const initial = isAllow ? (dir === 'forward' ? { x: '100%' } : { x: '-100%' }) : undefined;
  // const animate = isAllow ? { x: 0 } : undefined;
  // const exit = isAllow ? (dir === 'forward' ? { x: '-100%' } : { x: '100%' }) : undefined;
  const variants = {
    enter: (dir: string) => {
      console.log('enter dir >>> ', dir, url);
      return {
        x: dir === 'forward' ? '100%' : '-100%',
      };
    },
    center: { x: 0 },
    exit: (dir: string) => {
      console.log('exit dir >>> ', dir, url);
      return {
        x: dir === 'forward' ? '-100%' : '100%',
      };
    },
  };

  return (
    <AnimatePresence mode="popLayout" initial={true} custom={dir}>
      <motion.div
        key={url}
        custom={dir}
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
