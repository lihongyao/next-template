// src/configs/brands/afun.ts
import type { BrandConfig } from './types';

export default {
  appName: 'A-FUN',
  theme: 'modern',
  skin: 'green',
  appId: 'afun',
  layout: 'side-nav',
  locales: [
    { code: 'zh-CN', label: '🇨🇳 简体中文', value: 1 },
    { code: 'en-US', label: '🇺🇸 English', value: 2 },
    { code: 'pt', label: '🇧🇷 Português', value: 3 },
    { code: 'es', label: '🇪🇸 Español', value: 4 },
  ],
  defaultLocale: 'zh-CN',
} satisfies BrandConfig;
