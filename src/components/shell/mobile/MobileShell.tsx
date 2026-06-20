'use client';

import { useContext, useEffect, useLayoutEffect, useRef } from 'react';

import { LayoutRouterContext } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { useSelectedLayoutSegments } from 'next/navigation';

import { motion } from 'framer-motion';

import AppTabBar from '@/components/features/AppTabBar';
import {
  consumeDirection,
  consumeSkipNextTransition,
  shouldSkipNextTransition,
} from '@/libs/navigation-direction';
import { matchRouteMeta, usePathname } from '@/router';
import { ModalRoutes, Routes } from '@/router/routes';

import Header from '../components/Header';
import MobileLevel2 from './Level2';
import MobilePageTransition, { type Direction, type TransitionKind } from './MobilePageTransition';

type RouterContextValue = React.ContextType<typeof LayoutRouterContext>;
type PageLayer = {
  pathname: string;
  node: React.ReactNode;
  routerContext: RouterContextValue;
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

function getPathnameFromSegments(segments: string[] | null): string {
  const routeSegments = (segments ?? []).filter(
    (segment) => segment && !segment.startsWith('(') && !segment.startsWith('@'),
  );
  return routeSegments.length > 0 ? `/${routeSegments.join('/')}` : Routes.Home;
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
  const renderedPathname = getPathnameFromSegments(useSelectedLayoutSegments());
  const routerContext = useContext(LayoutRouterContext);
  const meta = matchRouteMeta(pathname);
  const renderedMeta = matchRouteMeta(renderedPathname);
  const direction = consumeDirection();
  const prevPathnameRef = useRef(pathname);
  const pathRef = useRef(pathname);
  const skipForCurrentPathRef = useRef(false);
  const level1CacheRef = useRef(new Map<string, PageLayer>());
  const lastLevel1Ref = useRef<PageLayer | null>(null);
  const currentIsModal = isModalRoute(pathname);
  const currentIsLevel1 = meta.mobileLevel === 1;
  const currentIsTabPage = currentIsLevel1 && !currentIsModal;
  const renderedIsLevel1 = renderedMeta.mobileLevel === 1 && !isModalRoute(renderedPathname);
  const currentLevel1Layer =
    currentIsTabPage && renderedIsLevel1 && renderedPathname === pathname
      ? { pathname: renderedPathname, node: children, routerContext }
      : null;

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
  const baseLayer =
    currentLevel1Layer ??
    (currentIsTabPage ? level1CacheRef.current.get(pathname) : null) ??
    lastLevel1Ref.current ??
    null;
  const showSubPage = meta.mobileLevel === 2;
  const renderSubPage = showSubPage && renderedMeta.mobileLevel === 2;
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

  useLayoutEffect(() => {
    if (!renderedIsLevel1) return;

    const nextLayer = { pathname: renderedPathname, node: children, routerContext };
    level1CacheRef.current.set(renderedPathname, nextLayer);
    lastLevel1Ref.current = nextLayer;
  }, [children, renderedIsLevel1, renderedPathname, routerContext]);

  const level1Page = baseLayer ? (
    <LayoutRouterContext.Provider value={baseLayer.routerContext}>
      {baseLayer.node}
    </LayoutRouterContext.Provider>
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
        {renderSubPage ? <MobileLevel2>{children}</MobileLevel2> : null}
      </MobilePageTransition>
    </div>
  );
}
