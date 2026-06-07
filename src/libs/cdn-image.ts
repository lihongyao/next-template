/**
 * 🔥 Cloudflare CDN Image URL Builder
 * 保持现有路径结构：
 * classic/blue/afun/xxx.png
 *
 * Docs:
 * https://developers.cloudflare.com/images/transform-images/transform-via-url
 */
import brands from '@/configs/brands';

// ==============================

const CDN_ORIGIN = 'http://localhost:3000';
const CDN_PREFIX = '/brands_latest';

/**
 * 你的资源站路径前缀
 * 例如：
 * https://img.engames.com/assets/{seriesName}/xxx.png
 */
const STATIC_PREFIX = '/';

// ⚠️ 这里替换为你的真实变量来源
const seriesName = 'default';

interface ImageTransformOptions {
  q?: number;
  w?: number | string;
  h?: number | string;
  fit?: string;
}

interface GetImageOptions {
  /** 服务端渲染时传入 ua，用于判断设备类型 */
  userAgent?: string | null;
  /** 版本，示例 20260101_0000 */
  version?: string;
  /** 图片处理选项，参数优化时会用到，理论上，只需要给宽度即可，高度会自适应 */
  imageOptions?: ImageTransformOptions;
}

let cachedDpr: number | null = null;

function getDeviceDpr(userAgent?: string | null): number {
  if (cachedDpr !== null) return cachedDpr;

  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : userAgent || '';

  if (/iPhone|iPad|iPod/i.test(ua)) {
    cachedDpr = 3;
  } else if (/Android/i.test(ua)) {
    cachedDpr = 2;
  } else {
    cachedDpr = 1;
  }

  return cachedDpr;
}

function buildTransformParams(dpr: number, options: ImageTransformOptions = {}) {
  const { q = 80, w = 'auto', h = 'auto', fit } = options;

  const params = {
    format: 'auto',
    q,
    dpr,
    w,
    h,
    fit,
  };

  return Object.entries(params)
    .filter(([, v]) => v != null)
    .map(([k, v]) => `${k}=${v}`)
    .join(',');
}

/**
 * 获取 CDN 图片 URL（SSR / CSR 通用）
 *
 * @example
 * getImageUrl("classic/blue/afun/banner.png", {
 *   imageOptions: { w: 600 }
 * })
 */
export function getImageUrl(path: string, options?: GetImageOptions): string {
  if (!path?.trim()) return '';

  const { userAgent = null, imageOptions } = options || {};

  // 1. DPR
  const dpr = getDeviceDpr(userAgent);

  // 2. transform 参数
  // const params = buildTransformParams(dpr, imageOptions);
  const params = '';

  // 3. 源路径
  let sourcePath: string;

  if (path.startsWith('http')) {
    sourcePath = new URL(path).pathname;
  } else {
    const route = `${process.env.NEXT_PUBLIC_BRAND.split('_').join('')}_${brands.series}`;
    sourcePath = `${STATIC_PREFIX}${route}/${path}`;
  }

  // 4. 最终 URL
  return `${CDN_ORIGIN}${CDN_PREFIX}${params}${sourcePath}`;
}
