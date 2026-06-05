import { routing } from '@/i18n/routing';
import {
  type ModalPageRouteConfig,
  type ModalPageRouteKey,
  ModalPageRoutes,
  ModalRoutes,
} from '@/router/routes';

type ParsedPathname = {
  locale: string | null;
  localSegments: string[];
};

type SegmentMatch = ParsedPathname & {
  index: number;
  tailSegments: string[];
  prefixSegments: string[];
};

const modalRouteValues = new Set<string>(Object.values(ModalRoutes));
const modalPageRouteConfigs = ModalPageRoutes as Record<ModalPageRouteKey, ModalPageRouteConfig>;

function withoutSearch(pathname: string): string {
  return pathname.split(/[?#]/)[0] || '/';
}

function normalizePathname(pathname: string): string {
  const normalized = withoutSearch(pathname).replace(/\/{2,}/g, '/');
  if (!normalized || normalized === '/') return '/';
  return normalized.startsWith('/') ? normalized.replace(/\/$/, '') || '/' : `/${normalized}`;
}

function routeSegments(route: string): string[] {
  return normalizePathname(route).split('/').filter(Boolean);
}

function parsePathname(pathname: string): ParsedPathname {
  const segments = normalizePathname(pathname).split('/').filter(Boolean);
  const first = segments[0];
  const hasLocale = first ? (routing.locales as readonly string[]).includes(first) : false;
  return {
    locale: hasLocale ? first : null,
    localSegments: hasLocale ? segments.slice(1) : segments,
  };
}

function buildPathname(locale: string | null, localSegments: string[]): string {
  const segments = locale ? [locale, ...localSegments] : localSegments;
  return segments.length ? `/${segments.join('/')}` : '/';
}

function hasParamTail(tailSegments: string[]): boolean {
  return tailSegments.length > 0;
}

function isRouteMatchAllowed(config: ModalPageRouteConfig, tailSegments: string[]): boolean {
  return !config.onlySwitchWhenParamPresent || hasParamTail(tailSegments);
}

function findRouteMatch(
  pathname: string,
  route: string,
  mode: 'root' | 'any' = 'root',
): SegmentMatch | null {
  const parsed = parsePathname(pathname);
  const targetSegments = routeSegments(route);
  const maxStart = parsed.localSegments.length - targetSegments.length;
  if (targetSegments.length === 0 || maxStart < 0) return null;

  const start = mode === 'root' ? 0 : 0;
  const end = mode === 'root' ? 0 : maxStart;

  for (let index = start; index <= end; index++) {
    const matched = targetSegments.every(
      (segment, offset) => parsed.localSegments[index + offset] === segment,
    );
    if (!matched) continue;

    return {
      ...parsed,
      index,
      prefixSegments: parsed.localSegments.slice(0, index),
      tailSegments: parsed.localSegments.slice(index + targetSegments.length),
    };
  }

  return null;
}

function sourceRoutesForConfig(key: ModalPageRouteKey): string[] {
  const config = modalPageRouteConfigs[key];
  const routes = [config.canonical, config.pc, config.h5];
  if (config.parentKey) {
    const parentConfig = modalPageRouteConfigs[config.parentKey];
    routes.push(joinRoutes(parentConfig.h5, config.h5));
    routes.push(joinRoutes(parentConfig.pc, config.pc));
  }
  return [...new Set(routes)];
}

function joinRoutes(parent: string, child: string): string {
  return `${normalizePathname(parent).replace(/\/$/, '')}${normalizePathname(child)}`;
}

function getDeviceRoute(config: ModalPageRouteConfig, isMobile: boolean): string {
  return isMobile ? config.h5 : config.pc;
}

function getDeviceRouteIsModal(config: ModalPageRouteConfig, isMobile: boolean): boolean {
  return isModalRouteValue(getDeviceRoute(config, isMobile));
}

function firstExplicitModalMatch(pathname: string): SegmentMatch | null {
  const parsed = parsePathname(pathname);
  for (let index = 0; index < parsed.localSegments.length; index++) {
    const segment = parsed.localSegments[index];
    if (!modalRouteValues.has(`/${segment}`)) continue;
    return {
      ...parsed,
      index,
      prefixSegments: parsed.localSegments.slice(0, index),
      tailSegments: parsed.localSegments.slice(index + 1),
    };
  }
  return null;
}

function collapseMergedModalPath(pathname: string): string | null {
  const match = firstExplicitModalMatch(pathname);
  if (!match || match.index === 0) return null;
  return buildPathname(match.locale, [match.localSegments[match.index], ...match.tailSegments]);
}

function canonicalPathnameForConfig(config: ModalPageRouteConfig, match: SegmentMatch): string {
  return buildPathname(match.locale, [...routeSegments(config.canonical), ...match.tailSegments]);
}

function modalPathnameForConfig(
  key: ModalPageRouteKey,
  match: SegmentMatch,
  isMobile: boolean,
): string | null {
  const config = modalPageRouteConfigs[key];
  const route = getDeviceRoute(config, isMobile);
  if (!isModalRouteValue(route)) return null;

  const segments: string[] = [];
  if (config.parentKey) {
    const parentConfig = modalPageRouteConfigs[config.parentKey];
    const parentRoute = getDeviceRoute(parentConfig, isMobile);
    if (isModalRouteValue(parentRoute)) {
      segments.push(...routeSegments(parentRoute));
    }
  }

  segments.push(...routeSegments(route), ...match.tailSegments);
  return buildPathname(match.locale, segments);
}

function adaptiveModalMatch(
  pathname: string,
  isMobile: boolean,
): { key: ModalPageRouteKey; match: SegmentMatch } | null {
  for (const key of getMatchOrder()) {
    const config = modalPageRouteConfigs[key];
    if (!getDeviceRouteIsModal(config, isMobile)) continue;

    const match = findRouteMatch(pathname, config.canonical, 'root');
    if (!match || !isRouteMatchAllowed(config, match.tailSegments)) continue;

    return { key, match };
  }
  return null;
}

function adaptiveClosePathname(pathname: string, isMobile: boolean): string | null {
  const modalMatch = adaptiveModalMatch(pathname, isMobile);
  if (!modalMatch) return null;

  const { key, match } = modalMatch;
  const config = modalPageRouteConfigs[key];
  if (config.parentKey) {
    const parentConfig = modalPageRouteConfigs[config.parentKey];
    if (getDeviceRouteIsModal(parentConfig, isMobile)) {
      return buildPathname(match.locale, routeSegments(parentConfig.canonical));
    }
  }

  if (config.onlySwitchWhenParamPresent) {
    return buildPathname(match.locale, routeSegments(config.canonical));
  }

  return buildPathname(match.locale, match.prefixSegments);
}

function explicitClosePathname(pathname: string): string | null {
  const parsed = parsePathname(pathname);
  const modalIndexes = parsed.localSegments
    .map((segment, index) => (modalRouteValues.has(`/${segment}`) ? index : -1))
    .filter((index) => index !== -1);

  if (!modalIndexes.length) return null;

  const lastModalIndex = modalIndexes[modalIndexes.length - 1];
  if (modalIndexes.length > 1) {
    return buildPathname(parsed.locale, parsed.localSegments.slice(0, lastModalIndex));
  }

  return buildPathname(parsed.locale, parsed.localSegments.slice(0, lastModalIndex));
}

export const getMatchOrder = (): ModalPageRouteKey[] =>
  (Object.keys(ModalPageRoutes) as ModalPageRouteKey[]).sort((a, b) => {
    const aConfig = modalPageRouteConfigs[a];
    const bConfig = modalPageRouteConfigs[b];
    const aHasParent = Boolean(aConfig.parentKey);
    const bHasParent = Boolean(bConfig.parentKey);
    const aHasParam = Boolean(aConfig.onlySwitchWhenParamPresent);
    const bHasParam = Boolean(bConfig.onlySwitchWhenParamPresent);
    const aRouteLength = routeSegments(aConfig.canonical).length;
    const bRouteLength = routeSegments(bConfig.canonical).length;

    return (
      Number(bHasParent) - Number(aHasParent) ||
      Number(bHasParam) - Number(aHasParam) ||
      bRouteLength - aRouteLength
    );
  });

export function isModalRouteValue(route: string): boolean {
  return modalRouteValues.has(normalizePathname(route));
}

export function hasLocalePrefix(pathname: string): boolean {
  return parsePathname(pathname).locale !== null;
}

export function getLocalPathname(pathname: string): string {
  const parsed = parsePathname(pathname);
  return buildPathname(null, parsed.localSegments);
}

export function getCanonicalPathname(pathname: string): string {
  const collapsed = collapseMergedModalPath(pathname) ?? pathname;

  for (const key of getMatchOrder()) {
    const config = modalPageRouteConfigs[key];
    for (const route of sourceRoutesForConfig(key)) {
      const match = findRouteMatch(collapsed, route, 'root');
      if (!match || !isRouteMatchAllowed(config, match.tailSegments)) continue;
      return canonicalPathnameForConfig(config, match);
    }
  }

  return normalizePathname(collapsed);
}

export function getCanonicalHref(href: string): string {
  try {
    const url = new URL(href, 'http://app.local');
    const pathname = getCanonicalPathname(url.pathname);
    return `${pathname}${url.search}${url.hash}`;
  } catch {
    const [pathname = '/', queryAndHash = ''] = href.split(/(?=[?#])/);
    return `${getCanonicalPathname(pathname)}${queryAndHash}`;
  }
}

export function getRouteModalRenderPath(pathname: string, isMobile: boolean): string | null {
  const canonicalPathname = getCanonicalPathname(pathname);
  const adaptiveMatch = adaptiveModalMatch(canonicalPathname, isMobile);
  if (adaptiveMatch) {
    return modalPathnameForConfig(adaptiveMatch.key, adaptiveMatch.match, isMobile);
  }

  return firstExplicitModalMatch(canonicalPathname) ? canonicalPathname : null;
}

export function shouldOpenAsRouteModal(href: string, isMobile: boolean): boolean {
  const url = new URL(getCanonicalHref(href), 'http://app.local');
  return getRouteModalRenderPath(url.pathname, isMobile) !== null;
}

export function getRouteModalClosePathname(pathname: string, isMobile: boolean): string | null {
  const originalExplicitMatch = firstExplicitModalMatch(pathname);
  if (originalExplicitMatch && originalExplicitMatch.index > 0) {
    return explicitClosePathname(pathname);
  }

  const canonicalPathname = getCanonicalPathname(pathname);
  return (
    adaptiveClosePathname(canonicalPathname, isMobile) ?? explicitClosePathname(canonicalPathname)
  );
}

export function getRouteModalBasePathname(pathname: string, isMobile: boolean): string | null {
  if (!getRouteModalRenderPath(pathname, isMobile)) return null;
  return getRouteModalClosePathname(pathname, isMobile) ?? '/';
}

export function shouldRewriteRouteModalRequest(pathname: string, isMobile: boolean): boolean {
  const originalExplicitMatch = firstExplicitModalMatch(pathname);
  if (originalExplicitMatch && originalExplicitMatch.index > 0) return true;

  const canonicalPathname = getCanonicalPathname(pathname);
  if (firstExplicitModalMatch(canonicalPathname)) return true;

  const adaptiveMatch = adaptiveModalMatch(canonicalPathname, isMobile);
  if (!adaptiveMatch) return false;

  return adaptiveClosePathname(canonicalPathname, isMobile) !== '/';
}

export function getModalParamsFromPath(pathname: string, target: string): string[] {
  const explicitMatch = findRouteMatch(pathname, target, 'any');
  if (explicitMatch) return explicitMatch.tailSegments;

  const canonicalPathname = getCanonicalPathname(pathname);
  for (const key of getMatchOrder()) {
    const config = modalPageRouteConfigs[key];
    const configRoutes: readonly string[] = [config.pc, config.h5, config.canonical];
    if (!configRoutes.includes(target)) continue;

    const match = findRouteMatch(canonicalPathname, config.canonical, 'root');
    if (!match || !isRouteMatchAllowed(config, match.tailSegments)) continue;
    return match.tailSegments;
  }

  return [];
}

/** 兼容旧命名：将 pc 格式 pathname 转为 h5 modal 路径，用于 RouteModalRenderer 渲染。 */
export function getH5PathForPcPath(pathname: string): string | null {
  return getRouteModalRenderPath(pathname, true);
}
