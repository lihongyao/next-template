// gen-svg 入口：负责串起 sprite、svgr、类型和注册表的整条生成链路。
// 安装依赖：pnpm add tsx @neodx/svg @svgr/core @svgr/plugin-jsx prettier svgo @trivago/prettier-plugin-sort-imports prettier-plugin-tailwindcss --save-dev
import { generateSvgrComponents } from './gen-icons.js';
import { generateSvgTypesAndRegistry } from './gen-svg-types.js';
import { generateInlineSpriteTsx } from './generate-inline-sprite.js';
import { generateSpriteSvg } from './generate-sprite.js';

async function main() {
  // 顺序不要改：先拿到 sprite 文件名，再写入 registry，Icon 才能引用到最新 hash 路径。
  console.log('⌛️ 开始生成 SVG 资源...');

  const spriteBuildResult = await generateSpriteSvg();
  console.log(
    `✅ sprite 完成，critical ${spriteBuildResult.critical.spriteNames.length} 个（source/sprites/critical），输出 ${spriteBuildResult.critical.publicSpriteFile}；normal ${spriteBuildResult.normal.spriteNames.length} 个（source/sprites/normal），输出 ${spriteBuildResult.normal.publicSpriteFile}`,
  );
  await generateInlineSpriteTsx(spriteBuildResult.critical.publicSpriteFile);
  console.log('✅ inline sprite 组件完成');

  const { names: svgrNames, stats: svgrStats } = await generateSvgrComponents();
  console.log(
    `✅ svgr 完成，共 ${svgrNames.length} 个（source/svgrs），新增 ${svgrStats.created.length}，保留已编辑 ${svgrStats.skipped.length}，删除 ${svgrStats.removed.length}`,
  );

  await generateSvgTypesAndRegistry({
    criticalSpriteNames: spriteBuildResult.critical.spriteNames,
    criticalSpriteFile: spriteBuildResult.critical.publicSpriteFile,
    normalSpriteNames: spriteBuildResult.normal.spriteNames,
    normalSpriteFile: spriteBuildResult.normal.publicSpriteFile,
    svgrNames,
  });
  console.log('✅ 类型与注册表完成');

  console.log('🎉 SVG 构建完成');
}

main().catch((err) => {
  console.error('❌ 生成失败：', err);
  process.exit(1);
});
