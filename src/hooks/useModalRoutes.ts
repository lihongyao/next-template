// src/hooks/useModalRoutes.ts
import { getCanonicalHref, getModalParamsFromPath } from '@/libs/modal-page-routes-utils';
import { usePathname } from '@/router';
import { ModalPageRouteConfig } from '@/router/routes';

/**
 * 提供弹窗/页面路由相关工具方法
 *
 * - resolveRouteForCurrentDevice: 返回该业务路由的 canonical 地址，具体展示形态由 router 代理决定
 * - mergeRouteIntoCurrentPath: 兼容旧调用，当前等价于返回 canonical modal 地址
 */
export const useModalRoutes = () => {
  const pathname = usePathname();
  const activePathname = typeof window !== 'undefined' ? window.location.pathname : pathname;

  /** @deprecated 业务侧无需再手动 merge，直接 router.push(target) 即可。 */
  const mergeRouteIntoCurrentPath = (target: string) => {
    return getCanonicalHref(target);
  };

  /** 返回地址栏使用的标准路径，PC/H5 差异交给 router 与 RouteModalRenderer 处理。 */
  const resolveRouteForCurrentDevice = (config: ModalPageRouteConfig) => {
    return config.canonical;
  };

  /** 从目标路由中获取参数 */
  const getModalParams = (target: string) => {
    return getModalParamsFromPath(activePathname, target);
  };

  /** 替换最后一段路径 */
  const replaceLastPath = (newSeg: string) => {
    const segs = activePathname.split('/');
    segs[segs.length - 1] = newSeg.replace(/^\//, '');
    return segs.join('/');
  };

  return {
    mergeRouteIntoCurrentPath,
    resolveRouteForCurrentDevice,
    getModalParams,
    replaceLastPath,
  };
};
