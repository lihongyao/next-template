// src/libs/brand.server.ts
import { cache } from 'react';

import { cookies } from 'next/headers';

import brandConfig from '@/configs/brands';
import type { BrandConfig, Layout, Skin, Theme } from '@/configs/brands/types';

/**
 * 获取服务端当前请求生效的品牌配置。
 *
 * 该方法会在基础包网配置之上读取 cookie 中的运行时覆盖项，
 * 用于保证服务端渲染拿到的 theme / skin / layout 与当前请求一致。
 *
 * 优先级：cookie > 包网配置文件。
 *
 * 使用 React cache 后，同一次服务端渲染中多次调用会复用结果，
 * 避免重复读取 cookies 和重复合并配置。
 */
export const getServerBrandConfig = cache(async (): Promise<BrandConfig> => {
  console.log('__getServerBrandConfig__');
  const cookieStore = await cookies();
  const theme = (cookieStore.get('theme')?.value as Theme) || brandConfig.theme;
  const skin = (cookieStore.get('skin')?.value as Skin) || brandConfig.skin;
  const layout = (cookieStore.get('layout')?.value as Layout) || brandConfig.layout;

  return { ...brandConfig, theme, skin, layout };
});
