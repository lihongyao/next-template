import { compilePath } from './compilePath';
import { routeRules } from './routeRules';
import { ModalRoutes } from './routes';

// 启动时把规则编译成正则，运行期只做 test，避免重复构造 RegExp。
const compiled = routeRules.map((r) => ({
  pattern: compilePath(r.path),
  path: r.path,
  meta: r.meta,
}));

const modalSegments = Object.values(ModalRoutes).map((p) => p.replace(/^\//, ''));

// `/base/profile` 这类 route modal 地址在做页面等级匹配时应先折叠到底页 `/base`。
function normalizePathForModal(pathname: string) {
  const parts = pathname.split('/').filter(Boolean);
  const firstModalIndex = parts.findIndex((seg) => modalSegments.includes(seg));
  if (firstModalIndex === -1) return pathname;
  const base = parts.slice(0, firstModalIndex);
  return base.length > 0 ? `/${base.join('/')}` : '/';
}

// 未命中配置时默认按一级页处理，避免动画和可用性逻辑出现空值分支。
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

// 某个路由在当前设备不可用时，返回约定的兜底页面。
export function getDeviceRouteFallback(pathname: string, isMobile: boolean): string | null {
  const rule = matchRouteRule(pathname);
  const availability = rule?.meta.availability;
  if (!availability) return null;

  const isAvailable = isMobile ? availability.mobile !== false : availability.desktop !== false;
  return isAvailable ? null : (availability.fallback ?? '/');
}
