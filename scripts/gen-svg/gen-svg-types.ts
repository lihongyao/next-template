import fs from 'node:fs/promises';
import path from 'node:path';
import prettier from 'prettier';

import { ICON_REGISTRY_OUTPUT_FILE, ROOT_DIR, SVG_TYPES_OUTPUT_FILE } from './config.js';
import { safeFileBase } from './utils.js';

export type SvgRegistryInput = {
  spriteNames: string[];
  svgrNames: string[];
  publicSpriteFile: string;
};

function assertNoDuplicatedNames(spriteNames: string[], svgrNames: string[]) {
  const spriteSet = new Set(spriteNames);
  const duplicated = svgrNames.filter((name) => spriteSet.has(name)).sort();
  if (duplicated.length > 0) {
    throw new Error(
      `sprites 与 svgrs 存在同名图标，无法确定渲染来源：${duplicated.join(', ')}。请重命名后重试。`,
    );
  }
}

export async function generateSvgTypesAndRegistry(input: SvgRegistryInput): Promise<void> {
  const { spriteNames, svgrNames } = input;
  assertNoDuplicatedNames(spriteNames, svgrNames);

  const prettierConfig = (await prettier.resolveConfig(ROOT_DIR)) ?? {};
  const allNames = [...spriteNames, ...svgrNames].sort((a, b) => a.localeCompare(b));
  const timestamp = new Date().toISOString();

  const typeOutput = `
// ⚠️ 此文件由脚本自动生成，请勿手动修改
// 生成时间: ${timestamp}

export const SVG_PATH_NAMES = [
  ${allNames.map((name) => `'${name}'`).join(',\n  ')}
] as const;

export type SvgPathName = (typeof SVG_PATH_NAMES)[number];
`;

  await fs.mkdir(path.dirname(SVG_TYPES_OUTPUT_FILE), { recursive: true });
  await fs.writeFile(
    SVG_TYPES_OUTPUT_FILE,
    await prettier.format(typeOutput, { ...prettierConfig, parser: 'typescript' }),
    'utf8',
  );

  const imports = svgrNames.map((name) => {
    const fileName = safeFileBase(name);
    return `import Icon_${fileName} from './${fileName}';`;
  });

  const componentEntries = svgrNames.map((name) => {
    const fileName = safeFileBase(name);
    return `  '${name}': Icon_${fileName},`;
  });
  const spriteEntries = spriteNames.map((name) => `  '${name}': 'icon-${name}',`);

  const registryOutput = `
// ⚠️ 此文件由脚本自动生成，请勿手动修改
// 生成时间: ${timestamp}
import type React from 'react';

import type { SvgPathName } from '@/components/ui/Icon/svgPath_all';

${imports.join('\n')}

export const SVG_COMPONENT_MAP = {
${componentEntries.join('\n')}
} as const satisfies Partial<Record<SvgPathName, React.ComponentType<React.SVGProps<SVGSVGElement>>>>;

export const SVG_SPRITE_ID_MAP = {
${spriteEntries.join('\n')}
} as const satisfies Partial<Record<SvgPathName, string>>;

export const SVG_ICON_KIND_MAP = {
${allNames
  .map((name) => `  '${name}': ${spriteNames.includes(name) ? "'sprite'" : "'svgr'"},`)
  .join('\n')}
} as const satisfies Record<SvgPathName, 'sprite' | 'svgr'>;

export const SVG_SPRITE_FILE = '${input.publicSpriteFile}';
`;

  await fs.writeFile(
    ICON_REGISTRY_OUTPUT_FILE,
    await prettier.format(registryOutput, { ...prettierConfig, parser: 'typescript' }),
    'utf8',
  );
}
