// src/lib/routes.ts

// 页面路由
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
  GameList: '/game-list',
  GameDetails: '/game-list',
} as const;

// 弹窗路由
export const ModalRoutes = {
  ModalProfile: '/modal-profile',
  ModalLogin: '/modal-login',
  ModalGameDetails: '/modal-game-details',
  ModalRegister: '/modal-register',
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
 * 当H5为路由弹窗页面，PC为独立页面时， 为实现H5/PC之间的动态切换。
 * 需在这里定义对应的映射关系，useModalPageAutoCollapse 会自动处理 H5/PC 之间的动态切换。
 * 如：/profile <-> /modal-profile
 *
 * 涉及参数时，处理有点复杂，比如：
 * 1. 游戏列表：/game-list（列表页） /game-list/1（PC 详情） /modal-game-details/1（H5 弹窗详情）
 * 2. 仅当「当前路径带参数」时才随视窗切换；列表页（无参）不切换。无参页（如 profile）始终切换。
 *
 * - onlySwitchWhenParamPresent：设为 true 表示该条是「列表+详情」型，仅当 path 带参数（详情）时才切换，列表页不切换。
 *
 * @see useModalPageAutoCollapse
 * @see useModalRoutes
 */
export const ModalPageRoutes = {
  profile: {
    pc: Routes.Profile,
    h5: Routes.ModalProfile,
  },
  gameDetails: {
    pc: Routes.GameDetails,
    h5: Routes.ModalGameDetails,
    onlySwitchWhenParamPresent: true,
  },
} as const satisfies Record<
  string,
  { readonly pc: Route; readonly h5: Route; readonly onlySwitchWhenParamPresent?: boolean }
>;

/** ModalPageRoutes 的 key，用于遍历与索引 */
export type ModalPageRouteKey = keyof typeof ModalPageRoutes;

/** 单个弹窗/页面对应的路由配置 */
export type ModalPageRouteConfig = (typeof ModalPageRoutes)[ModalPageRouteKey];
