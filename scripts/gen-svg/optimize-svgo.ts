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

function normalizeFillAndStroke(svg: string): string {
  return svg
    .replace(/\bfill=(["'])(?!none\1)(?:\\.|(?!\1).)*\1/gi, 'fill="currentColor"')
    .replace(/\bstroke=(["'])(?!none\1)(?:\\.|(?!\1).)*\1/gi, 'stroke="currentColor"');
}

export function optimizeSvgContent(content: string, filePath: string): string {
  const normalized = normalizeFillAndStroke(content);
  const optimized = optimize(normalized, {
    path: filePath,
    ...SVGO_CONFIG,
  });
  return optimized.data || normalized;
}
