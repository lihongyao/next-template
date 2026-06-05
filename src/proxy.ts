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

const deviceCookieName = 'app-device';

// 处理国际化路由和 modal 路由重写
export function proxy(request: NextRequest) {
  const rewriteTarget = modalRewriteResponse(request);
  if (rewriteTarget) return rewriteTarget;
  return intlMiddleware(request);
}

function modalRewriteResponse(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const isMobile = isMobileRequest(request);
  if (!shouldRewriteRouteModalRequest(pathname, isMobile)) return null;

  const basePathname = getRouteModalBasePathname(pathname, isMobile);
  if (!basePathname) return null;

  const rewriteUrl = request.nextUrl.clone();
  rewriteUrl.pathname = basePathname.replace(/\/{2,}/g, '/');

  const nextParams = new URLSearchParams(searchParams.toString());
  rewriteUrl.search = nextParams.toString() ? `?${nextParams.toString()}` : '';
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
