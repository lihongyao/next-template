// src/components/features/dialogs/index.ts
// 注册弹框组件 loader，组件会在真正打开弹窗时再加载。

export const dialogRegistry = {
  X1Dialog: () => import('./X1Dialog'),
  X2Dialog: () => import('./X2Dialog'),
  X3Dialog: () => import('./X3Dialog'),
  SignOut: () => import('./SignOut'),
  Minors18: () => import('./popus/Minors18'),
  FirstVisit: () => import('./popus/FirstVisit'),
} as const;
