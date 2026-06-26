import fs from 'node:fs/promises';
import path from 'node:path';
import prettier from 'prettier';

import { ICON_REGISTRY_OUTPUT_FILE, SVG_TYPES_OUTPUT_FILE } from './config.js';
import { safeFileBase } from './utils.js';

export type SvgRegistryInput = {
  criticalSpriteNames: string[];
  normalSpriteNames: string[];
  svgrNames: string[];
  criticalSpriteFile: string;
  normalSpriteFile: string;
};

function assertNoDuplicatedNames(
  criticalSpriteNames: string[],
  normalSpriteNames: string[],
  svgrNames: string[],
) {
  const allSpriteNames = [...criticalSpriteNames, ...normalSpriteNames];
  const spriteSet = new Set(allSpriteNames);
  const duplicatedSprites = allSpriteNames.filter(
    (name, index) => allSpriteNames.indexOf(name) !== index,
  );
  if (duplicatedSprites.length > 0) {
    throw new Error(
      `critical sprites 与 normal sprites 存在同名图标：${[...new Set(duplicatedSprites)].join(', ')}。请重命名后重试。`,
    );
  }

  const duplicated = svgrNames.filter((name) => spriteSet.has(name)).sort();
  if (duplicated.length > 0) {
    // 同名会导致 name 无法判断走 sprite 还是 svgr，直接中断更安全。
    throw new Error(
      `sprites 与 svgrs 存在同名图标，无法确定渲染来源：${duplicated.join(', ')}。请重命名后重试。`,
    );
  }
}

export async function generateSvgTypesAndRegistry(input: SvgRegistryInput): Promise<void> {
  const { criticalSpriteNames, normalSpriteNames, svgrNames } = input;
  assertNoDuplicatedNames(criticalSpriteNames, normalSpriteNames, svgrNames);

  // 类型文件和注册表都按各自输出路径取 prettier 配置，避免格式漂移。
  const typePrettierConfig = (await prettier.resolveConfig(SVG_TYPES_OUTPUT_FILE)) ?? {};
  const allSpriteNames = [...criticalSpriteNames, ...normalSpriteNames];
  const allNames = [...allSpriteNames, ...svgrNames].sort((a, b) => a.localeCompare(b));

  const typeOutput = `
// ⚠️ 此文件由脚本自动生成，请勿手动修改

export const SVG_PATH_NAMES = [
  ${allNames.map((name) => `'${name}'`).join(',\n  ')}
] as const;

export type SvgPathName = (typeof SVG_PATH_NAMES)[number];
`;

  await fs.mkdir(path.dirname(SVG_TYPES_OUTPUT_FILE), { recursive: true });
  await fs.writeFile(
    SVG_TYPES_OUTPUT_FILE,
    await prettier.format(typeOutput, { ...typePrettierConfig, parser: 'typescript' }),
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
  const spriteEntries = allSpriteNames.map((name) => `  '${name}': 'icon-${name}',`);
  const spriteFileEntries = [
    ...criticalSpriteNames.map((name) => `  '${name}': '${input.criticalSpriteFile}',`),
    ...normalSpriteNames.map((name) => `  '${name}': '${input.normalSpriteFile}',`),
  ];

  const registryPrettierConfig = (await prettier.resolveConfig(ICON_REGISTRY_OUTPUT_FILE)) ?? {};

  const registryOutput = `
// ⚠️ 此文件由脚本自动生成，请勿手动修改
import type React from 'react';

// 业务统一从 generated/index.ts 取类型，不再直接摸 svgPath_all.ts。
export { SVG_PATH_NAMES } from './svgPath_all';
export type { SvgPathName } from './svgPath_all';

import type { SvgPathName } from './svgPath_all';

${imports.join('\n')}

export const SVG_COMPONENT_MAP = {
${componentEntries.join('\n')}
} as const satisfies Partial<Record<SvgPathName, React.ComponentType<React.SVGProps<SVGSVGElement>>>>;

export const SVG_SPRITE_ID_MAP = {
${spriteEntries.join('\n')}
} as const satisfies Partial<Record<SvgPathName, string>>;

export const SVG_SPRITE_FILE_MAP = {
${spriteFileEntries.join('\n')}
} as const satisfies Partial<Record<SvgPathName, string>>;

export const SVG_ICON_KIND_MAP = {
${allNames
  .map((name) => {
    if (criticalSpriteNames.includes(name)) return `  '${name}': 'sprite-inline',`;
    if (normalSpriteNames.includes(name)) return `  '${name}': 'sprite-external',`;
    return `  '${name}': 'svgr',`;
  })
  .join('\n')}
} as const satisfies Record<SvgPathName, 'sprite-inline' | 'sprite-external' | 'svgr'>;
`;

  // registry 由脚本统一产出，UI 层只读这个文件，不在业务代码里手写映射。
  await fs.writeFile(
    ICON_REGISTRY_OUTPUT_FILE,
    await prettier.format(registryOutput, { ...registryPrettierConfig, parser: 'typescript' }),
    'utf8',
  );
}
