// src/next.config.ts
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

import { withSentryConfig } from '@sentry/nextjs';
import { execSync } from 'node:child_process';

import brandConfig from './src/configs/brands';
import { ModalRoutes } from './src/router/routes';

const defaultLocale = brandConfig.defaultLocale;
const modalRewrites = (Object.values(ModalRoutes) as string[]).map((path) => ({
  source: path,
  destination: `/${defaultLocale}`,
}));

const appVersion = getAppVersion();

const nextConfig: NextConfig = {
  // 生成 build id
  generateBuildId: () => appVersion,
  /* config options here */
  reactCompiler: true,
  reactStrictMode: false,
  // 在路由匹配前把 /modal-xxx 等重写到 /{defaultLocale}，避免被 [locale] 误匹配成 locale
  rewrites: async () => ({
    beforeFiles: modalRewrites,
  }),
  // 环境变量
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
export default withSentryConfig(withNextIntl(nextConfig), {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: '8u8',

  project: 'javascript-nextjs',

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Uncomment to route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  // tunnelRoute: "/monitoring",

  webpack: {
    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,

    // Tree-shaking options for reducing bundle size
    treeshake: {
      // Automatically tree-shake Sentry logger statements to reduce bundle size
      removeDebugLogging: true,
    },
  },
});

function getAppVersion() {
  const app = process.env.app;
  if (!app) {
    throw new Error('app is not set');
  }
  try {
    // 获取当前 commit 上的 tags
    const tags = execSync('git tag --points-at HEAD', { encoding: 'utf8' })
      .split('\n')
      .map((t) => t.trim())
      .filter(Boolean);
    // 获取当前应用的版本号，格式为：release/${app}_${timestamp}，如 release/afun_20260405_1500
    const match = tags.find((tag) => tag.startsWith(`release/${app}_`));
    if (!match) {
      throw new Error(`No tag found for ${app}`);
    }
    // 获取当前 commit 的 hash
    const hash = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
    // 返回版本号，格式为：release/${app}_${timestamp}_${hash}，如 release/afun_20260405_1500_12345678
    return `${match}_${hash}`;
  } catch {
    // 无 git 时 fallback，格式为：${timestamp}，如 v_afun_20260405_1500
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const timestamp = `${year}${month}${day}_${hours}${minutes}${seconds}`;
    return `v_${app}_${timestamp}`;
  }
}
