'use client';

import { usePathname } from '@/i18n/navigation';
import { useDevice } from '@/providers/device.provider';
import { matchRouteMeta } from '@/router';

import DesktopShell from './desktop';
import MobileLevel1 from './mobile/Level1';
import MobileLevel2 from './mobile/Level2';

export default function ResponsiveShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const meta = matchRouteMeta(pathname);
  const { isMobile } = useDevice();

  // ===== Desktop =====
  if (!isMobile) {
    return <DesktopShell>{children}</DesktopShell>;
  }

  // ===== Mobile =====
  if (meta.mobileLevel === 1) {
    return <MobileLevel1>{children}</MobileLevel1>;
  }
  if (meta.mobileLevel === 2) {
    return <MobileLevel2>{children}</MobileLevel2>;
  }

  // ===== Default =====
  return <MobileLevel1>{children}</MobileLevel1>;
}
