import fs from 'fs-extra';
import type { Config } from 'svgo';
import { optimize } from 'svgo';

import { COLOR_REPLACEMENTS } from './config';

const SVGO_CONFIG = {
  plugins: [
    { name: 'removeDimensions' },
    // { name: "removeAttrs", params: { attrs: "(fill|stroke|class|style)" } },
    { name: 'cleanupAttrs' },
    { name: 'removeComments' },
    { name: 'removeEmptyAttrs' },
    { name: 'removeEmptyContainers' },
    { name: 'removeUnusedNS' },
    { name: 'collapseGroups' },
  ],
} as Config;

// 将fill/stroke属性对应的颜色替换为currentColor
const regex = new RegExp(`(["'])(${Object.keys(COLOR_REPLACEMENTS).join('|')})\\1`, 'g');

// 优化 SVG 内容
export async function optimizeSvgContent(content: string, filepath: string) {
  try {
    const replaced = content.replace(regex, (_, quote, color) => {
      return `${quote}${COLOR_REPLACEMENTS[color]}${quote}`;
    });
    const result = optimize(replaced, {
      path: filepath,
      ...SVGO_CONFIG,
    });
    return result.data || replaced;
  } catch (err) {
    console.warn(`⚠️ 优化失败：${filepath}`, err);
    return content;
  }
}

// 批量优化 SVG 文件
export async function optimizeSvgFiles(svgPaths: string[]) {
  for (const filePath of svgPaths) {
    const content = await fs.readFile(filePath, 'utf8');
    const optimized = await optimizeSvgContent(content, filePath);
    await fs.writeFile(filePath, optimized, 'utf8');
  }
  console.log('✅ SVGO 优化完成');
}
