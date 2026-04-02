/**
 * 对 public/icons/sprite 目录中的所有SVG文件处理后，将SVG中内容的定义合并到sprite.svg文件中
 */
import glob from 'fast-glob';
import fs from 'fs-extra';
import path from 'path';
import SVGSpriter from 'svg-sprite';

import { CONSTANTS_OUTPUT_PATH_FOR_SPRITE, OUT_DIR, SPRITE_OUTPUT_FILE, SRC_DIR } from './config';
import { optimizeSvgContent } from './optimize-svgo.js';

export async function generateSvgSprite() {
  // 扫描 SVG
  const svgFiles = await glob('**/*.svg', { cwd: SRC_DIR, absolute: true });
  if (svgFiles.length === 0) {
    console.log('⚠️ 没有找到 SVG 文件');
    return;
  }
  console.log(`🔍 找到 ${svgFiles.length} 个 SVG`);

  const iconSpriteNames = svgFiles.map((file) => {
    // 获取不带后缀的文件名（如 home.svg → home）
    return path.basename(file, '.svg');
  });
  // 去重并排序（可选）
  const uniqueNames = [...new Set(iconSpriteNames)].sort();

  // console.log("📋 图标名称列表：", JSON.stringify(uniqueNames));

  const spriter = new SVGSpriter({
    mode: {
      symbol: {
        dest: '.',
        sprite: 'sprite.svg',
        example: true, // 是否生成预览文件
      },
    },
    shape: {
      id: {
        generator: (name: string) => `icon-${path.basename(name, '.svg')}`,
      },
    },
  });

  // 读取 & 优化 SVG
  for (const file of svgFiles) {
    const content = await fs.readFile(file, 'utf8');
    const optimized = await optimizeSvgContent(content, file);
    spriter.add(file, path.basename(file), optimized);
  }

  // 编译生成
  const result = await new Promise<any>((resolve, reject) => {
    spriter.compile((err: any, res: any) => {
      if (err) reject(err);
      else resolve(res);
    });
  });

  // 写入文件
  await fs.ensureDir(OUT_DIR);
  await fs.writeFile(SPRITE_OUTPUT_FILE, result.symbol.sprite.contents, 'utf8');

  if (result.symbol.example) {
    const examplePath = path.join(OUT_DIR, 'sprite-example.html');
    await fs.writeFile(examplePath, result.symbol.example.contents, 'utf8');
  }

  await fs.ensureDir(path.dirname(CONSTANTS_OUTPUT_PATH_FOR_SPRITE));
  // 生成 TypeScript 代码
  const tsContent = `/* eslint-disable prettier/prettier */
/* ⚠️ 自动生成 - 勿手动修改！👉 可执行 pnpm run svg 重新生成 */

export const iconSpriteNames = ${JSON.stringify(uniqueNames, null, 2)} as const;

// 图标名称类型
export type SpriteName = (typeof iconSpriteNames)[number];
`;

  await fs.writeFile(CONSTANTS_OUTPUT_PATH_FOR_SPRITE, tsContent, 'utf8');

  console.log('✅ SVG 精灵图生成完成：src/generated/sprite.svg');
}
