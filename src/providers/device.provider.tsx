'use client';

import { type ReactNode, createContext, useContext, useEffect, useState } from 'react';

import { UAParser } from 'ua-parser-js';

export type DeviceState = {
  isMobile: boolean | null;
  isTablet: boolean | null;
  isDesktop: boolean | null;
};

const DeviceContext = createContext<DeviceState | null>(null);
export const uaParser = new UAParser();

export function DeviceProvider({
  children,
  userAgent,
}: {
  userAgent: string;
  children: ReactNode;
}) {
  uaParser.setUA(userAgent);
  const result = uaParser.getResult();

  const [state, setState] = useState<DeviceState>({
    isMobile: result.device.type === 'mobile',
    isTablet: result.device.type === 'tablet',
    isDesktop: result.device.type === 'desktop',
  });

  useEffect(() => {
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
          return prev; // 状态未变，跳过 re-render，避免多个 media query 同时触发时重复更新
        }
        console.log('响应式断点变化 >>> ', nextState);
        return nextState;
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
