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
} as const;

export const ModalRoutes = {
  ModalProfile: '/modal-profile',
} as const;

export const Routes = {
  ...PageRoutes,
  ...ModalRoutes,
} as const;

export type Route = (typeof Routes)[keyof typeof Routes];
export type ModalRoute = (typeof ModalRoutes)[keyof typeof ModalRoutes];
export type PageRoute = (typeof PageRoutes)[keyof typeof PageRoutes];
