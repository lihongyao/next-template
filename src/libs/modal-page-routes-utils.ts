import { routing } from '@/i18n/routing';
import {
  type ModalPageRouteConfig,
  type ModalPageRouteKey,
  ModalPageRoutes,
  ModalRoutes,
} from '@/router/routes';

/**
 * 这组 helper 负责把 route modal 的各种路径形态统一起来：
 * - canonical: 业务跳转和服务端判断使用的标准路径。
 * - render path: 客户端真正拿来渲染 modal 的路径。
 * - close path: modal 关闭后应该回到的底页。
 *
 * 这里同时兼容两类 route modal：
 * 1. 显式 modal，例如 /login、/profile。
 * 2. PC/H5 自适应 modal，例如 /news/:id、/game-list/:id。
 */

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

// 先去掉 query/hash，再做路径规范化，避免同一路由因为尾巴不同而匹配失败。
function withoutSearch(pathname: string): string {
  return pathname.split(/[?#]/)[0] || '/';
}

// 统一压成单斜杠、去掉尾随斜杠，并保证始终以 / 开头。
function normalizePathname(pathname: string): string {
  const normalized = withoutSearch(pathname).replace(/\/{2,}/g, '/');
  if (!normalized || normalized === '/') return '/';
  return normalized.startsWith('/') ? normalized.replace(/\/$/, '') || '/' : `/${normalized}`;
}

// 把 route 常量或 pathname 拆成纯 segment 数组，方便做前缀/尾巴匹配。
function routeSegments(route: string): string[] {
  return normalizePathname(route).split('/').filter(Boolean);
}

// 先识别 locale 前缀，再保留 locale 之外的本地 segments。
function parsePathname(pathname: string): ParsedPathname {
  const segments = normalizePathname(pathname).split('/').filter(Boolean);
  const first = segments[0];
  const hasLocale = first ? (routing.locales as readonly string[]).includes(first) : false;
  return {
    locale: hasLocale ? first : null,
    localSegments: hasLocale ? segments.slice(1) : segments,
  };
}

// 反向拼回 pathname；locale 为空时就只保留本地 segments。
function buildPathname(locale: string | null, localSegments: string[]): string {
  const segments = locale ? [locale, ...localSegments] : localSegments;
  return segments.length ? `/${segments.join('/')}` : '/';
}

// 有些配置只在存在参数尾巴时才切换，比如 /news/1 这种详情页。
function hasParamTail(tailSegments: string[]): boolean {
  return tailSegments.length > 0;
}

function isRouteMatchAllowed(config: ModalPageRouteConfig, tailSegments: string[]): boolean {
  return !config.onlySwitchWhenParamPresent || hasParamTail(tailSegments);
}

// 在 pathname 里找 route 对应的 segment 序列。
// mode = root 时只允许从第一个本地 segment 开始匹配；
// mode = any 时允许扫整个 pathname，主要给显式 modal 读取参数用。
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

// 一个自适应 route config 可能通过 canonical、pc、h5，或者父子拼接后的路径命中。
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

// 显式 modal 的判断只看 pathname 里最早出现的 modal segment。
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

// 兼容旧的拼接式地址 /base/modal/...：
// 如果第一个 modal 段不在根部，就把前面的业务底页裁掉，只保留 modal 自身。
function collapseMergedModalPath(pathname: string): string | null {
  const match = firstExplicitModalMatch(pathname);
  if (!match || match.index === 0) return null;
  return buildPathname(match.locale, [match.localSegments[match.index], ...match.tailSegments]);
}

// 以 canonical 作为锚点，把命中的尾巴参数拼回去，得到当前 config 对应的 canonical URL。
function canonicalPathnameForConfig(config: ModalPageRouteConfig, match: SegmentMatch): string {
  return buildPathname(match.locale, [...routeSegments(config.canonical), ...match.tailSegments]);
}

// 根据当前设备把一个 canonical route 映射成真正要渲染的 modal 路径。
// 如果当前设备并不以 modal 形式展示，那就返回 null。
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

// 按 match order 依次尝试 adaptive route 配置，找到当前设备下会被解释成 modal 的那一条。
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

// 计算 adaptive modal 的关闭目标。
// - 嵌套 modal：先回到父 modal 对应的 canonical。
// - 仅参数触发的 modal：回到列表 canonical。
// - 其它情况：去掉匹配到的 canonical 前缀，回到底页。
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

// 匹配优先级：先看是否有 parentKey 的嵌套 modal，再看只在带参数时才切换的 route，
// 最后按 canonical 长度排序，避免短路径误抢长路径。
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

// 判断一个路径 segment 是否属于显式 modal 路由。
export function isModalRouteValue(route: string): boolean {
  return modalRouteValues.has(normalizePathname(route));
}

// locale 是否真的存在于当前 pathname 的第一段。
export function hasLocalePrefix(pathname: string): boolean {
  return parsePathname(pathname).locale !== null;
}

// 去掉 locale，只保留本地业务路径。
export function getLocalPathname(pathname: string): string {
  const parsed = parsePathname(pathname);
  return buildPathname(null, parsed.localSegments);
}

// 把各种 path 归一到 canonical 形态：
// - 去掉 locale 前缀后再匹配；
// - 兼容旧的 /base/modal/... 拼接形态；
// - 让显式 modal 和自适应 modal 都能落到同一套业务判断上。
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

// 和 getCanonicalPathname 类似，但保留 query/hash，方便直接处理 href。
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

// 给 RouteModalRenderer 用的渲染路径。
// 自适应 modal 会转换成当前设备真正渲染的 modal path；
// 显式 modal 则直接复用 canonicalPathname。
export function getRouteModalRenderPath(pathname: string, isMobile: boolean): string | null {
  const canonicalPathname = getCanonicalPathname(pathname);
  const adaptiveMatch = adaptiveModalMatch(canonicalPathname, isMobile);
  if (adaptiveMatch) {
    return modalPathnameForConfig(adaptiveMatch.key, adaptiveMatch.match, isMobile);
  }

  return firstExplicitModalMatch(canonicalPathname) ? canonicalPathname : null;
}

// 业务跳转前先判断目标在当前设备下是不是 route modal。
export function shouldOpenAsRouteModal(href: string, isMobile: boolean): boolean {
  const url = new URL(getCanonicalHref(href), 'http://app.local');
  return getRouteModalRenderPath(url.pathname, isMobile) !== null;
}

// 关闭 route modal 时应该回到哪里。
// 先处理“已经是显式 modal 且路径里还混着底页前缀”的场景，再处理 canonical 场景。
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

// 服务端直达 modal URL 时，proxy 需要先把请求重写到底页，再让客户端叠 modal。
export function getRouteModalBasePathname(pathname: string, isMobile: boolean): string | null {
  if (!getRouteModalRenderPath(pathname, isMobile)) return null;
  return getRouteModalClosePathname(pathname, isMobile) ?? '/';
}

// 视口切换时，先把页面树切到底页，但地址栏仍保留 canonical modal URL。
export function getRouteModalSwitchBasePathname(
  pathname: string,
  isMobile: boolean,
): string | null {
  const canonicalPathname = getCanonicalPathname(pathname);
  const adaptiveMatch = adaptiveModalMatch(canonicalPathname, isMobile);
  if (!adaptiveMatch) return null;

  const basePathname = adaptiveClosePathname(canonicalPathname, isMobile);
  return basePathname && basePathname !== '/' ? basePathname : null;
}

// proxy 的最终开关：只有当前设备会把这个请求解释成 route modal，才触发 rewrite。
export function shouldRewriteRouteModalRequest(pathname: string, isMobile: boolean): boolean {
  const originalExplicitMatch = firstExplicitModalMatch(pathname);
  if (originalExplicitMatch && originalExplicitMatch.index > 0) return true;

  const canonicalPathname = getCanonicalPathname(pathname);
  if (firstExplicitModalMatch(canonicalPathname)) return true;

  const adaptiveMatch = adaptiveModalMatch(canonicalPathname, isMobile);
  if (!adaptiveMatch) return false;

  return adaptiveClosePathname(canonicalPathname, isMobile) !== '/';
}

// 从当前 pathname 中读取 modal 参数。
// 显式 modal 直接从 pathname 里拿；自适应 modal 则先回到 canonical 再按配置匹配。
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
