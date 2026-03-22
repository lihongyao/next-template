import dynamic from 'next/dynamic';

import brandConfig from '@/configs/brands';
import { imageManifest } from '@/generated/image-manifest';
import type { ComponentInfo } from '@/types';

/**
 * 获取图片资源地址
 *
 * @param path 图片路径，如 'banner.jpg'
 * @param version 版本号，如 '202601062258'
 * @returns 图片资源地址
 */
export function getImgUrl(path: string, general = false, version?: string): string {
  const { theme, skin, appId: brand } = brandConfig;

  // ===== 扁平化 theme-skin key =====
  const themeSkin = `${theme}-${skin}`;
  const root = 'images/cdn-imgs';

  // ===== 查 Sparse Manifest =====
  const skinData = imageManifest[themeSkin] as unknown as Record<string, string[]> | undefined;
  const brandFiles = skinData?.[brand] || [];

  let resolvedPath: string;

  if (general) {
    resolvedPath = `/general/${path}`;
  } else if (brandFiles.includes(path)) {
    resolvedPath = `/${themeSkin}/${brand}/${path}`;
  } else {
    resolvedPath = `/${themeSkin}/common/${path}`;
  }

  return version ? `${root}${resolvedPath}?v=${version}` : `${root}${resolvedPath}`;
}

/**
 * 加载动态组件
 * @param type 组件类型(名称)
 * @param key client | suspense
 * @returns
 */
type NestedObject = Record<string, unknown>;
export function loadDynamicComponent(type: string, mode: 'client' | 'suspense') {
  return dynamic<NestedObject>(() =>
    import(`@/components/widgets/${type}/${mode}`)
      .then((mod) => mod.default)
      .catch(() => {
        return () => {
          console.log(`⚠️  loadDynamicComponent：组件 【${type}/${mode}】 加载失败`);
          return null;
        };
      }),
  );
}

/**
 * 组件编排
 *
 * 1️⃣ layout.tsx -> layoutComps
 * 根据组件的 is_page_layout 属性进行分组，在 layout.tsx 中调用
 * 主要决定 children 的位置以及layouts组件，可能的情况有
 * 1. [layout_comps, children, layout_comps]
 * 2. [layout_comps, children]
 * 3. [children, layout_comps]
 *
 * 2️⃣ page.tsx -> pageComps
 * 过滤布局组件
 *
 * @param components 组件列表
 * @returns { layoutComps, pageComps}
 */
export function getOrchestrate(components: ComponentInfo[]) {
  const layoutComps: Array<ComponentInfo | 'children'> = [];
  const pageComps: Array<ComponentInfo> = [];
  const footerComps: Array<ComponentInfo> = [];
  // FIXME: FooterTypes 需要单独提到配置
  const FooterTypes: string[] = [];
  for (const item of components ?? []) {
    if (FooterTypes.includes(item.type)) {
      footerComps.push(item);
    } else {
      if (item.asLayout) {
        layoutComps.push(item);
      } else {
        if (!layoutComps.includes('children')) {
          layoutComps.push('children');
        }
        pageComps.push(item);
      }
    }
  }
  return { layoutComps, pageComps, footerComps };
}
