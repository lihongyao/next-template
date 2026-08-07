'use client';

import { useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';

import { LayoutRouterContext } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { useSelectedLayoutSegments } from 'next/navigation';

import AppTabBar from '@/components/features/AppTabBar';
import {
  isRouteModalHistoryEntry,
  isRouteModalPageTransitionTarget,
} from '@/libs/mobile-modal-history';
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
  const pendingTabTransitionPathRef = useRef<string | null>(null);
  const lastLevel1Ref = useRef<PageLayer | null>(null);
  const [animatingTabPathname, setAnimatingTabPathname] = useState<string | null>(null);
  const currentIsModal = isModalRoute(pathname);
  const currentIsLevel1 = meta.mobileLevel === 1;
  const currentIsTabPage = currentIsLevel1 && !currentIsModal;
  const renderedIsLevel1 = renderedMeta.mobileLevel === 1 && !isModalRoute(renderedPathname);
  const currentLevel1Layer =
    currentIsTabPage && renderedIsLevel1 && renderedPathname === pathname
      ? { pathname: renderedPathname, node: children, routerContext }
      : null;
  const currentLevel1Ready = currentLevel1Layer !== null;

  if (pathRef.current !== pathname) {
    const previousPathname = pathRef.current;
    const previousMeta = matchRouteMeta(previousPathname);

    pathRef.current = pathname;
    skipForCurrentPathRef.current = shouldSkipNextTransition();
    if (skipForCurrentPathRef.current) {
      consumeSkipNextTransition();
    }

    pendingTabTransitionPathRef.current =
      previousMeta.mobileLevel === 1 &&
      currentIsLevel1 &&
      !isModalRoute(previousPathname) &&
      !currentIsModal &&
      !skipForCurrentPathRef.current
        ? pathname
        : null;
  }

  const prevPathname = prevPathnameRef.current;
  const isRouteModalPageEnter =
    typeof window !== 'undefined' && isRouteModalPageTransitionTarget(pathname);
  const useCover =
    !skipForCurrentPathRef.current &&
    (isRouteModalPageEnter || shouldUseCoverTransition(prevPathname, pathname));
  const transitionKind: TransitionKind = useCover ? 'cover' : 'none';
  const transitionDirection: Direction = direction;
  const prevMeta = matchRouteMeta(prevPathname);
  const baseLayer = currentLevel1Layer ?? lastLevel1Ref.current ?? null;
  const showSubPage = meta.mobileLevel === 2;
  const renderSubPage = showSubPage && renderedMeta.mobileLevel === 2;
  const isNativeRouteModalEntry =
    typeof window !== 'undefined' ? isRouteModalHistoryEntry() : false;
  const elevatedPageTransition =
    isRouteModalPageEnter ||
    (typeof window !== 'undefined' &&
      transitionDirection === 'back' &&
      isNativeRouteModalEntry &&
      prevMeta.mobileLevel === 2);

  useEffect(() => {
    prevPathnameRef.current = pathname;
    skipForCurrentPathRef.current = false;
  }, [pathname]);

  useLayoutEffect(() => {
    if (!renderedIsLevel1) return;

    const nextLayer = { pathname: renderedPathname, node: children, routerContext };
    lastLevel1Ref.current = nextLayer;
  }, [children, renderedIsLevel1, renderedPathname, routerContext]);

  useLayoutEffect(() => {
    if (animatingTabPathname && animatingTabPathname !== pathname) {
      setAnimatingTabPathname(null);
    }

    if (!currentLevel1Ready || pendingTabTransitionPathRef.current !== pathname) return;

    pendingTabTransitionPathRef.current = null;
    setAnimatingTabPathname(pathname);
  }, [animatingTabPathname, currentLevel1Ready, pathname]);

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
          {baseLayer ? (
            <div
              key={baseLayer.pathname}
              className={
                animatingTabPathname === baseLayer.pathname ? 'animate-tab-page-enter' : undefined
              }
              onAnimationEnd={(event) => {
                if (event.currentTarget !== event.target) return;
                setAnimatingTabPathname((current) =>
                  current === baseLayer.pathname ? null : current,
                );
              }}
            >
              {level1Page}
            </div>
          ) : null}
        </main>
        <AppTabBar />
      </div>
      <MobilePageTransition
        pageKey={pathname}
        direction={transitionDirection}
        kind={transitionKind}
        suspended={currentIsModal}
        elevated={elevatedPageTransition}
      >
        {renderSubPage ? <MobileLevel2>{children}</MobileLevel2> : null}
      </MobilePageTransition>
    </div>
  );
}
