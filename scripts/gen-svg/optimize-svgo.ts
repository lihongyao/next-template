import type { Config } from 'svgo';
import { optimize } from 'svgo';

const SVGO_CONFIG: Config = {
  plugins: [
    // svgo v4 的 preset-default 默认不会移除 viewBox，这里直接使用内建 preset 即可。
    'preset-default',
    // 额外移除宽高，让 Icon 组件统一通过 1em 和外部样式控尺寸。
    'removeDimensions',
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
  // 当前团队约定：svgrs 默认保留设计稿原色，后续若需要皮肤变量，由开发手动调整 generated/*.tsx。
  // 若未来需要恢复“统一改成 currentColor 再生成”，放开下一行并删掉下面这行即可。
  // const normalized = normalizeFillAndStroke(content);
  // 这里仍保留 normalizeFillAndStroke，避免以后回切 currentColor 时重新找逻辑。
  const normalized = content;
  const optimized = optimize(normalized, {
    path: filePath,
    ...SVGO_CONFIG,
  });
  return optimized.data || normalized;
}
