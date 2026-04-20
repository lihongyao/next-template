'use client';

import { memo, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

import { motion } from 'framer-motion';

import { Link, usePathname, useRouter } from '@/i18n/navigation';
import { cn } from '@/libs/class-helpers';
import { type Route, Routes } from '@/router/routes';

import Icon from '../ui/Icon';
import {
  type DockGlassMapsResult,
  buildDockGlassFilterMaps,
} from '../ui/LiquidGlass/dockGlassMaps';

const DOCK_GLASS_FILTER_ID = 'appTabBarDockGlass';

/** test.html initDockDemo: track 80px, bubble 66px → 比例用于 65px 栏高 */
const BUBBLE_H = Math.round((65 * 66) / 80);
const TRACK_H = 65;
const TRACK_PAD_X = 8;

/** 拖拽超出范围时的橡皮筋系数（对齐 test.html dock） */
const RUBBER_MO = 15;

export interface TabBarItemProps {
  path: Route;
  label: string;
  icon: string;
}

export const TabRoutes: Route[] = [Routes.Home, Routes.Cart, Routes.Order, Routes.Profile];
export default memo(function AppTabBar() {
  const tabBarConfig: TabBarItemProps[] = [
    { path: Routes.Home, label: '首页', icon: 'home' },
    { path: Routes.Cart, label: '购物车', icon: 'cart' },
    { path: Routes.Order, label: '订单', icon: 'order' },
    { path: Routes.Profile, label: '个人中心', icon: 'profile' },
  ];
  const pathname = usePathname();
  const router = useRouter();
  const trackRef = useRef<HTMLDivElement>(null);
  const [slotWidth, setSlotWidth] = useState(0);
  const [glassMaps, setGlassMaps] = useState<DockGlassMapsResult | null>(null);
  const [bubbleX, setBubbleX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{
    startClientX: number;
    startBubbleX: number;
    maxX: number;
  } | null>(null);

  const activeIndex = Math.max(
    0,
    tabBarConfig.findIndex((item) => item.path === pathname),
  );

  useEffect(() => {
    if (!isDragging) {
      setBubbleX(activeIndex * slotWidth);
    }
  }, [activeIndex, isDragging, slotWidth]);

  useLayoutEffect(() => {
    const el = trackRef.current;
    if (!el || typeof window === 'undefined') return;

    const apply = () => {
      const tw = el.offsetWidth;
      const sw = Math.max(0, (tw - TRACK_PAD_X * 2) / tabBarConfig.length);
      setSlotWidth(sw);
      if (sw < 8) return;
      const w = Math.round(sw);
      const h = BUBBLE_H;
      setGlassMaps(buildDockGlassFilterMaps(w, h, Math.floor(h / 2)));
    };

    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const bubbleTop = (TRACK_H - BUBBLE_H) / 2;

  const applyRubberBand = useCallback((x: number, maxX: number) => {
    if (x < 0) return -RUBBER_MO * (1 - Math.exp(x / 50));
    if (x > maxX) return maxX + RUBBER_MO * (1 - Math.exp(-(x - maxX) / 50));
    return x;
  }, []);

  const endDrag = useCallback(() => {
    setIsDragging(false);
    dragRef.current = null;
  }, []);

  const handleBubblePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.button !== 0 || slotWidth <= 0) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      const maxX = Math.max(0, (tabBarConfig.length - 1) * slotWidth);
      dragRef.current = {
        startClientX: e.clientX,
        startBubbleX: bubbleX,
        maxX,
      };
      setIsDragging(true);
    },
    [bubbleX, slotWidth, tabBarConfig.length],
  );

  const handleBubblePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const d = dragRef.current;
      if (!d) return;
      const raw = d.startBubbleX + (e.clientX - d.startClientX);
      setBubbleX(applyRubberBand(raw, d.maxX));
    },
    [applyRubberBand],
  );

  const handleBubblePointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const d = dragRef.current;
      if (!d) return;
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        /* already released */
      }

      const maxX = d.maxX;
      const raw = d.startBubbleX + (e.clientX - d.startClientX);
      const clamped = Math.max(0, Math.min(maxX, raw));
      const nearest = Math.round(clamped / slotWidth);
      const idx = Math.max(0, Math.min(tabBarConfig.length - 1, nearest));

      endDrag();
      setBubbleX(idx * slotWidth);

      const target = tabBarConfig[idx];
      if (target && target.path !== pathname) {
        router.push(target.path);
      }
    },
    [endDrag, pathname, router, slotWidth, tabBarConfig],
  );

  const handleBubblePointerCancel = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!dragRef.current) return;
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        /* */
      }
      endDrag();
      setBubbleX(activeIndex * slotWidth);
    },
    [activeIndex, endDrag, slotWidth],
  );

  return (
    // bottom-0 才会被 iOS safari 底部工具栏吸取颜色
    <div
      data-name="app-tab-bar"
      className="fixed bottom-0 left-0 w-full"
      style={{
        paddingBottom: 'calc(env(safe-area-inset-bottom))',
      }}
    >
      <div
        className="relative h-[65px] w-full overflow-hidden rounded-t-3xl bg-[#161616] px-2"
        ref={trackRef}
      >
        {glassMaps && slotWidth > 0 && (
          <motion.div
            animate={{ x: bubbleX }}
            className="absolute z-30 touch-none will-change-transform"
            initial={false}
            style={{
              borderRadius: BUBBLE_H / 2,
              height: BUBBLE_H,
              left: TRACK_PAD_X,
              top: bubbleTop,
              width: slotWidth,
            }}
            transition={
              isDragging ? { duration: 0 } : { damping: 26, stiffness: 450, type: 'spring' }
            }
          >
            <svg className="absolute h-0 w-0" aria-hidden>
              <defs>
                <filter
                  colorInterpolationFilters="sRGB"
                  height="200%"
                  id={DOCK_GLASS_FILTER_ID}
                  width="200%"
                  x="-50%"
                  y="-50%"
                >
                  <feGaussianBlur in="SourceGraphic" result="blurred" stdDeviation="0.8" />
                  <feImage
                    height={glassMaps.height}
                    href={glassMaps.displacementDataUrl}
                    preserveAspectRatio="none"
                    result="displacement_map"
                    width={glassMaps.width}
                    x="0"
                    y="0"
                  />
                  <feDisplacementMap
                    in="blurred"
                    in2="displacement_map"
                    result="displaced"
                    scale={glassMaps.displacementScale}
                    xChannelSelector="R"
                    yChannelSelector="G"
                  />
                  <feColorMatrix
                    in="displaced"
                    result="displaced_saturated"
                    type="saturate"
                    values="1.2"
                  />
                  <feImage
                    height={glassMaps.height}
                    href={glassMaps.specularDataUrl}
                    preserveAspectRatio="none"
                    result="specular_layer"
                    width={glassMaps.width}
                    x="0"
                    y="0"
                  />
                  <feComponentTransfer in="specular_layer" result="specular_faded">
                    <feFuncA slope="0.8" type="linear" />
                  </feComponentTransfer>
                  <feBlend in="specular_faded" in2="displaced_saturated" mode="screen" />
                </filter>
              </defs>
            </svg>
            <div
              className="absolute inset-0 rounded-[inherit]"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow:
                  '0 10px 30px rgba(0, 0, 0, 0.5), inset 0 2px 5px rgba(255, 255, 255, 0.3), inset 0 0 20px rgba(255, 255, 255, 0.1)',
                WebkitBackdropFilter: `url(#${DOCK_GLASS_FILTER_ID})`,
                backdropFilter: `url(#${DOCK_GLASS_FILTER_ID})`,
                zIndex: 3,
              }}
            />
            <div
              aria-hidden
              className="absolute inset-0 z-[4] cursor-grab rounded-[inherit] active:cursor-grabbing"
              onPointerCancel={handleBubblePointerCancel}
              onPointerDown={handleBubblePointerDown}
              onPointerMove={handleBubblePointerMove}
              onPointerUp={handleBubblePointerUp}
              style={{ touchAction: 'none' }}
            />
          </motion.div>
        )}

        <div className="relative z-20 flex h-full w-full">
          {tabBarConfig.map((item) => (
            <Link
              className="flex flex-1 flex-col items-center justify-center gap-1"
              href={item.path}
              key={item.path}
              scroll={false}
            >
              <Icon
                className="size-5"
                color={pathname === item.path ? 'orange' : 'white'}
                src={item.icon}
              />
              <span
                className={cn('text-xs', pathname === item.path ? 'text-[orange]' : 'text-[white]')}
              >
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
});
