'use client';

import { type ReactNode, createContext, useContext, useLayoutEffect, useState } from 'react';

import { parseDeviceFromUA } from '@/libs/device';

export type DeviceState = {
  isiOS: boolean;
  isAndroid: boolean;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
};

const DeviceContext = createContext<DeviceState | null>(null);

export function DeviceProvider({
  children,
  userAgent,
}: {
  userAgent: string;
  children: ReactNode;
}) {
  const [state, setState] = useState<DeviceState>(() => ({
    ...parseDeviceFromUA(userAgent),
  }));

  useLayoutEffect(() => {
    const mobile = window.matchMedia('(max-width: 767px)');
    const tablet = window.matchMedia('(min-width: 768px) and (max-width: 1023px)');
    const desktop = window.matchMedia('(min-width: 1024px)');

    const update = () => {
      const nextState = {
        isMobile: mobile.matches,
        isTablet: tablet.matches,
        isDesktop: desktop.matches,
      };
      setState((prev) => {
        if (
          prev.isMobile === nextState.isMobile &&
          prev.isTablet === nextState.isTablet &&
          prev.isDesktop === nextState.isDesktop
        ) {
          return prev;
        }
        return { ...prev, ...nextState };
      });
    };

    update();
    mobile.addEventListener('change', update);
    tablet.addEventListener('change', update);
    desktop.addEventListener('change', update);

    return () => {
      mobile.removeEventListener('change', update);
      tablet.removeEventListener('change', update);
      desktop.removeEventListener('change', update);
    };
  }, []);

  return <DeviceContext.Provider value={state}>{children}</DeviceContext.Provider>;
}

export function useDevice() {
  const ctx = useContext(DeviceContext);
  if (!ctx) throw new Error('useDevice 必须在 DeviceProvider 内使用');
  return ctx;
}
