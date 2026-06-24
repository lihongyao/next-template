import { transform } from '@svgr/core';
import jsx from '@svgr/plugin-jsx';
import fs from 'node:fs/promises';
import path from 'node:path';
import prettier from 'prettier';

import { SVG_GENERATED_DIR, SVG_SOURCE_SVGRS_DIR } from './config.js';
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

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// defs / mask / clipPath 里的静态 id 在同页多次渲染时会冲突，这里统一改成 useId() 版本。
function ensureUniqueSvgIds(tsxCode: string): string {
  const idMatches = Array.from(tsxCode.matchAll(/\bid=(["'])(.*?)\1/g), (match) => match[2]);
  const ids = [...new Set(idMatches)];
  if (ids.length === 0) return tsxCode;

  const usedVarNames = new Set<string>();
  const idVarMap = new Map<string, string>();

  for (const id of ids) {
    const baseName = safeFileBase(id).replace(/^_+/, '') || 'svgDef';
    let varName = `${baseName}Id`;
    let suffix = 2;

    while (usedVarNames.has(varName)) {
      varName = `${baseName}Id${suffix}`;
      suffix += 1;
    }

    usedVarNames.add(varName);
    idVarMap.set(id, varName);
  }

  let nextCode = tsxCode.replace(
    /import\s+type\s+\{\s*SVGProps\s*\}\s+from\s+['"]react['"];?/,
    "import { useId, type SVGProps } from 'react';",
  );

  for (const [id, varName] of idVarMap) {
    const escapedId = escapeRegExp(id);
    nextCode = nextCode.replace(new RegExp(`id=(["'])${escapedId}\\1`, 'g'), `id={${varName}}`);
    nextCode = nextCode.replace(
      new RegExp(`=(["'])url\\(#${escapedId}\\)\\1`, 'g'),
      `={\`url(#$\{${varName}})\`}`,
    );
    nextCode = nextCode.replace(
      new RegExp(`=(["'])#${escapedId}\\1`, 'g'),
      `={\`#$\{${varName}}\`}`,
    );
  }

  const declarations = [
    "const idPrefix = useId().replace(/:/g, '');",
    ...Array.from(idVarMap.entries()).map(
      ([id, varName]) => `const ${varName} = idPrefix + ${JSON.stringify(`-${id}`)};`,
    ),
  ].join('\n  ');

  nextCode = nextCode.replace(
    /const\s+(\w+)\s*=\s*\(props: SVGProps<SVGSVGElement>\)\s*=>\s*\(\n/,
    `const $1 = (props: SVGProps<SVGSVGElement>) => {\n  ${declarations}\n\n  return (\n`,
  );

  nextCode = nextCode.replace(
    /\n\);\nexport default\s+(\w+);?\s*$/,
    '\n  );\n};\nexport default $1;\n',
  );

  return nextCode;
}

/**
 * 增量：仅当 `generated/{safeName}.tsx` 不存在时从 SVGR 生成，避免覆盖已有手工修改（如 CSS 变量换色）。
 * 源里删掉的 svg 会触发对应 tsx 删除，与 source/svgrs 对齐。
 * 若需从最新 .svg 重新生成某图标，先删除其 .tsx 再执行 `pnpm gen-svg`。
 */
export async function generateSvgrComponents(): Promise<GenerateSvgrResult> {
  const iconNames = await readSvgNamesFromDir(SVG_SOURCE_SVGRS_DIR);
  // resolveConfig 传具体文件路径，才能稳定拿到项目里的 .prettierrc。
  const prettierConfig =
    (await prettier.resolveConfig(path.join(SVG_GENERATED_DIR, '__generated__.tsx'))) ?? {};

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
      // 已接管的产物不重生，只补“唯一 id”这类安全修正。
      const currentCode = await fs.readFile(tsxPath, 'utf8');
      const normalizedCode = ensureUniqueSvgIds(currentCode);

      if (normalizedCode !== currentCode) {
        const formatted = await prettier.format(normalizedCode, {
          ...prettierConfig,
          parser: 'typescript',
        });
        await fs.writeFile(tsxPath, formatted, 'utf8');
      }

      skipped.push(name);
      continue;
    }

    const rawSvg = await fs.readFile(filePath, 'utf8');
    // 颜色和压缩策略都在 optimizeSvgContent 里统一收口。
    const normalizedSvg = optimizeSvgContent(rawSvg, filePath);

    const tsxCode = await transform(
      normalizedSvg,
      {
        typescript: true,
        icon: true,
        prettier: false,
        expandProps: 'end',
        plugins: [jsx],
        jsxRuntime: 'automatic',
      },
      { componentName },
    );

    const baseFormatted = await prettier.format(tsxCode, {
      ...prettierConfig,
      parser: 'typescript',
    });
    // 先让 prettier 把 JSX 摆正，再做字符串级替换，正则更稳定。
    const formatted = await prettier.format(ensureUniqueSvgIds(baseFormatted), {
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
