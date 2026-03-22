/**
 * 🔥 Cloudflare CDN Image URL Builder
 * 保持现有路径结构：
 * classic/blue/afun/xxx.png
 *
 * Docs:
 * https://developers.cloudflare.com/images/transform-images/transform-via-url
 */

// ==============================
// 常量
// ==============================

const CDN_ORIGIN = 'https://img.engames.com';
const CDN_PREFIX = '/cdn-cgi/image';

/**
 * 你的资源站路径前缀
 * 例如：
 * https://img.engames.com/s_static_x/{seriesName}/xxx.png
 */
const STATIC_PREFIX = '/s_static_x';

// ⚠️ 这里替换为你的真实变量来源
const seriesName = 'default';

// ==============================
// 类型
// ==============================

interface ImageTransformOptions {
  q?: number;
  w?: number | string;
  h?: number | string;
  fit?: string;
}

interface GetImageOptions {
  /** SSR 时传入 UA */
  userAgent?: string | null;
  imageOptions?: ImageTransformOptions;
}

// ==============================
// DPR 计算（带缓存）
// ==============================

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

// ==============================
// Cloudflare 参数构建
// ==============================

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

// ==============================
// 主函数
// ==============================

/**
 * 获取 CDN 图片 URL（SSR / CSR 通用）
 *
 * @example
 * getCdnImageUrl("classic/blue/afun/banner.png", {
 *   imageOptions: { w: 600 }
 * })
 */
export function getCdnImageUrl(path: string, options?: GetImageOptions): string {
  if (!path?.trim()) return '';

  const { userAgent = null, imageOptions } = options || {};

  // ===== DPR =====
  const dpr = getDeviceDpr(userAgent);

  // ===== transform 参数 =====
  const params = buildTransformParams(dpr, imageOptions);

  // ===== 源路径 =====
  let sourcePath: string;

  if (path.startsWith('http')) {
    // 外部完整地址
    sourcePath = new URL(path).pathname;
  } else {
    // 你的现有资源格式
    sourcePath = `${STATIC_PREFIX}/${seriesName}/${path}`;
  }

  // ===== 最终 URL =====
  return `${CDN_ORIGIN}${CDN_PREFIX}/${params}${sourcePath}`;
}
