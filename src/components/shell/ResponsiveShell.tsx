'use client';

import { useDevice } from '@/providers/device.provider';

import DesktopShell from './desktop';
import MobileShell from './mobile/MobileShell';

export default function ResponsiveShell({ children }: { children: React.ReactNode }) {
  const { isMobile } = useDevice();

  // ===== Desktop =====
  if (!isMobile) {
    return <DesktopShell>{children}</DesktopShell>;
  }

  // ===== Mobile =====
  return <MobileShell>{children}</MobileShell>;
}
