import { hasLocale } from 'next-intl';
import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';

import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

export default async function proxy(request: NextRequest) {
  // 处理国际化路由
  const intlResponse = intlMiddleware(request);

  // 判断 rewrite 的 locale 是否支持
  const { pathname } = request.nextUrl;
  const pathLocale = pathname.split('/')[1];
  const isSupportedLocale = hasLocale(routing.locales, pathLocale);

  // 如果路径中有语言代码，但不支持该语言，则重定向到首页
  if (pathLocale && !isSupportedLocale) {
    return NextResponse.redirect(new URL(`/`, request.url));
  }

  return intlResponse;
}
export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/trpc`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)',
};
