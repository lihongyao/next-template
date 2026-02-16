// src/lib/routes.ts

// 普通页面路由
export const PageRoutes = {
  Home: '/',
  Cart: '/cart',
  Order: '/order',
  Profile: '/profile',
  Login: '/login',
  Details: '/details',
  Dialog: '/dialog',
  DynamicComps: '/dynamic-comps',
  Examples: '/examples',
  Mine: '/mine',
  Products: '/products',
  ThemeAndSkin: '/theme-and-skin',
  I18n: '/i18n',
  Motion: '/motion',
  MotionSub: '/motion/sub',
  CdnImage: '/cdn-image',
  DataPathThrough: '/data-pass-through',
} as const;

// 弹窗路由
export const ModalRoutes = {
  ModalProfile: '/modal-profile',
  ModalLogin: '/modal-login',
} as const;

// 所有路由
export const Routes = {
  ...PageRoutes,
  ...ModalRoutes,
} as const;

export type Route = (typeof Routes)[keyof typeof Routes];
export type ModalRoute = (typeof ModalRoutes)[keyof typeof ModalRoutes];
export type PageRoute = (typeof PageRoutes)[keyof typeof PageRoutes];

/**
 * 弹窗路由 ↔ 页面路由映射
 *
 * 为实现移动端页面切换交互动效，二级页面在 H5 上以路由弹窗形式展现；
 * PC 端可为独立页面。根据设备断点动态切换对应路由。
 *
 * 使用方式：
 * - getModalOrPagePath(ModalPageRoutes.profile) 获取当前设备应跳转的路径
 * - 输入 ModalPageRoutes. 可联想所有已注册的 key（如 profile）
 *
 * @see useModalPageAutoCollapse
 * @see useModalRoutes
 */
export const ModalPageRoutes = {
  profile: {
    pc: Routes.Profile,
    h5: Routes.ModalProfile,
  },
} as const satisfies Record<string, { readonly pc: Route; readonly h5: Route }>;

/** ModalPageRoutes 的 key，用于遍历与索引 */
export type ModalPageRouteKey = keyof typeof ModalPageRoutes;

/** 单个弹窗/页面对应的路由配置 */
export type ModalPageRouteConfig = (typeof ModalPageRoutes)[ModalPageRouteKey];
