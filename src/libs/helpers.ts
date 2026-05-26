import dynamic from 'next/dynamic';

import { execSync } from 'node:child_process';

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
  const skinData = imageManifest[themeSkin as keyof typeof imageManifest] as unknown as
    | Record<string, string[]>
    | undefined;
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

export function getAppVersion() {
  const app = process.env.app;
  if (!app) {
    throw new Error('app is not set');
  }
  try {
    // 获取当前 commit 上的 tags
    const tags = execSync('git tag --points-at HEAD', { encoding: 'utf8' })
      .split('\n')
      .map((t) => t.trim())
      .filter(Boolean);
    // 获取当前应用的版本号，格式为：release/${app}_${timestamp}，如 release/afun_20260405_1500
    const match = tags.find((tag) => tag.startsWith(`release/${app}_`));
    if (!match) {
      throw new Error(`No tag found for ${app}`);
    }
    // 获取当前 commit 的 hash
    const hash = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
    // 返回版本号，格式为：release/${app}_${timestamp}_${hash}，如 release/afun_20260405_1500_12345678
    return `${match}_${hash}`;
  } catch {
    // 无 git 时 fallback，格式为：${timestamp}，如 v_afun_20260405_1500
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const timestamp = `${year}${month}${day}_${hours}${minutes}${seconds}`;
    return `v_${app}_${timestamp}`;
  }
}
