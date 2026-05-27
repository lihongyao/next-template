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
const modalRouteSegments = new Set(
  Object.values(ModalRoutes).map((value) => value.replace(/^\//, '')),
);

function isModalRoute(path: string): boolean {
  return path
    .split('/')
    .filter(Boolean)
    .some((segment) => modalRouteSegments.has(segment));
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
  const lastTabRef = useRef<TabSnapshot | null>(null);
  const currentIsModal = isModalRoute(pathname);
  const currentIsLevel1 = meta.mobileLevel === 1;
  const currentIsTabPage = currentIsLevel1 && !currentIsModal;

  // App Router may provide destination children before usePathname reflects that destination.
  // Do not overwrite the cached tab for the same path during that intermediate render.
  if (currentIsTabPage && lastTabRef.current?.pathname !== pathname) {
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
  const prevMeta = matchRouteMeta(prevPathname);
  const baseTab =
    lastTabRef.current ??
    (currentIsTabPage ? { pathname, children } : { pathname: Routes.Home, children: null });
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
        suspended={currentIsModal}
      >
        {showSubPage ? <MobileLevel2>{children}</MobileLevel2> : null}
      </MobilePageTransition>
    </div>
  );
}
