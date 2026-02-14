import { defineRouting } from 'next-intl/routing';

import brandConfig from '@/configs/brands';

const locales = brandConfig.locales.map((locale) => locale.code);
const defaultLocale = brandConfig.defaultLocale;

export const routing = defineRouting({
  // 支持的语言（如果要依赖于后端接口，或动态获取，需要在中间件中处理）
  locales,
  // 默认语言
  defaultLocale,
  // 语言前缀
  localePrefix: 'as-needed',
  // 禁用自动语言检测，当没有语言前缀时始终使用默认语言
  localeDetection: false,
});
