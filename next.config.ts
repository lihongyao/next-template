// src/next.config.ts
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

import { execSync } from 'node:child_process';

import brandConfig from './src/configs/brands';
import { ModalRoutes } from './src/router/routes';

const defaultLocale = brandConfig.defaultLocale;
const modalRewrites = (Object.values(ModalRoutes) as string[]).map((path) => ({
  source: path,
  destination: `/${defaultLocale}`,
}));

function getAppVersion() {
  const app = process.env.app ?? 'x';
  try {
    // 只取当前 commit 上的 tag
    const tags = execSync('git tag --points-at HEAD', { encoding: 'utf8' })
      .split('\n')
      .map((t) => t.trim())
      .filter(Boolean);
    // 只匹配当前应用
    const match = tags.find((tag) => tag.startsWith(`release/${app}_`));
    if (!match) {
      throw new Error(`No tag found for ${app}`);
    }
    const hash = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
    return `${match}_${hash}`;
  } catch {
    // 没 git 时 fallback
    return Date.now().toString();
  }
}

const appVersion = getAppVersion();

const nextConfig: NextConfig = {
  generateBuildId() {
    return appVersion;
  },
  /* config options here */
  reactCompiler: true,
  reactStrictMode: false,
  // 在路由匹配前把 /modal-xxx 等重写到 /{defaultLocale}，避免被 [locale] 误匹配成 locale
  rewrites: async () => ({
    beforeFiles: modalRewrites,
  }),
  env: {
    NEXT_PUBLIC_APP_VERSION: appVersion,
  },
  experimental: {
    // https://github.com/RevoTale/next-scroll-restorer
    scrollRestoration: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};
const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
