'use client';

import { type ReactNode, createContext, useContext, useEffect, useState } from 'react';

const MOBILE_QUERY = '(max-width: 767px)';
const TABLET_QUERY = '(min-width: 768px) and (max-width: 1023px)';
const PC_QUERY = '(min-width: 1024px)';

export type DeviceState = {
  isMobile: boolean | null;
  isTablet: boolean | null;
  isPC: boolean | null;
};

const DeviceContext = createContext<DeviceState | null>(null);

export function DeviceProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DeviceState>({
    isMobile: null,
    isTablet: null,
    isPC: null,
  });

  useEffect(() => {
    const mobile = window.matchMedia(MOBILE_QUERY);
    const tablet = window.matchMedia(TABLET_QUERY);
    const pc = window.matchMedia(PC_QUERY);

    const update = () => {
      console.log('响应式断点更新：', mobile.matches, tablet.matches, pc.matches);
      setState({
        isMobile: mobile.matches,
        isTablet: tablet.matches,
        isPC: pc.matches,
      });
    };

    update();
    mobile.addEventListener('change', update);
    tablet.addEventListener('change', update);
    pc.addEventListener('change', update);

    return () => {
      mobile.removeEventListener('change', update);
      tablet.removeEventListener('change', update);
      pc.removeEventListener('change', update);
    };
  }, []);

  return <DeviceContext.Provider value={state}>{children}</DeviceContext.Provider>;
}

export function useDevice() {
  const ctx = useContext(DeviceContext);
  if (!ctx) throw new Error('useDevice 必须在 DeviceProvider 内使用');
  return ctx;
}
