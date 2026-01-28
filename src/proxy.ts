// src/proxy.ts
import createMiddleware from 'next-intl/middleware';
import type { NextRequest } from 'next/server';

import { routing } from './i18n/routing';
import { ModalRoutes } from './libs/routes';

const intlMiddleware = createMiddleware(routing);

// Modal 路由值集合，用于快速匹配
const modalRouteValues = new Set(Object.values(ModalRoutes));

/**
 * 检测并匹配 modal 路由
 * @param pathname 路径名
 * @returns 匹配到的 modal 路由，如果没有则返回 null
 */
function matchModalRoute(pathname: string): string | null {
  // 分割路径段，查找匹配的 modal 路由
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) return null;

  // 遍历路径段，找到是否有段匹配 ModalRoutes 的值
  for (let i = 0; i < segments.length; i++) {
    const seg = `/${segments[i]}`;
    if (modalRouteValues.has(seg as (typeof ModalRoutes)[keyof typeof ModalRoutes])) {
      return seg;
    }
  }

  return null;
}

/**
 * 重写 modal 路由 URL
 * 将 modal 路由重写为基础路径（去掉 modal 部分）
 * @param request 请求对象
 * @returns 重写后的 URL，如果不是 modal 路由则返回 null
 */
function modalRewriteUrl(request: NextRequest): URL | null {
  const { pathname, searchParams } = request.nextUrl;

  // 检测是否是 modal 路由
  const modalRouteKey = matchModalRoute(pathname);
  if (!modalRouteKey) {
    return null;
  }

  // 分割路径段
  const pathnames = pathname.split('/').filter(Boolean);

  // 找到 modal 路由在路径中的位置
  const modalIndex = pathnames.findIndex((segment) => `/${segment}` === modalRouteKey);
  if (modalIndex === -1) {
    return null;
  }

  // 提取基础路径（modal 之前的所有路径段）
  const basePaths = pathnames.slice(0, modalIndex);

  // 检查路径是否包含语言前缀
  const hasLocalePrefix = basePaths.length > 0 && routing.locales.includes(basePaths[0]);

  // 如果没有语言前缀，添加默认语言
  if (!hasLocalePrefix) {
    basePaths.unshift(routing.defaultLocale);
  }

  // 构建基础路径
  const basePath = `/${basePaths.join('/')}`;

  // 克隆请求的 URL 对象，在其基础上修改
  const rewriteUrl = request.nextUrl.clone();

  // 设置基础路径，确保没有多余的斜杠
  rewriteUrl.pathname = basePath.replace(/\/{2,}/g, '/');

  // 保留查询参数
  const nextParams = new URLSearchParams(searchParams.toString());
  rewriteUrl.search = nextParams.toString() ? `?${nextParams.toString()}` : '';

  // 返回新的 URL（Next.js 会用它来执行 rewrite）
  return rewriteUrl;
}

/**
 * Next.js 16 的 proxy 函数（替代 middleware）
 * 处理国际化路由和 modal 路由重写
 */
export default function proxy(request: NextRequest) {
  // 调用国际化中间件，处理多语言路径的逻辑
  const intlResponse = intlMiddleware(request);

  // 检测并处理 modal 路由重写
  const rewriteTarget = modalRewriteUrl(request);
  if (rewriteTarget) {
    // 使用 x-middleware-rewrite 告诉 Next.js 进行 URL 重写
    intlResponse.headers.set('x-middleware-rewrite', rewriteTarget.toString());
  }

  // 设置 X-Path 头（可选，用于调试）
  const { pathname } = request.nextUrl;
  intlResponse.headers.set('X-Path', pathname);

  return intlResponse;
}

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/trpc`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)',
};
