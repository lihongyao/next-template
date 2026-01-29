// src/proxy.ts
import createMiddleware from 'next-intl/middleware';
import type { NextRequest } from 'next/server';

import { routing } from './i18n/routing';
import { ModalRoute, ModalRoutes } from './libs/routes';

const intlMiddleware = createMiddleware(routing);

// Modal 路由值集合，用于快速匹配
const modalRouteValues = new Set(Object.values(ModalRoutes));

const defaultLocale = routing.defaultLocale;
const locales = routing.locales;

/**
 * Next.js 16 的 proxy 函数（替代 middleware）
 * 处理国际化路由和 modal 路由重写
 */
export default function proxy(request: NextRequest) {
  // 调用国际化中间件，处理多语言路径的逻辑
  const intlResponse = intlMiddleware(request);

  // 检测并处理 modal 路由重写
  const rewriteTarget = modalRewriteUrl(request);
  console.log('rewriteTarget >>> ', rewriteTarget);
  if (rewriteTarget) {
    // 使用 x-middleware-rewrite 告诉 Next.js 进行 URL 重写
    intlResponse.headers.set('x-middleware-rewrite', rewriteTarget.toString());
  }

  // 设置 X-Path 头（可选，用于调试）
  const { pathname } = request.nextUrl;
  intlResponse.headers.set('X-Path', pathname);

  return intlResponse;
}

function modalRewriteUrl(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  // modal 路由判断：是否命中 ModalRoutes
  const modalRouteKey = matchModalRoute(pathname);
  if (!modalRouteKey) {
    return null;
  }

  let pathnames = [];
  if (pathname.includes('/modal-activity/')) {
    pathnames = pathname.split('/modal-activity/').filter(Boolean);
  } else {
    pathnames = pathname.split('/').filter(Boolean);
  }
  const modalIndex = pathnames.findIndex((segment) => `/${segment}` == modalRouteKey);
  if (modalIndex === -1) {
    return null;
  }

  const modalPathname = pathnames[modalIndex];
  const basePaths = pathnames.slice(0, modalIndex);

  // 检查路径是否包含语言前缀，则加上默认语言
  const hasLocalePrefix = basePaths.length > 0 && locales.includes(basePaths[0]);
  if (!hasLocalePrefix) {
    basePaths.unshift(defaultLocale);
  }

  const basePath = `/${basePaths.join('/')}`;
  // 克隆请求的URL对象，在其基础上修改
  const rewriteUrl = request.nextUrl.clone();
  // 设置基础路径，确保没有多余的斜杠
  rewriteUrl.pathname = basePath.replace(/\/{2,}/g, '/');

  const nextParams = new URLSearchParams(searchParams.toString());
  // 将查询参数赋值给 URL
  rewriteUrl.search = nextParams.toString() ? `?${nextParams.toString()}` : '';
  // 返回新的 URL（Next.js 会用它来执行 rewrite）
  return rewriteUrl;
}

function matchModalRoute(pathname: string) {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length == 0) return null;
  // 遍历路径段，找到是否有段匹配 ModalRoutes 的值（忽略前导斜杠差异）
  for (let i = 0; i < segments.length; i++) {
    const seg = `/${segments[i]}`;
    if (modalRouteValues.has(seg as ModalRoute)) {
      return seg;
    }
  }
  return null;
}

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/trpc`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)',
};
