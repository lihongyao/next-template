// === 将 sprite.svg sprite-svg.tsx 转成 ===
import { transform } from '@svgr/core';
import jsx from '@svgr/plugin-jsx';
import svgo from '@svgr/plugin-svgo';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import prettier from 'prettier';

function normalizeSvgFillStroke(svg: string): string {
  return svg
    .replace(/\bfill=(["'])(?!none\1)(?:\\.|(?!\1).)*\1/gi, 'fill="currentColor"')
    .replace(/\bstroke=(["'])(?!none\1)(?:\\.|(?!\1).)*\1/gi, 'stroke="currentColor"');
}

// === 路径与目录解析 ===
// 当前文件路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 项目根目录
const ROOT_DIR = path.resolve(__dirname, '../../');

const prettierConfig = (await prettier.resolveConfig(ROOT_DIR)) ?? {};
const formatOpts = { ...prettierConfig, parser: 'typescript' as const };
const spriteSvgPath = path.resolve(ROOT_DIR, 'public/sprite.svg');
const spriteTsxPath = path.resolve(ROOT_DIR, 'src/generated/sprite-svg.tsx');
if (!fs.existsSync(spriteSvgPath)) {
  console.warn(`找不到 sprite.svg，跳过生成: ${spriteSvgPath}`);
  process.exit(0);
}
const rawSvg = await fs.promises.readFile(spriteSvgPath, 'utf8');
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
  { componentName: 'SpriteSvgSource' },
);
const formatted = await prettier.format(tsxCode, formatOpts);
await fs.promises.writeFile(spriteTsxPath, formatted, 'utf8');
console.log('sprite-svg.tsx 已生成');
