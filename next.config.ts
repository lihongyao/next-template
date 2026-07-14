// src/next.config.ts
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

import { withSentryConfig } from '@sentry/nextjs';
import { codeInspectorPlugin } from 'code-inspector-plugin';

// import path from 'node:path';

import { getAppVersion } from './scripts/shared/app-version';
import brandConfig from './src/configs/brands';
import { ModalRoutes } from './src/router/routes';

const defaultLocale = brandConfig.defaultLocale;
const modalRewrites = (Object.values(ModalRoutes) as string[]).map((path) => ({
  source: path,
  destination: `/${defaultLocale}`,
}));

const isDev = process.env.NODE_ENV === 'development';
const enableSentry = ['prod'].includes(process.env.NEXT_PUBLIC_ENV);
const appVersion = getAppVersion();

// const removeClientConsoleLoader = path.resolve(
//   process.cwd(),
//   'scripts/loaders/remove-client-console-loader.cjs',
// );

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
  headers: async () => [
    {
      // sprite 文件名带 hash，可安全走长期强缓存；hash 变化时 URL 会一起变化。
      source: '/sprite-critical.:hash.svg',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
      ],
    },
    {
      // 普通 sprite 走外链渲染，同样适合长期强缓存。
      source: '/sprite-normal.:hash.svg',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
      ],
    },
  ],
  allowedDevOrigins: ['192.168.0.53'],
  // 仅在启用 Sentry 时生成浏览器 sourcemap，供构建阶段上传后还原客户端堆栈。
  productionBrowserSourceMaps: enableSentry,
  // 环境变量
  env: {
    NEXT_PUBLIC_APP_VERSION: appVersion,
  },
  experimental: {
    // https://github.com/RevoTale/next-scroll-restorer
    scrollRestoration: true,
  },
  compiler: {
    // removeConsole: isDev ? false : { exclude: ['error', 'warn'] },
  },
  turbopack: {
    rules: {
      // 提升开发效率的工具，点击页面上的 DOM，它能够自动打开你的 IDE 并将光标定位到 DOM 对应的源代码位置
      ...codeInspectorRules,

      // 客户端生产包移除调试 console，服务端日志不处理。
      // production: next build；browser: 浏览器端 bundle；foreign: node_modules / Next 内部模块。
      // '*.{js,jsx,ts,tsx,mjs,cjs}': {
      //   condition: { all: ['production', 'browser', { not: 'foreign' }] },
      //   loaders: [removeClientConsoleLoader],
      // },
    },
  },
};

// Initialize the Next-Intl plugin
let configWithPlugins = createNextIntlPlugin()(baseConfig);

if (enableSentry) {
  // 仅在 prod 环境启用 Sentry 构建插件，用于上传 sourcemap 并关联 release。
  configWithPlugins = withSentryConfig(configWithPlugins, {
    // Sentry 组织 slug
    org: '8u8',
    // Sentry 项目 slug
    project: 'javascript-nextjs',
    // 上传 sourcemap 和 release 信息使用的认证 token
    authToken: '',
    // Sentry 实例基础地址，官方默认 https://sentry.io/
    sentryUrl: 'https://sentry.io/',
    // release 配置用于把运行时事件、构建产物和上传的 sourcemap 关联到同一版本。
    release: {
      // release 唯一标识，这里使用应用版本号，和 generateBuildId 保持一致。
      name: appVersion,
    },

    // 是否隐藏所有 Sentry 构建日志；false 会保留上传和错误日志，便于生产构建排查。
    silent: false,
    // 是否输出更详细的构建调试信息；false 避免常规构建产生过多 debug 日志。
    debug: false,

    // 上传 Next.js 内部代码和依赖的客户端 sourcemap，让依赖和框架栈帧更可读，但会增加构建时间。
    widenClientFileUpload: true,

    // 浏览器事件先请求本站 /monitoring，再由 Next.js rewrite 转发到 Sentry，降低被广告拦截器拦截的概率。
    tunnelRoute: '/monitoring',

    // sourcemap 上传相关配置；withSentryConfig 会在构建时按这些选项处理上传和清理。
    sourcemaps: {
      // 上传成功后删除 Next.js 构建目录中的客户端 .map 文件；服务端 sourcemap 会保留给运行时报错使用。
      deleteSourcemapsAfterUpload: true,
    },
  });
}

const nextConfig = configWithPlugins;
export default nextConfig;
