import { compilePath } from './compilePath';
import { routeRules } from './routeRules';
import { ModalRoutes } from './routes';

const compiled = routeRules.map((r) => ({
  pattern: compilePath(r.path),
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
  for (const r of compiled) {
    if (r.pattern.test(pathname)) return r.meta;
  }
  const normalized = normalizePathForModal(pathname);
  if (normalized !== pathname) {
    for (const r of compiled) {
      if (r.pattern.test(normalized)) return r.meta;
    }
  }
  return { mobileLevel: 1, desktopLevel: 1 };
}
