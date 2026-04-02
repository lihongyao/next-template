/**
 * 读取 public/icons/component 和 public/icons/lazy中的SVG文件，转为 React组件并写入 src/generated/icons 中
 */
import { transform } from '@svgr/core';
import jsx from '@svgr/plugin-jsx';
import svgo from '@svgr/plugin-svgo';
import fs from 'node:fs';
import fsPromises from 'node:fs/promises';
import path from 'node:path';

import {
  CONSTANTS_OUTPUT_PATH_FOR_COMPONENT,
  CONSTANTS_OUTPUT_PATH_FOR_LAZY,
  ICON_MAP_OUTPUT_PATH,
} from './config';

const root = process.cwd();
const srcDir = path.join(root, 'public/icons');
const componentDir = path.join(srcDir, 'component');
const lazyDir = path.join(srcDir, 'lazy');
const outDir = path.join(root, 'src/generated/icons');

export async function genIcons() {
  // 确保输出目录存在
  await fsPromises.mkdir(outDir, { recursive: true });

  // 清理旧文件：只清理我们生成的 .tsx 和 iconMap.ts
  if (fs.existsSync(outDir)) {
    const files = await fsPromises.readdir(outDir);
    for (const f of files) {
      if (f.endsWith('.tsx') || f === 'iconMap.ts') {
        await fsPromises.rm(path.join(outDir, f), { force: true });
      }
    }
  }

  // 递归获取 SVG（同步 + 异步兼容，更稳）
  function getSvgFiles(dir: string): string[] {
    if (!fs.existsSync(dir)) return [];

    let results: string[] = [];
    const list = fs.readdirSync(dir, { withFileTypes: true });

    for (const item of list) {
      const fullPath = path.join(dir, item.name);
      if (item.isDirectory()) {
        results = results.concat(getSvgFiles(fullPath));
      } else if (item.isFile() && item.name.toLowerCase().endsWith('.svg')) {
        results.push(fullPath);
      }
    }
    return results;
  }

  // ==================== 收集两类图标 ====================
  const componentFileList = getSvgFiles(componentDir);
  const lazyFileList = getSvgFiles(lazyDir);

  const iconComponentNames = componentFileList.map((f) => path.basename(f, '.svg')).sort();
  const iconLazyNames = lazyFileList.map((f) => path.basename(f, '.svg')).sort();

  // ==================== 输出常量文件 ====================
  const constantTemplate = (name: string, list: string[]) => {
    const typeName = name === 'iconLazyNames' ? 'IconLazyName' : 'IconComponentName';
    return `/* eslint-disable prettier/prettier */
/* ⚠️ 自动生成 - 勿手动修改！👉 可执行 pnpm run gen-svg 重新生成 */
export const ${name} = [
${list.map((n) => `  "${n}",`).join('\n')}
] as const;

export type ${typeName} = (typeof ${name})[number];
`;
  };

  await fsPromises.writeFile(
    CONSTANTS_OUTPUT_PATH_FOR_COMPONENT,
    constantTemplate('iconComponentNames', iconComponentNames),
    'utf8',
  );

  await fsPromises.writeFile(
    CONSTANTS_OUTPUT_PATH_FOR_LAZY,
    constantTemplate('iconLazyNames', iconLazyNames),
    'utf8',
  );

  // ==================== 合并所有图标 ====================
  const allSvgFiles = [...componentFileList, ...lazyFileList].sort();
  const svgFiles = allSvgFiles.map((file) => path.relative(srcDir, file));

  // ==================== 工具函数 ====================
  function safeFileBase(originalBase: string) {
    const plainName = path.basename(originalBase);
    let s = plainName.replace(/[^a-zA-Z0-9_]/g, '_');
    if (/^\d/.test(s)) s = '_' + s;
    return s;
  }

  function componentNameFromOriginal(originalBase: string) {
    const plainName = path.basename(originalBase);
    const parts = plainName
      .replace(/[^a-zA-Z0-9]+/g, ' ')
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    let n = parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join('') || 'Icon';
    if (/^\d/.test(n)) n = '_' + n;
    return `Svg${n}`;
  }

  function importVarNameFromSafeBase(safeBase: string) {
    return `Icon_${safeBase}`;
  }

  // ==================== 批量生成 SVG 组件 ====================
  const imports: string[] = [];
  const entries: string[] = [];

  for (const relativePath of svgFiles) {
    const originalBase = relativePath.replace(/\.svg$/i, '');
    const svgName = originalBase.split('/').pop()!; // 永远取最后一段，最稳定
    const safeBase = safeFileBase(originalBase);
    const compName = componentNameFromOriginal(originalBase);
    const varName = importVarNameFromSafeBase(safeBase);

    const svgPath = path.join(srcDir, relativePath);
    const tsxPath = path.join(outDir, `${safeBase}.tsx`);

    const svgCode = fs.readFileSync(svgPath, 'utf8');

    const tsxCode = await transform(
      svgCode,
      {
        typescript: true,
        icon: true,
        prettier: false,
        expandProps: 'end',
        plugins: [svgo, jsx],
        svgoConfig: {
          plugins: ['removeDimensions', { name: 'removeViewBox', active: false }],
        },
        jsxRuntime: 'automatic',
        replaceAttrValues: {
          '#000': 'currentColor',
          white: 'currentColor',
          '#000000': 'currentColor',
          '#fff': 'currentColor',
          '#ffffff': 'currentColor',
          '#b3b8c1': 'currentColor',
          '#B3B8C1': 'currentColor',
          '#31ED87': 'currentColor',
          '#181C19': 'currentColor',
          '#8C928F': 'currentColor',
          '#FF0000': 'currentColor',
          '#FC0048': 'currentColor',
          '#F3DF00': 'currentColor',
          '#2DEE88': 'currentColor',
          '#FF7300': 'currentColor',
          '#FFC271': 'currentColor',
        },
      } as any,
      { componentName: compName },
    );

    await fsPromises.writeFile(tsxPath, tsxCode, 'utf8');

    imports.push(`import ${varName} from "./icons/${safeBase}";`);
    entries.push(`  ${JSON.stringify(svgName)}: ${varName},`);
  }

  // ==================== 生成 iconMap.ts ====================
  const mapTs = `// ⚠️ Auto-generated. Do not edit.
// Generated at: ${new Date().toISOString()}

import type React from "react";
import type { SvgPathName } from "@/components/ui";

${imports.join('\n')}

export const iconMap = {
${entries.join('\n')}
} satisfies Record<SvgPathName, React.ComponentType<React.SVGProps<SVGSVGElement>>>;

export default iconMap;
`;

  await fsPromises.writeFile(ICON_MAP_OUTPUT_PATH, mapTs, 'utf8');

  console.log('✅ SVG 转换完成');
}
