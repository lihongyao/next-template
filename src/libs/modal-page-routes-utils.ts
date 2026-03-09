import type { ModalPageRouteKey } from './routes';
import { ModalPageRoutes } from './routes';

/** 匹配顺序：有 parentKey 的子路由优先 */
export const getMatchOrder = (): ModalPageRouteKey[] =>
  (Object.keys(ModalPageRoutes) as ModalPageRouteKey[]).sort((a, b) => {
    const aHasParent = 'parentKey' in ModalPageRoutes[a];
    const bHasParent = 'parentKey' in ModalPageRoutes[b];
    return Number(bHasParent) - Number(aHasParent);
  });

function matchRoute(pathname: string, route: string): boolean {
  if (pathname.indexOf(route) === -1) return false;
  return pathname === route || pathname.includes(route + '/') || pathname.endsWith(route);
}

/**
 * 将 pc 格式 pathname 转为 h5 modal 路径，用于 RouteModalRenderer 渲染。
 * 当 pathname 已是 h5 格式（含 modal 段）时返回 null，表示直接按 pathname 解析即可。
 */
export function getH5PathForPcPath(pathname: string): string | null {
  for (const key of getMatchOrder()) {
    const { pc, h5 } = ModalPageRoutes[key];
    const pcIndex = pathname.indexOf(pc);
    if (pcIndex === -1 || !matchRoute(pathname, pc)) continue;
    const config = ModalPageRoutes[key];
    const onlyWhenParam =
      'onlySwitchWhenParamPresent' in config && config.onlySwitchWhenParamPresent;
    const paramSegment = pathname.slice(pcIndex + pc.length);
    if (onlyWhenParam && paramSegment.length <= 1) continue;
    const parentKey = 'parentKey' in config ? config.parentKey : undefined;
    const parentConfig = parentKey ? ModalPageRoutes[parentKey] : undefined;
    if (parentConfig) {
      return parentConfig.h5 + config.h5 + paramSegment;
    }
    return pathname.slice(0, pcIndex) + config.h5 + paramSegment;
  }
  return null;
}
