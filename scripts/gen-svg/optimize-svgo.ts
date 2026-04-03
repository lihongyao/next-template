import type { Config } from 'svgo';
import { optimize } from 'svgo';

const SVGO_CONFIG: Config = {
  plugins: [
    'preset-default',
    { name: 'removeDimensions' },
    { name: 'removeComments' },
    { name: 'sortAttrs' },
  ],
};

function shouldKeepPaintValue(rawValue: string): boolean {
  // 这些值要保留：none/currentColor/变量/渐变引用，避免影响到多色图标或主题变量。
  const value = rawValue.trim().toLowerCase();
  if (!value) return true;
  if (value === 'none') return true;
  if (value === 'currentcolor') return true;
  if (value === 'inherit') return true;
  if (value === 'context-fill' || value === 'context-stroke') return true;
  if (value.startsWith('url(')) return true;
  if (value.startsWith('var(')) return true;
  return false;
}

function normalizeFillAndStroke(svg: string): string {
  return svg.replace(/\b(fill|stroke)\s*=\s*(["'])(.*?)\2/gi, (match, attr, quote, value) => {
    if (shouldKeepPaintValue(String(value))) return match;
    return `${attr}=${quote}currentColor${quote}`;
  });
}

export function optimizeSvgContent(content: string, filePath: string): string {
  // 先做颜色归一，再走 svgo 常规压缩。
  const normalized = normalizeFillAndStroke(content);
  const optimized = optimize(normalized, {
    path: filePath,
    ...SVGO_CONFIG,
  });
  return optimized.data || normalized;
}
