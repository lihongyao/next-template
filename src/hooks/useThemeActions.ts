// src/hooks/useThemeActions.ts
import type { Layout, Skin, Theme } from '@/configs/brands/types';
import cookieHelper from '@/libs/cookie-helper';

export function useThemeActions() {
  const setSkin = (newSkin: Skin) => {
    cookieHelper.set('skin', newSkin, { path: '/', expires: 365 });
    window.location.reload();
  };
  const setTheme = (newTheme: Theme) => {
    cookieHelper.set('theme', newTheme, { path: '/', expires: 365 });
    window.location.reload();
  };

  const setLayout = (newLayout: Layout) => {
    cookieHelper.set('layout', newLayout, { path: '/', expires: 365 });
    window.location.reload();
  };
  return { setSkin, setTheme, setLayout };
}
