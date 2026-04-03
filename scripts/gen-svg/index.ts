import { generateSvgrComponents } from './gen-icons.js';
import { generateSvgTypesAndRegistry } from './gen-svg-types.js';
import { generateSpriteSvg } from './generate-sprite.js';

async function main() {
  console.log('⌛️ 开始生成 SVG 资源...');

  const spriteBuildResult = await generateSpriteSvg();
  console.log(
    `✅ sprite 完成，共 ${spriteBuildResult.spriteNames.length} 个（source/sprites），输出 ${spriteBuildResult.publicSpriteFile}`,
  );

  const svgrNames = await generateSvgrComponents();
  console.log(`✅ svgr 完成，共 ${svgrNames.length} 个（source/svgrs）`);

  await generateSvgTypesAndRegistry({
    spriteNames: spriteBuildResult.spriteNames,
    svgrNames,
    publicSpriteFile: spriteBuildResult.publicSpriteFile,
  });
  console.log('✅ 类型与注册表完成');

  console.log('🎉 SVG 构建完成');
}

main().catch((err) => {
  console.error('❌ 生成失败：', err);
  process.exit(1);
});
