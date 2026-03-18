import { compilePath } from './compilePath';
import { routeRules } from './routeRules';

const compiled = routeRules.map((r) => ({
  pattern: compilePath(r.path),
  meta: r.meta,
}));

export function matchRouteMeta(pathname: string) {
  for (const r of compiled) {
    if (r.pattern.test(pathname)) return r.meta;
  }
  return { mobileLevel: 1, desktopLevel: 1 };
}
