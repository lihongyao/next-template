import { Routes } from '@/libs/routes';

export type RouteMeta = {
  mobileLevel: number;
  desktopLevel: number;
  keepAlive?: boolean;
};

export const routes: Record<string, RouteMeta> = {
  [Routes.Home]: { mobileLevel: 1, desktopLevel: 1, keepAlive: true },
  [Routes.GameList]: { mobileLevel: 2, desktopLevel: 1 },
  [Routes.Cart]: { mobileLevel: 1, desktopLevel: 1 },
  [Routes.Goods]: { mobileLevel: 2, desktopLevel: 1 },
  [Routes.I18n]: { mobileLevel: 2, desktopLevel: 1 },
  [Routes.Details]: { mobileLevel: 2, desktopLevel: 1 },
  [Routes.Dialog]: { mobileLevel: 2, desktopLevel: 1 },
};
