// src/next.config.ts
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

import { withSentryConfig } from '@sentry/nextjs';
import { codeInspectorPlugin } from 'code-inspector-plugin';
import path from 'node:path';

import { getAppVersion } from './scripts/shared/app-version';
import brandConfig from './src/configs/brands';
import { ModalRoutes } from './src/router/routes';

const defaultLocale = brandConfig.defaultLocale;
const modalRewrites = (Object.values(ModalRoutes) as string[]).map((path) => ({
  source: path,
  destination: `/${defaultLocale}`,
}));

const enableSentry = ['stage', 'prod'].includes(process.env.NEXT_PUBLIC_ENV);
const appVersion = getAppVersion();
const removeClientConsoleLoader = path.resolve(
  process.cwd(),
  'scripts/loaders/remove-client-console-loader.cjs',
);
const codeInspectorRules =
  process.env.NODE_ENV === 'development'
    ? codeInspectorPlugin({
        bundler: 'turbopack',
        showSwitch: true,
      })
    : {};

const baseConfig: NextConfig = {
  // 屏幕指示器
  devIndicators: { position: 'bottom-right' },
  // 禁用响应头 X-Powered-By: Next.js
  poweredByHeader: false,
  // 保持开发环境快速运行
  // React Compiler 会改变 sourcemap 中的 sourcesContent，Sentry 里会看到编译后的缓存代码。
  reactCompiler: false,
  // 启用严格模式
  reactStrictMode: false,
  // 生成 build id
  generateBuildId: () => appVersion,
  // 在路由匹配前把 /modal-xxx 等重写到 /{defaultLocale}，避免被 [locale] 误匹配成 locale
  rewrites: async () => ({
    beforeFiles: modalRewrites,
  }),
  allowedDevOrigins: ['192.168.0.53'],
  // 启用 sourcemap
  productionBrowserSourceMaps: enableSentry,
  // 环境变量
  env: {
    NEXT_PUBLIC_APP_VERSION: appVersion,
  },
  experimental: {
    // https://github.com/RevoTale/next-scroll-restorer
    scrollRestoration: true,
  },
  turbopack: {
    rules: {
      // 提升开发效率的工具，点击页面上的 DOM，它能够自动打开你的 IDE 并将光标定位到 DOM 对应的源代码位置
      ...codeInspectorRules,
      // 客户端生产包移除调试 console，服务端日志不处理。
      // production: next build；browser: 浏览器端 bundle；foreign: node_modules / Next 内部模块。
      '*.{js,jsx,ts,tsx,mjs,cjs}': {
        condition: { all: ['production', 'browser', { not: 'foreign' }] },
        loaders: [removeClientConsoleLoader],
      },
    },
  },
};

// Initialize the Next-Intl plugin
let configWithPlugins = createNextIntlPlugin()(baseConfig);

if (enableSentry) {
  // Conditionally enable Sentry configuration
  configWithPlugins = withSentryConfig(configWithPlugins, {
    // For all available options, see:
    // https://www.npmjs.com/package/@sentry/webpack-plugin#options
    org: '8u8',
    project: 'javascript-nextjs',

    release: { name: appVersion },

    // Only print logs for uploading source maps in CI
    silent: !process.env.CI,

    // For all available options, see:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

    // Upload a larger set of source maps for prettier stack traces (increases build time)
    widenClientFileUpload: true,

    // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
    // This can increase your server load as well as your hosting bill.
    // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
    // side errors will fail.
    tunnelRoute: '/monitoring',

    sourcemaps: {
      // 由 scripts/sentry/upload-sourcemaps.ts 统一使用 sentry-cli 上传并删除 .map，避免重复上传。
      disable: true,
    },
  });
}

const nextConfig = configWithPlugins;
export default nextConfig;
