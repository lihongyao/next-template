'use client';

import { useContext, useLayoutEffect, useRef, useState } from 'react';

import { LayoutRouterContext } from 'next/dist/shared/lib/app-router-context.shared-runtime';

import { motion } from 'framer-motion';

import { ZIndex } from '@/constants/z-index';

export type Direction = 'forward' | 'back';
export type TransitionKind = 'none' | 'cover';

type RouterContextValue = React.ContextType<typeof LayoutRouterContext>;
type PageLayer = {
  key: string;
  node: React.ReactNode;
  routerContext: RouterContextValue;
};

const transition = { type: 'tween' as const, duration: 0.28, ease: [0.32, 0.72, 0, 1] as const };
const baseZIndex = ZIndex.Header + 1;

function PageFrame({
  layer,
  zIndex,
  animateX,
  initialX = 0,
  onAnimationComplete,
}: {
  layer: PageLayer;
  zIndex: number;
  animateX: string | number;
  initialX?: string | number;
  onAnimationComplete?: () => void;
}) {
  return (
    <LayoutRouterContext.Provider value={layer.routerContext}>
      <motion.div
        className="fixed inset-0 min-h-dvh w-full overflow-y-auto bg-[#252526]"
        initial={{ x: initialX }}
        animate={{ x: animateX }}
        transition={transition}
        style={{
          zIndex,
          willChange: 'transform',
        }}
        onAnimationComplete={onAnimationComplete}
      >
        {layer.node}
      </motion.div>
    </LayoutRouterContext.Provider>
  );
}

export default function MobilePageTransition({
  children,
  direction,
  pageKey,
  kind,
  suspended = false,
}: {
  children: React.ReactNode | null;
  direction: Direction;
  pageKey: string;
  kind: TransitionKind;
  suspended?: boolean;
}) {
  const routerContext = useContext(LayoutRouterContext);
  const makeLayer = (): PageLayer | null =>
    children ? { key: pageKey, node: children, routerContext } : null;
  const liveLayer = suspended ? null : makeLayer();
  const hasLiveLayer = liveLayer !== null;
  const liveLayerRef = useRef<PageLayer | null>(null);

  const [currentLayer, setCurrentLayer] = useState<PageLayer | null>(liveLayer);
  const [underLayer, setUnderLayer] = useState<PageLayer | null>(null);
  const [exitLayer, setExitLayer] = useState<PageLayer | null>(null);
  const prevLayerRef = useRef<PageLayer | null>(currentLayer);
  const previousKeyRef = useRef(pageKey);
  const shouldAnimate = kind === 'cover';

  useLayoutEffect(() => {
    if (!suspended) {
      liveLayerRef.current = liveLayer;
    }
  });

  useLayoutEffect(() => {
    if (suspended) return;

    const nextLayer = liveLayerRef.current;
    const previousLayer = prevLayerRef.current;

    if (previousKeyRef.current === pageKey) {
      prevLayerRef.current = nextLayer;
      if (nextLayer) {
        setCurrentLayer((layer) => layer ?? nextLayer);
      }
      return;
    }

    previousKeyRef.current = pageKey;

    if (direction === 'forward' && previousLayer && nextLayer && shouldAnimate) {
      setUnderLayer(previousLayer);
      setExitLayer(null);
    } else if (direction === 'back' && previousLayer && shouldAnimate) {
      setUnderLayer(null);
      setExitLayer(previousLayer);
    } else {
      setUnderLayer(null);
      setExitLayer(null);
    }

    setCurrentLayer(nextLayer);
    prevLayerRef.current = nextLayer;
  }, [direction, hasLiveLayer, pageKey, shouldAnimate, suspended]);

  const renderedCurrentLayer =
    !suspended && currentLayer?.key === pageKey ? liveLayer : currentLayer;
  const currentInitialX = shouldAnimate && direction === 'forward' ? '100%' : 0;
  const currentZIndex = direction === 'forward' ? baseZIndex + 1 : baseZIndex;
  const exitZIndex = direction === 'back' ? baseZIndex + 1 : baseZIndex;
  const clearUnderLayer = (layerKey: string) => {
    setUnderLayer((layer) => (layer?.key === layerKey ? null : layer));
  };

  return (
    <>
      {underLayer ? (
        <PageFrame
          key={`under-${underLayer.key}`}
          layer={underLayer}
          zIndex={baseZIndex}
          initialX={0}
          animateX={0}
        />
      ) : null}
      {renderedCurrentLayer ? (
        <PageFrame
          key={renderedCurrentLayer.key}
          layer={renderedCurrentLayer}
          zIndex={currentZIndex}
          initialX={currentInitialX}
          animateX={0}
          onAnimationComplete={
            underLayer && direction === 'forward'
              ? () => clearUnderLayer(underLayer.key)
              : undefined
          }
        />
      ) : null}
      {exitLayer ? (
        <PageFrame
          key={`exit-${exitLayer.key}`}
          layer={exitLayer}
          zIndex={exitZIndex}
          initialX={0}
          animateX="100%"
          onAnimationComplete={() => setExitLayer(null)}
        />
      ) : null}
    </>
  );
}
