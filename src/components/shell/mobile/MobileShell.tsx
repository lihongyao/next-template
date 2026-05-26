'use client';

import { useEffect, useRef } from 'react';

import { motion } from 'framer-motion';

import AppTabBar from '@/components/features/AppTabBar';
import { KeepAlive } from '@/components/features/KeepAlive';
import { usePathname } from '@/i18n/navigation';
import {
  consumeDirection,
  consumeSkipNextTransition,
  shouldSkipNextTransition,
} from '@/libs/navigation-direction';
import { matchRouteMeta } from '@/router';
import { ModalRoutes, Routes } from '@/router/routes';

import Header from '../components/Header';
import FrozenRouter from './FrozenRouter';
import MobileLevel2 from './Level2';
import MobilePageTransition, { type Direction, type TransitionKind } from './MobilePageTransition';

type TabSnapshot = {
  pathname: string;
  children: React.ReactNode | null;
};

const tabTransition = { type: 'tween' as const, duration: 0.2, ease: 'easeOut' as const };

function isModalRoute(path: string): boolean {
  return Object.values(ModalRoutes).some((value) => path.includes(value));
}

function isSamePath(prevPathname: string, pathname: string): boolean {
  return prevPathname === pathname;
}

function shouldUseCoverTransition(prevPathname: string, pathname: string): boolean {
  if (isSamePath(prevPathname, pathname)) return false;
  if (isModalRoute(pathname) || isModalRoute(prevPathname)) return false;

  const prevMeta = matchRouteMeta(prevPathname);
  const nextMeta = matchRouteMeta(pathname);
  return prevMeta.mobileLevel === 2 || nextMeta.mobileLevel === 2;
}

export default function MobileShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const meta = matchRouteMeta(pathname);
  const direction = consumeDirection();
  const prevPathnameRef = useRef(pathname);
  const pathRef = useRef(pathname);
  const skipForCurrentPathRef = useRef(false);
  const lastTabRef = useRef<TabSnapshot>({
    pathname: Routes.Home,
    children: null,
  });
  const currentIsModal = isModalRoute(pathname);

  if (meta.mobileLevel === 1 && !currentIsModal) {
    lastTabRef.current = { pathname, children };
  }

  if (pathRef.current !== pathname) {
    pathRef.current = pathname;
    skipForCurrentPathRef.current = shouldSkipNextTransition();
    if (skipForCurrentPathRef.current) {
      consumeSkipNextTransition();
    }
  }

  const prevPathname = prevPathnameRef.current;
  const useCover =
    !skipForCurrentPathRef.current && shouldUseCoverTransition(prevPathname, pathname);
  const transitionKind: TransitionKind = useCover ? 'cover' : 'none';
  const transitionDirection: Direction = direction;
  const currentIsLevel1 = meta.mobileLevel === 1;
  const prevMeta = matchRouteMeta(prevPathname);
  const baseTab = currentIsLevel1
    ? { pathname, children }
    : lastTabRef.current.pathname
      ? lastTabRef.current
      : { pathname: Routes.Home, children: null };
  const showSubPage = meta.mobileLevel === 2;
  const useTabTransition =
    prevMeta.mobileLevel === 1 &&
    currentIsLevel1 &&
    !currentIsModal &&
    prevPathname !== pathname &&
    !skipForCurrentPathRef.current;

  useEffect(() => {
    prevPathnameRef.current = pathname;
    skipForCurrentPathRef.current = false;
  }, [pathname]);

  const level1Page = baseTab.children ? (
    <KeepAlive cacheKey={baseTab.pathname}>
      <FrozenRouter>{baseTab.children}</FrozenRouter>
    </KeepAlive>
  ) : null;

  return (
    <div className="relative min-h-dvh overflow-x-hidden text-white">
      <div
        aria-hidden={showSubPage || undefined}
        className={showSubPage ? 'pointer-events-none' : undefined}
      >
        <Header fixed />
        <main className="pt-[56px] pb-[calc(65px+env(safe-area-inset-bottom))]">
          {useTabTransition ? (
            <motion.div
              key={pathname}
              initial={{ opacity: 0.4, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={tabTransition}
            >
              {level1Page}
            </motion.div>
          ) : (
            level1Page
          )}
        </main>
        <AppTabBar />
      </div>
      <MobilePageTransition
        pageKey={pathname}
        direction={transitionDirection}
        kind={transitionKind}
      >
        {showSubPage ? <MobileLevel2>{children}</MobileLevel2> : null}
      </MobilePageTransition>
    </div>
  );
}
