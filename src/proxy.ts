// src/proxy.ts
import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';

import { routing } from './i18n/routing';
import {
  getRouteModalBasePathname,
  hasLocalePrefix,
  shouldRewriteRouteModalRequest,
} from './libs/modal-page-routes-utils';

const intlMiddleware = createMiddleware(routing);

// 客户端会把当前设备写进 cookie，middleware 优先相信这份显式选择。
const deviceCookieName = 'app-device';

// 先处理 route modal 的底页重写，再交给 next-intl 做 locale 补齐。
// 这样直达 /login、/news-details 这类地址时，浏览器仍看到 modal URL，
// 但服务端先返回对应的 base page，客户端再叠加 modal。
export function proxy(request: NextRequest) {
  const rewriteTarget = modalRewriteResponse(request);
  if (rewriteTarget) return rewriteTarget;
  return intlMiddleware(request);
}

function modalRewriteResponse(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const isMobile = isMobileRequest(request);
  // 只有当前设备会把这个 pathname 解释成 route modal 时，才把请求重写到底页。
  if (!shouldRewriteRouteModalRequest(pathname, isMobile)) return null;

  const basePathname = getRouteModalBasePathname(pathname, isMobile);
  if (!basePathname) return null;

  const rewriteUrl = request.nextUrl.clone();
  // basePathname 只负责切换到底页，query / hash 保持不变，方便 modal 参数继续生效。
  rewriteUrl.pathname = basePathname.replace(/\/{2,}/g, '/');

  const nextParams = new URLSearchParams(searchParams.toString());
  rewriteUrl.search = nextParams.toString() ? `?${nextParams.toString()}` : '';
  // 已经带 locale 的地址直接 rewrite；没有 locale 前缀时，交给 next-intl 再补一层 locale。
  if (hasLocalePrefix(rewriteUrl.pathname)) {
    return NextResponse.rewrite(rewriteUrl);
  }

  const localizedRequest = new NextRequest(rewriteUrl, {
    headers: request.headers,
    method: request.method,
  });
  return intlMiddleware(localizedRequest);
}

function isMobileRequest(request: NextRequest): boolean {
  // 设备判断优先级：cookie > Client Hints > User-Agent。
  // cookie 代表客户端已经明确记录过当前设备，优先级最高。
  const deviceCookie = request.cookies.get(deviceCookieName)?.value;
  if (deviceCookie === 'mobile') return true;
  if (deviceCookie === 'tablet' || deviceCookie === 'desktop') return false;

  const mobileHint = request.headers.get('sec-ch-ua-mobile');
  if (mobileHint === '?1') return true;
  if (mobileHint === '?0') return false;

  const ua = request.headers.get('user-agent') ?? '';
  return /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
}

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/trpc`, `/_next` or `/_vercel`
  // - … Sentry tunnel `/monitoring`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: '/((?!api|trpc|_next|_vercel|monitoring|.*\\..*).*)',
};
