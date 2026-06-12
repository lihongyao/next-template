import dynamic from 'next/dynamic';

import type { ComponentInfo } from '@/types';

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
