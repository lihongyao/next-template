// src/hooks/useModalRoutes.ts
import { usePathname } from '@/i18n/navigation';
import { ModalPageRouteConfig, Route } from '@/libs/routes';

import { useDevice } from './useDevices';

/**
 * 提供弹窗/页面路由相关工具方法
 *
 * - getModalOrPagePath: 根据当前设备返回 pc 或 h5 路径，传 ModalPageRoutes.xxx 可获得联想
 * - getMergePath: 将目标路由合并到当前 pathname
 */
export const useModalRoutes = () => {
  const pathname = usePathname();
  const { isMobile } = useDevice();

  const getMergePath = (target: string) => {
    if (!target) return target;
    // 确保目标路由以斜杠开头
    target = target.startsWith('/') ? target : `/${target}`;
    const base = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
    const index = pathname.indexOf(target);
    return index !== -1 ? `${pathname.slice(0, index)}${target}` : `${base}${target}`;
  };
  const getModalOrPagePath = (source: ModalPageRouteConfig): Route => {
    if (isMobile) {
      return source.h5;
    }
    return source.pc;
  };

  return {
    getMergePath,
    getModalOrPagePath,
  };
};
