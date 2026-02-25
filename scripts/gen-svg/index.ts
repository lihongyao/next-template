/**
 * 扫描 src/assets/svg/source 下所有 .svg（扁平），
 * 使用 @svgr/core 生成 tsx 组件到 generated/，并生成 svgPath_all.ts 与 generated/index.ts
 *
 * 用法：npx tsx scripts/gen-svg/index.ts
 *
 * 依赖：chalk prettier @svgr/core @svgr/plugin-svgo @svgr/plugin-jsx
 */
import { transform } from '@svgr/core';
import jsx from '@svgr/plugin-jsx';
import svgo from '@svgr/plugin-svgo';
import chalk from 'chalk';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import prettier from 'prettier';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ==================== 路径配置 ====================
const ROOT = path.resolve(__dirname, '../../');
const svgDir = path.join(ROOT, 'src/assets/svg');
const svgSourceDir = path.join(svgDir, 'source');
const svgGeneratedDir = path.join(svgDir, 'generated');
const svgPathsOutputFile = path.join(ROOT, 'src/components/ui/Icon/svgPath_all.ts');

// ==================== 命名工具 ====================
function safeFileBase(originalBase: string): string {
  let s = originalBase.replace(/[^a-zA-Z0-9_]/g, '_');
  if (/^\d/.test(s)) s = '_' + s;
  return s;
}

function componentNameFromOriginal(originalBase: string): string {
  const parts = originalBase
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  let n = parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join('') || 'Icon';
  if (/^\d/.test(n)) n = '_' + n;
  return `Svg${n}`;
}

function importVarNameFromSafeBase(safeBase: string): string {
  return `Icon_${safeBase}`;
}

/**
 * 将 SVG 中所有 fill / stroke 属性统一为 currentColor（便于用 CSS color 控制），
 * 保留 fill="none" / stroke="none" 不变。
 * 仅处理属性形式（fill="…" / stroke="…"），不处理 style 内联（避免 url(#id) 中的 } 破坏结构）。
 */
function normalizeSvgFillStroke(svg: string): string {
  return svg
    .replace(/\bfill=(["'])(?!none\1)(?:\\.|(?!\1).)*\1/gi, 'fill="currentColor"')
    .replace(/\bstroke=(["'])(?!none\1)(?:\\.|(?!\1).)*\1/gi, 'stroke="currentColor"');
}

// ==================== 主流程 ====================
async function main(): Promise<void> {
  const entries = await fs.readdir(svgSourceDir, { withFileTypes: true });
  const svgFiles = entries
    .filter((e) => e.isFile() && e.name.toLowerCase().endsWith('.svg'))
    .map((e) => e.name)
    .sort((a, b) => a.localeCompare(b));

  if (svgFiles.length === 0) {
    console.log(chalk.yellow('⚠️ source 目录下没有 .svg 文件'));
    return;
  }

  await fs.mkdir(svgGeneratedDir, { recursive: true });

  // 清理旧产物（仅删除脚本生成的 .tsx 和 index.ts）
  const existing = await fs.readdir(svgGeneratedDir).catch(() => []);
  for (const f of existing) {
    if (f.endsWith('.tsx') || f === 'index.ts') {
      await fs.rm(path.join(svgGeneratedDir, f), { force: true });
    }
  }

  const prettierConfig = (await prettier.resolveConfig(ROOT)) ?? {};
  const formatOpts = { ...prettierConfig, parser: 'typescript' as const };

  const pathNames: string[] = [];
  const generatedImports: string[] = [];
  const generatedEntries: string[] = [];

  for (const file of svgFiles) {
    const originalBase = file.replace(/\.svg$/i, '');
    const safeBase = safeFileBase(originalBase);
    const compName = componentNameFromOriginal(originalBase);
    const varName = importVarNameFromSafeBase(safeBase);

    pathNames.push(originalBase);

    const svgPath = path.join(svgSourceDir, file);
    const tsxPath = path.join(svgGeneratedDir, `${safeBase}.tsx`);
    const rawSvg = await fs.readFile(svgPath, 'utf8');
    const svgCode = normalizeSvgFillStroke(rawSvg);

    const tsxCode = await transform(
      svgCode,
      {
        typescript: true,
        icon: true,
        prettier: false,
        expandProps: 'end',
        plugins: [svgo, jsx],
        svgoConfig: {
          plugins: [
            { name: 'removeViewBox', active: false },
            { name: 'removeDimensions', active: true },
          ] as any,
        },
        jsxRuntime: 'automatic',
      },
      { componentName: compName },
    );

    const formatted = await prettier.format(tsxCode, formatOpts);
    await fs.writeFile(tsxPath, formatted, 'utf8');

    generatedImports.push(`import ${varName} from './${safeBase}';`);
    generatedEntries.push(`  ${JSON.stringify(originalBase)}: ${varName},`);
  }

  // 1) svgPath_all.ts
  const timestamp = new Date().toISOString();
  const svgPathAllContent = `
// ⚠️ 此文件由脚本自动生成，请勿手动修改
// 生成时间: ${timestamp}

export const SVG_PATH_NAMES = [
  ${pathNames.map((n) => `"${n}"`).join(',\n  ')}
] as const;

export type SvgPathName = (typeof SVG_PATH_NAMES)[number];
`;
  await fs.mkdir(path.dirname(svgPathsOutputFile), { recursive: true });
  await fs.writeFile(
    svgPathsOutputFile,
    await prettier.format(svgPathAllContent, formatOpts),
    'utf8',
  );

  // 2) generated/index.ts
  const generatedIndexContent = `
// ⚠️ 此文件由脚本自动生成，请勿手动修改
// 生成时间: ${timestamp}

import type React from 'react';
import type { SvgPathName } from '@/components/ui/Icon/svgPath_all';

${generatedImports.join('\n')}

const iconMap = {
${generatedEntries.join('\n')}
} satisfies Record<SvgPathName, React.ComponentType<React.SVGProps<SVGSVGElement>>>;

export default iconMap;
`;
  await fs.writeFile(
    path.join(svgGeneratedDir, 'index.ts'),
    await prettier.format(generatedIndexContent, formatOpts),
    'utf8',
  );

  console.log(
    chalk.green(`✔️ 已生成 ${chalk.yellow(svgPathsOutputFile)}，共 ${pathNames.length} 个图标`),
  );
  console.log(
    chalk.green(
      `✔️ 已生成 ${chalk.yellow(svgGeneratedDir)} 下 ${pathNames.length} 个 .tsx 与 index.ts`,
    ),
  );
}

main().catch((err) => {
  console.error(chalk.red('❌ 生成失败:'), err);
  process.exit(1);
});
