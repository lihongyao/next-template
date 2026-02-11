// src/libs/brand.ts
import { cookies } from 'next/headers';

import brandConfig from '@/configs/brands';
import type { BrandConfig, Layout, Skin, Theme } from '@/configs/brands/types';

/**
 * SSR 读取品牌配置
 * 优先级：cookie > 配置文件
 */
export async function getBrandConfigSSR(): Promise<BrandConfig> {
  // 1. 读取 cookie
  const cookieStore = await cookies();
  const theme = cookieStore.get('theme')?.value as Theme | undefined;
  const skin = cookieStore.get('skin')?.value as Skin | undefined;
  const layout = cookieStore.get('layout')?.value as Layout | undefined;
  // 2. 返回品牌配置
  return {
    ...brandConfig,
    theme: theme || brandConfig.theme,
    skin: skin || brandConfig.skin,
    layout: layout || brandConfig.layout,
  };
}
