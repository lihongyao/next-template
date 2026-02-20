import type React from 'react';

import dynamic from 'next/dynamic';

import type { WidgetConfig } from './types';

/* =======================
 * 1️⃣ Widget Registry
 * ======================= */
export const widgetRegistry = {
  card: {
    cfg: () => import('./card'),
    client: () => import('./card/client'),
    suspense: () => import('./card/suspense'),
  },
  nested: {
    cfg: () => import('./nested'),
    client: () => import('./nested/client'),
    suspense: () => import('./nested/suspense'),
  },
  banner: {
    cfg: () => import('./banner'),
    client: () => import('./banner/client'),
    suspense: () => import('./banner/suspense'),
  },
  footer: {
    cfg: () => import('./footer'),
    client: () => import('./footer/client'),
    suspense: () => import('./footer/suspense'),
  },
  divider: {
    cfg: () => import('./divider'),
    client: () => import('./divider/client'),
    suspense: () => import('./divider/suspense'),
  },
} as const;

export type WidgetType = keyof typeof widgetRegistry;

/* =======================
 * 2️⃣ Type Guard
 * ======================= */
export function isWidgetType(type: string): type is WidgetType {
  return type in widgetRegistry;
}

/* =======================
 * 3️⃣ Server：WidgetConfig 加载 & 缓存
 * ======================= */

const widgetConfigCache = new Map<WidgetType, WidgetConfig>();

export async function loadWidget(type: WidgetType): Promise<WidgetConfig> {
  if (widgetConfigCache.has(type)) {
    return widgetConfigCache.get(type)!;
  }

  const mod = await widgetRegistry[type].cfg();
  widgetConfigCache.set(type, mod.default);

  return mod.default;
}

/* =======================
 * 4️⃣ Client：Dynamic Component 加载 & 缓存
 * ======================= */

type Loader = () => Promise<{ default: React.ComponentType<any> }>;

// loader 本身就是最稳定的 cache key
const dynamicComponentCache = new Map<Loader, React.ComponentType<any>>();

export function loadDynamicComponent(loader: Loader, mode: 'client' | 'suspense') {
  if (dynamicComponentCache.has(loader)) {
    return dynamicComponentCache.get(loader)!;
  }

  const Comp = dynamic(loader, { ssr: mode === 'suspense' });

  dynamicComponentCache.set(loader, Comp);
  return Comp;
}
