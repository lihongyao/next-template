// src/next.config.ts
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

import { withSentryConfig } from '@sentry/nextjs';
import { codeInspectorPlugin } from 'code-inspector-plugin';
import { execSync } from 'node:child_process';
import path from 'node:path';

import brandConfig from './src/configs/brands';
import { ModalRoutes } from './src/router/routes';

const defaultLocale = brandConfig.defaultLocale;
const modalRewrites = (Object.values(ModalRoutes) as string[]).map((path) => ({
  source: path,
  destination: `/${defaultLocale}`,
}));

const appVersion = getAppVersion();
const removeClientConsoleLoader = path.resolve(
  process.cwd(),
  'scripts/loaders/remove-client-console-loader.cjs',
);

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
  turbopack: {
    // 提升开发效率的工具，点击页面上的 DOM，它能够自动打开你的 IDE 并将光标定位到 DOM 对应的源代码位置
    rules: {
      ...codeInspectorPlugin({
        bundler: 'turbopack',
        showSwitch: true,
      }),
      '*.{js,jsx,ts,tsx,mjs,cjs}': {
        // 不使用 compiler.removeConsole，避免影响服务端构建产物里的日志。
        condition: { all: ['browser', 'production', { not: { path: /[\\/]node_modules[\\/]/ } }] },
        loaders: [removeClientConsoleLoader],
      },
    },
  },
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.module.rules.push({
        test: /\.[cm]?[jt]sx?$/,
        exclude: /node_modules/,
        use: removeClientConsoleLoader,
      });
    }

    return config;
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
  sourcemaps: {
    disable: false,
    deleteSourcemapsAfterUpload: true,
  },
  webpack: {
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
