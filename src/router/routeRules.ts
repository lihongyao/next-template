import { Routes } from '@/router/routes';

export type RouteMeta = {
  /** 移动端等级，1 表示一级页面，2 表示二级页面 */
  mobileLevel: 1 | 2;
  /** 桌面端等级，1 表示一级页面，2 表示二级页面 */
  desktopLevel: 1 | 2;
};

export const routeRules: Array<{
  path: string;
  meta: RouteMeta;
}> = [
  { path: Routes.Home, meta: { mobileLevel: 1, desktopLevel: 1 } },
  { path: Routes.GameList, meta: { mobileLevel: 2, desktopLevel: 1 } },
  { path: Routes.GameList + '/:id', meta: { mobileLevel: 2, desktopLevel: 1 } },
  { path: Routes.Cart, meta: { mobileLevel: 1, desktopLevel: 1 } },
  { path: Routes.Goods, meta: { mobileLevel: 2, desktopLevel: 1 } },
  { path: Routes.I18n, meta: { mobileLevel: 2, desktopLevel: 1 } },
  { path: Routes.Details, meta: { mobileLevel: 2, desktopLevel: 1 } },
  { path: Routes.Dialog, meta: { mobileLevel: 2, desktopLevel: 1 } },
  { path: Routes.DynamicComps, meta: { mobileLevel: 2, desktopLevel: 1 } },
  { path: Routes.DataPathThrough, meta: { mobileLevel: 2, desktopLevel: 1 } },
  { path: Routes.News, meta: { mobileLevel: 2, desktopLevel: 1 } },
  { path: Routes.News + '/:id', meta: { mobileLevel: 2, desktopLevel: 1 } },
  { path: Routes.Truco, meta: { mobileLevel: 1, desktopLevel: 1 } },
];
