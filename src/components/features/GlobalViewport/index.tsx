'use client';

import { ZIndex } from '@/constants/z-index';
import { useDevice } from '@/providers/device.provider';

import BackToTop from './BackToTop';

export default function GlobalViewport() {
  const { isDesktop } = useDevice();

  if (!isDesktop) return null;

  return (
    <div className="pointer-events-none fixed inset-0" style={{ zIndex: ZIndex.FloatingBar }}>
      <BackToTop />
    </div>
  );
}
