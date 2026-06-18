import { compilePath } from './compilePath';
import { routeRules } from './routeRules';
import { ModalRoutes } from './routes';

const compiled = routeRules.map((r) => ({
  pattern: compilePath(r.path),
  path: r.path,
  meta: r.meta,
}));

const modalSegments = Object.values(ModalRoutes).map((p) => p.replace(/^\//, ''));

function normalizePathForModal(pathname: string) {
  const parts = pathname.split('/').filter(Boolean);
  const firstModalIndex = parts.findIndex((seg) => modalSegments.includes(seg));
  if (firstModalIndex === -1) return pathname;
  const base = parts.slice(0, firstModalIndex);
  return base.length > 0 ? `/${base.join('/')}` : '/';
}

export function matchRouteMeta(pathname: string) {
  return matchRouteRule(pathname)?.meta ?? { mobileLevel: 1, desktopLevel: 1 };
}

export function matchRouteRule(pathname: string) {
  for (const r of compiled) {
    if (r.pattern.test(pathname)) return r;
  }
  const normalized = normalizePathForModal(pathname);
  if (normalized !== pathname) {
    for (const r of compiled) {
      if (r.pattern.test(normalized)) return r;
    }
  }
  return null;
}

export function getDeviceRouteFallback(pathname: string, isMobile: boolean): string | null {
  const rule = matchRouteRule(pathname);
  const availability = rule?.meta.availability;
  if (!availability) return null;

  const isAvailable = isMobile ? availability.mobile !== false : availability.desktop !== false;
  return isAvailable ? null : (availability.fallback ?? '/');
}
