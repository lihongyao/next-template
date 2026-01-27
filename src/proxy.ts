// src/proxy.ts
import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';

import { routing } from './i18n/routing';
import { type ModalRoute, ModalRoutes } from './libs/routes';

const intlMiddleware = createMiddleware(routing);
const modalRouteValues = new Set(Object.values(ModalRoutes));

/**
 * 中间件代理函数
 *
 * 功能：
 * 1. 处理国际化路由（通过 next-intl）
 * 2. 检测 modal 路由（如 /modal-profile），将 modal 部分从 rewrite 路径中移除
 *    这样底层页面不包含 modal，但浏览器 URL 保持不变，供 RouteModalRenderer 检测
 *
 * 示例：
 * - /modal-profile → rewrite 到 /pt（首页），URL 保持 /modal-profile
 * - /news/modal-profile → rewrite 到 /pt/news，URL 保持 /news/modal-profile
 * - /en/news/modal-profile → rewrite 到 /en/news，URL 保持 /en/news/modal-profile
 */
export default function proxy(request: NextRequest) {
  // 1. 先让 next-intl 处理国际化路由（语言前缀、重定向等）
  const intlResponse = intlMiddleware(request);

  // 2. 如果是重定向，直接返回（不处理 modal）
  if (intlResponse.status >= 300 && intlResponse.status < 400) {
    return intlResponse;
  }

  // 3. 获取实际处理的路径（可能是 rewrite 后的路径）
  const originalPathname = request.nextUrl.pathname;
  const rewriteHeader = intlResponse.headers.get('x-middleware-rewrite');
  const actualPathname = rewriteHeader
    ? new URL(rewriteHeader, request.url).pathname
    : originalPathname;

  // 4. 检查路径中是否包含 modal 路由
  const modalRouteKey = findModalRoute(actualPathname);

  // 5. 如果不包含 modal，直接返回（只添加 X-Path 头）
  if (!modalRouteKey) {
    return addXPathHeader(intlResponse, originalPathname, rewriteHeader, request.url);
  }

  // 6. 包含 modal：移除 modal 部分，创建新的 rewrite URL
  const basePath = removeModalFromPath(actualPathname, modalRouteKey);
  const basePathWithLocale = ensureLocalePrefix(basePath, rewriteHeader, request.url);

  // 7. 创建新的 rewrite URL（不包含 modal）
  const rewriteUrl = new URL(basePathWithLocale, request.url);
  rewriteUrl.search = request.nextUrl.search; // 保留查询参数

  // 8. 创建新的响应，使用新的 rewrite URL
  const response = NextResponse.rewrite(rewriteUrl);

  // 9. 复制所有原始头部（除了 rewrite）
  intlResponse.headers.forEach((value, key) => {
    if (key.toLowerCase() !== 'x-middleware-rewrite') {
      response.headers.set(key, value);
    }
  });

  // 10. 设置 X-Path 头（使用原始路径，供前端使用）
  response.headers.set('X-Path', originalPathname);

  return response;
}

/**
 * 在路径中查找 modal 路由
 * 返回找到的 modal 路由键（如 '/modal-profile'），如果没有则返回 null
 */
function findModalRoute(pathname: string): ModalRoute | null {
  const segments = pathname.split('/').filter(Boolean);
  for (const segment of segments) {
    const route = `/${segment}` as ModalRoute;
    if (modalRouteValues.has(route)) {
      return route;
    }
  }
  return null;
}

/**
 * 从路径中移除 modal 部分
 * 例如：/pt/news/modal-profile → /pt/news
 */
function removeModalFromPath(pathname: string, modalRoute: ModalRoute): string {
  const segments = pathname.split('/').filter(Boolean);
  const modalSegment = modalRoute.slice(1); // 移除前导斜杠

  // 找到 modal 段的索引并移除
  const modalIndex = segments.indexOf(modalSegment);
  if (modalIndex === -1) {
    return pathname; // 不应该发生，但安全起见
  }

  // 移除 modal 及其之后的所有段（如果有多个 modal，只保留第一个之前的部分）
  const baseSegments = segments.slice(0, modalIndex);
  return baseSegments.length > 0 ? `/${baseSegments.join('/')}` : '/';
}

/**
 * 确保路径包含语言前缀
 * 如果路径已经包含语言前缀，直接返回
 * 如果没有，添加默认语言前缀
 */
function ensureLocalePrefix(
  pathname: string,
  originalRewriteHeader: string | null,
  baseUrl: string,
): string {
  const segments = pathname.split('/').filter(Boolean);

  // 如果路径为空或只有根路径，返回默认语言的首页路径
  if (segments.length === 0) {
    return `/${routing.defaultLocale}`;
  }

  // 检查第一个段是否是支持的语言
  const firstSegment = segments[0];
  if (routing.locales.includes(firstSegment)) {
    // 已经包含语言前缀
    return pathname;
  }

  // 不包含语言前缀，添加默认语言
  // 如果 originalRewriteHeader 存在，从中提取语言前缀（更准确）
  if (originalRewriteHeader) {
    const originalPath = new URL(originalRewriteHeader, baseUrl).pathname;
    const originalSegments = originalPath.split('/').filter(Boolean);
    if (originalSegments.length > 0 && routing.locales.includes(originalSegments[0])) {
      // 使用原始 rewrite 中的语言前缀
      return `/${originalSegments[0]}${pathname === '/' ? '' : pathname}`;
    }
  }

  // 使用默认语言
  return `/${routing.defaultLocale}${pathname === '/' ? '' : pathname}`;
}

/**
 * 添加 X-Path 头到响应
 * 如果响应不需要修改，直接返回；否则创建新响应
 */
function addXPathHeader(
  intlResponse: NextResponse,
  pathname: string,
  rewriteHeader: string | null,
  baseUrl: string,
): NextResponse {
  // 如果 X-Path 头已经存在且正确，直接返回
  if (intlResponse.headers.get('X-Path') === pathname) {
    return intlResponse;
  }

  // 需要添加或更新 X-Path 头，创建新响应
  const response = rewriteHeader
    ? NextResponse.rewrite(new URL(rewriteHeader, baseUrl))
    : NextResponse.next();

  // 复制所有原始头部
  intlResponse.headers.forEach((value, key) => {
    if (key.toLowerCase() !== 'x-path') {
      response.headers.set(key, value);
    }
  });

  // 设置 X-Path 头
  response.headers.set('X-Path', pathname);
  return response;
}

export const config = {
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)',
};
