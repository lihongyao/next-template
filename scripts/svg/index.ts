import { genIcons } from './gen-icons.js';
import { genSvgTypes } from './gen-svg-types.js';
import { generateSvgSprite } from './generate-sprite.js';

/**
 * 1. 脚本 gen-svg-types.ts：生成 svgPath_all.ts
 * 2. React类：脚本 gen-icons.ts：svg 转 React组件 👉 范围：public/icons/component + public/icons/lazy
 * 3. Sprite类：脚本 optimize-svgo.ts：对SVG文件进行格式化与压缩 👉 范围：public/icons/sprite
 * 4. Sprite类：脚本 generate-sprite.ts：汇总sprite中SVG，生成 sprite.svg 👉 范围：public/icons/sprite
 */

async function run() {
  console.log('🚀 开始生成 SVG Sprite...');
  await generateSvgSprite();
  await genSvgTypes();
  await genIcons();
  console.log('🎉 全部完成！');
}

run().catch((err) => {
  console.error('❌ 生成失败：', err);
  process.exit(1);
});
