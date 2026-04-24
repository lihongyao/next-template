import { transform } from '@svgr/core';
import jsx from '@svgr/plugin-jsx';
import svgo from '@svgr/plugin-svgo';
import fs from 'node:fs/promises';
import path from 'node:path';
import prettier from 'prettier';

import { ROOT_DIR, SVG_GENERATED_DIR, SVG_SOURCE_SVGRS_DIR } from './config.js';
import { optimizeSvgContent } from './optimize-svgo.js';
import {
  componentNameFromOriginal,
  fileExists,
  readSvgNamesFromDir,
  removeOrphanedSvgrTsxFiles,
  safeFileBase,
} from './utils.js';

export type SvgrGenerateStats = {
  created: string[];
  skipped: string[];
  /** 对应的 generated 文件名，如 `foo.tsx` */
  removed: string[];
};

export type GenerateSvgrResult = {
  names: string[];
  stats: SvgrGenerateStats;
};

/**
 * 增量：仅当 `generated/{safeName}.tsx` 不存在时从 SVGR 生成，避免覆盖已有手工修改（如 CSS 变量换色）。
 * 源里删掉的 svg 会触发对应 tsx 删除，与 source/svgrs 对齐。
 * 若需从最新 .svg 重新生成某图标，先删除其 .tsx 再执行 `pnpm gen-svg`。
 */
export async function generateSvgrComponents(): Promise<GenerateSvgrResult> {
  const iconNames = await readSvgNamesFromDir(SVG_SOURCE_SVGRS_DIR);
  const prettierConfig = (await prettier.resolveConfig(ROOT_DIR)) ?? {};

  await fs.mkdir(SVG_GENERATED_DIR, { recursive: true });

  const removed = await removeOrphanedSvgrTsxFiles(SVG_GENERATED_DIR, iconNames);

  const created: string[] = [];
  const skipped: string[] = [];

  for (const name of iconNames) {
    const filePath = path.join(SVG_SOURCE_SVGRS_DIR, `${name}.svg`);
    const safeBase = safeFileBase(name);
    const componentName = componentNameFromOriginal(name);
    const tsxPath = path.join(SVG_GENERATED_DIR, `${safeBase}.tsx`);

    if (await fileExists(tsxPath)) {
      skipped.push(name);
      continue;
    }

    const rawSvg = await fs.readFile(filePath, 'utf8');
    // 先统一颜色策略，再交给 svgr 做组件转换。
    const normalizedSvg = optimizeSvgContent(rawSvg, filePath);

    const tsxCode = await transform(
      normalizedSvg,
      {
        typescript: true,
        icon: true,
        prettier: false,
        expandProps: 'end',
        plugins: [svgo, jsx],
        svgoConfig: {
          plugins: [
            {
              name: 'preset-default',
              params: {
                overrides: {
                  // viewBox 必须保留，否则 Icon 在不同尺寸下会失真。
                  removeViewBox: false,
                },
              },
            },
            'removeDimensions',
          ],
        },
        jsxRuntime: 'automatic',
      },
      { componentName },
    );

    const formatted = await prettier.format(tsxCode, {
      ...prettierConfig,
      parser: 'typescript',
    });

    await fs.writeFile(tsxPath, formatted, 'utf8');
    created.push(name);
  }

  return {
    names: iconNames,
    stats: { created, skipped, removed },
  };
}
