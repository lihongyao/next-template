'use client';

import { useEffect, useState } from 'react';

const MOBILE_QUERY = '(max-width: 767px)';
const TABLET_QUERY = '(min-width: 768px) and (max-width: 1023px)';
const PC_QUERY = '(min-width: 1024px)';

export function useDevice() {
  const [state, setState] = useState<{
    isMobile: boolean | null;
    isTablet: boolean | null;
    isPC: boolean | null;
  }>({ isMobile: null, isTablet: null, isPC: null });

  useEffect(() => {
    const mobile = window.matchMedia(MOBILE_QUERY);
    const tablet = window.matchMedia(TABLET_QUERY);
    const pc = window.matchMedia(PC_QUERY);

    const update = () => {
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

  return state;
}
