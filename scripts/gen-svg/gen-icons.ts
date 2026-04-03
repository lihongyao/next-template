import { transform } from '@svgr/core';
import jsx from '@svgr/plugin-jsx';
import svgo from '@svgr/plugin-svgo';
import fs from 'node:fs/promises';
import path from 'node:path';
import prettier from 'prettier';

import { ROOT_DIR, SVG_GENERATED_DIR, SVG_SOURCE_SVGRS_DIR } from './config.js';
import { optimizeSvgContent } from './optimize-svgo.js';
import {
  cleanGeneratedTsxFiles,
  componentNameFromOriginal,
  readSvgNamesFromDir,
  safeFileBase,
} from './utils.js';

export async function generateSvgrComponents(): Promise<string[]> {
  const iconNames = await readSvgNamesFromDir(SVG_SOURCE_SVGRS_DIR);
  const prettierConfig = (await prettier.resolveConfig(ROOT_DIR)) ?? {};

  await fs.mkdir(SVG_GENERATED_DIR, { recursive: true });
  await cleanGeneratedTsxFiles(SVG_GENERATED_DIR);

  for (const name of iconNames) {
    const filePath = path.join(SVG_SOURCE_SVGRS_DIR, `${name}.svg`);
    const safeBase = safeFileBase(name);
    const componentName = componentNameFromOriginal(name);
    const tsxPath = path.join(SVG_GENERATED_DIR, `${safeBase}.tsx`);
    const rawSvg = await fs.readFile(filePath, 'utf8');
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
            'preset-default',
            { name: 'removeViewBox', active: false },
            { name: 'removeDimensions', active: true },
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
  }

  return iconNames;
}
