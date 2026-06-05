// src/lib/routes.ts

/**
 * 路由分类
 * 1. PC/H5 均是独立页
 * 2. PC/H5 均是路由弹窗
 * 2. PC 是路由弹窗，H5 是独立页
 * 3. H5 是路由弹窗，PC 是独立页
 */

// 标签栏路由
export const TabRoutes = {
  Home: '/',
  Cart: '/cart',
  Order: '/order',
  Promotion: '/promotion',
};

// 页面路由
export const PageRoutes = {
  Dashboard: '/dashboard',
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
  Goods: '/goods',
  News: '/news',
} as const;

// 弹窗路由
export const ModalRoutes = {
  ModalLogin: '/login',
  ModalRegister: '/register',
  ModalProfile: '/profile',
  ModalGameListSwiper: '/game-list-swiper',
  ModalGameDetails: '/game-details',
  ModalNewsDetails: '/news-details',
} as const;

// 所有路由
export const Routes = {
  ...TabRoutes,
  ...PageRoutes,
  ...ModalRoutes,
} as const;

// 受保护（需要登录）的路由
export const ProtectedRoutes = [Routes.ModalProfile] as const;

export type Route = (typeof Routes)[keyof typeof Routes];
export type TabRoute = (typeof TabRoutes)[keyof typeof TabRoutes];
export type ModalRoute = (typeof ModalRoutes)[keyof typeof ModalRoutes];
export type PageRoute = (typeof PageRoutes)[keyof typeof PageRoutes];

export type ModalPageRouteConfig = {
  readonly canonical: Route;
  readonly pc: Route;
  readonly h5: Route;
  readonly onlySwitchWhenParamPresent?: boolean;
  readonly parentKey?: 'game-list';
};

/**
 * 同一业务路由在 PC / H5 下的展示策略。
 *
 * - canonical：地址栏与后台配置统一使用的标准路径。
 * - pc / h5：当前设备实际渲染的页面或 modal 路由。
 * - onlySwitchWhenParamPresent：设为 true 表示只有带参数尾巴时才命中，例如 /news/1。
 * - parentKey：当前 modal 需要嵌套在另一个 modal 中渲染时使用。
 *
 * 业务跳转应优先使用 canonical 路径，router 代理会按设备自动决定是正常页面跳转
 * 还是保留底页的 route modal。
 *
 * @see useModalRoutes
 */
export const ModalPageRoutes = {
  'news-details': {
    canonical: Routes.News,
    pc: Routes.ModalNewsDetails,
    h5: Routes.News,
    onlySwitchWhenParamPresent: true,
  },
  'game-list': {
    canonical: Routes.GameList,
    pc: Routes.GameList,
    h5: Routes.ModalGameListSwiper,
  },
  /** 详情页在 h5 下嵌套于 gameList 内：modal-game-list/modal-game-details/1 */
  gameDetails: {
    canonical: Routes.GameList,
    pc: Routes.GameDetails,
    h5: Routes.ModalGameDetails,
    onlySwitchWhenParamPresent: true,
    parentKey: 'game-list',
  },
} as const satisfies Record<string, ModalPageRouteConfig>;

/** ModalPageRoutes 的 key，用于遍历与索引 */
export type ModalPageRouteKey = keyof typeof ModalPageRoutes;

/** 单个弹窗/页面对应的路由配置 */
export type ModalPageRouteEntry = (typeof ModalPageRoutes)[ModalPageRouteKey];
