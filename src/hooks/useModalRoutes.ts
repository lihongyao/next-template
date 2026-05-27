// src/hooks/useModalRoutes.ts
import { usePathname } from '@/i18n/navigation';
import { useDevice } from '@/providers/device.provider';
import { ModalPageRouteConfig, ModalRoutes } from '@/router/routes';

/**
 * 提供弹窗/页面路由相关工具方法
 *
 * - resolveRouteForCurrentDevice: 根据当前设备从配置中返回 pc 或 h5 路径，传 ModalPageRoutes.xxx
 * - mergeRouteIntoCurrentPath: 将目标路由合并到当前 pathname，返回完整路径（路由弹窗时用）
 */
export const useModalRoutes = () => {
  const pathname = usePathname();
  const { isMobile } = useDevice();
  const activePathname =
    isMobile && typeof window !== 'undefined' ? window.location.pathname : pathname;

  /** 将目标路由合并进当前 pathname，返回完整路径 */
  const mergeRouteIntoCurrentPath = (target: string) => {
    if (!target) return target;
    // 确保目标路由以斜杠开头
    target = target.startsWith('/') ? target : `/${target}`;
    const base = activePathname.endsWith('/') ? activePathname.slice(0, -1) : activePathname;
    const index = activePathname.indexOf(target);
    return index !== -1 ? `${activePathname.slice(0, index)}${target}` : `${base}${target}`;
  };

  /** 根据当前设备（pc/h5）从配置中取对应路径，null 当 PC */
  const resolveRouteForCurrentDevice = (config: ModalPageRouteConfig) => {
    const jumpToUrl = isMobile === true ? config.h5 : config.pc;
    const isModalRoute = (Object.values(ModalRoutes) as string[]).includes(jumpToUrl);
    return isModalRoute ? mergeRouteIntoCurrentPath(jumpToUrl) : jumpToUrl;
  };

  /** 从目标路由中获取参数 */
  const getModalParams = (target: string) => {
    const pathnameSegments = activePathname.split('/').filter(Boolean);
    const targetSegments = target.split('/').filter(Boolean);
    const targetIndex = pathnameSegments.findIndex((segment) => targetSegments.includes(segment));
    const params = pathnameSegments.slice(targetIndex + 1);
    return params;
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
