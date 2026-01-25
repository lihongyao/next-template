// src/configs/brands/bfun.ts
import type { BrandConfig } from './types';

export default {
  appName: 'B-Fun',
  theme: 'modern',
  layout: 'top-nav',
  skin: 'green',
  overrides: false,
  locales: [
    { code: 'zh-CN', label: '🇨🇳 简体中文', value: 1 },
    { code: 'en-US', label: '🇺🇸 English', value: 2 },
    { code: 'pt', label: '🇧🇷 Português', value: 3 },
    { code: 'es', label: '🇪🇸 Español', value: 4 },
  ],
  defaultLocale: 'en',
} satisfies BrandConfig;
