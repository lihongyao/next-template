// 'use client';

// import { useLayoutEffect } from 'react';

// import { useSearchParams } from 'next/navigation';

// import { usePathname, useRouter } from '@/i18n/navigation';
// import { getMatchOrder } from '@/libs/modal-page-routes-utils';
// import { useDevice } from '@/providers/device.provider';
// import { ModalPageRouteKey, ModalPageRoutes } from '@/router/routes';

// const BASE_KEY = '__modal_base_path__';

// /** pathname 是否匹配 route（精确或带子路径） */
// function matchRoute(pathname: string, route: string): boolean {
//   if (pathname.indexOf(route) === -1) return false;
//   return pathname === route || pathname.includes(route + '/') || pathname.endsWith(route);
// }

// /** PC/H5 视窗切换时在 modal 路由与独立页路由间切换，带 base 的 modal 会记 base 便于切回 */
// export default function useModalPageAutoCollapse(): void {
//   const pathname = usePathname();
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const { isMobile } = useDevice();

//   useLayoutEffect(() => {
//     if (isMobile === null) return;

//     let matchedKey: ModalPageRouteKey | '' = '';
//     let basePath = '';
//     let paramSegment = '';

//     for (const key of getMatchOrder()) {
//       if (!(key in ModalPageRoutes)) continue;
//       const { pc, h5 } = ModalPageRoutes[key];

//       const h5Index = pathname.indexOf(h5);
//       if (h5Index !== -1 && matchRoute(pathname, h5)) {
//         const config = ModalPageRoutes[key];
//         const onlyWhenParam =
//           'onlySwitchWhenParamPresent' in config && config.onlySwitchWhenParamPresent;
//         const seg = pathname.slice(h5Index + h5.length);
//         if (onlyWhenParam && seg.length <= 1) continue;
//         matchedKey = key;
//         basePath = pathname.slice(0, h5Index);
//         paramSegment = seg;
//         break;
//       }

//       const pcIndex = pathname.indexOf(pc);
//       if (pcIndex !== -1 && matchRoute(pathname, pc)) {
//         const config = ModalPageRoutes[key];
//         const onlyWhenParam =
//           'onlySwitchWhenParamPresent' in config && config.onlySwitchWhenParamPresent;
//         const seg = pathname.slice(pcIndex + pc.length);
//         if (onlyWhenParam && seg.length <= 1) continue;
//         matchedKey = key;
//         basePath = pathname.slice(0, pcIndex);
//         paramSegment = seg;
//         break;
//       }
//     }

//     if (!matchedKey) {
//       localStorage.removeItem(BASE_KEY);
//       return;
//     }

//     const config = ModalPageRoutes[matchedKey];
//     const parentKey = 'parentKey' in config ? config.parentKey : undefined;
//     const parentConfig = parentKey ? ModalPageRoutes[parentKey] : undefined;

//     let targetPath: string;
//     if (isMobile) {
//       if (parentConfig) {
//         targetPath = parentConfig.h5 + config.h5 + paramSegment;
//       } else {
//         const finalBase = basePath || localStorage.getItem(BASE_KEY) || '';
//         targetPath = finalBase + config.h5 + paramSegment;
//         localStorage.setItem(BASE_KEY, finalBase);
//       }
//     } else {
//       targetPath = config.pc + paramSegment;
//       localStorage.setItem(BASE_KEY, basePath);
//     }
//     // h5 下从详情返回时，history 里可能是 pc 路径（如 /game-list），若 replace 成 h5 路径会命中 catch-all 导致 404。
//     // 故不替换，保持 pc 路径，由 RouteModalRenderer 根据 pathname+isMobile 渲染对应 modal。
//     if (isMobile && pathname === config.pc) return;

//     const queryString = searchParams.toString();
//     const targetUrl = queryString ? `${targetPath}?${queryString}` : targetPath;
//     if (targetPath !== pathname) router.replace(targetUrl);
//   }, [pathname, isMobile, router, searchParams]);
// }
