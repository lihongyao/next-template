import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

import { BrandConfig } from '@/configs/brands/types';

const app = process.env.app;
const env = process.env.env;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SCRIPT_NAME = 'scripts/pre-setup/index.ts';
const ROOT = path.resolve(__dirname, '../../');

console.log('app:', app);
console.log('env:', env);
console.log('正在处理预构建内容 ...');
console.log('process.env.NEXT_PUBLIC_BRAND >> :', process.env.NEXT_PUBLIC_BRAND);

(async function main() {
  try {
    const brandConfig = await getBrandConfig();
    setupBrandConfig();
    setupBrandCssImports(brandConfig);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();

/**
 * 获取品牌配置
 * @returns
 */
async function getBrandConfig() {
  const brandsIndexPath = path.join(ROOT, '/src/configs/brands/index.ts');
  try {
    const mod = await import(brandsIndexPath);
    return mod.default as BrandConfig;
  } catch (err) {
    console.error(`❌ 加载品牌配置失败: ${brandsIndexPath}`);
    throw err;
  }
}
/**
 * 设置品牌配置
 */
function setupBrandConfig() {
  const brandsIndexPath = path.join(ROOT, '/src/configs/brands/index.ts');
  const brandsDir = path.dirname(brandsIndexPath);
  const brandFilePath = path.join(brandsDir, `${app}.ts`);

  if (!fs.existsSync(brandFilePath)) {
    throw new Error(`[pre-setup] 品牌配置不存在: src/configs/brands/${app}.ts，请先添加该文件`);
  }
  const generatedAt = new Date().toISOString();
  const fileContent = `// 该文件由 ${SCRIPT_NAME} 脚本生成，请勿手动修改
// 生成时间: ${generatedAt}
export { default } from './${app}';`;

  fs.writeFileSync(brandsIndexPath, fileContent, 'utf-8');

  console.log('✅ 品牌配置已设置 >>> src/configs/brands/index.ts -> export from %s', app);
}

function setupBrandCssImports(brandConfig: BrandConfig) {
  const generatedAt = new Date().toISOString();
  // 判断是否存在样式覆盖文件
  const overridesFile = path.resolve(ROOT, `src/assets/styles/overrides/${app}.css`);
  const isOverridesExist = fs.existsSync(overridesFile);

  const brandCssContent = `/**
* 该文件由 ${SCRIPT_NAME} 自动生成，请勿手动修改
*  
* 品牌: ${app}
* 环境: ${env}
* 生成时间: ${generatedAt}
*/

import "../assets/styles/core/index.css";
import "../assets/styles/themes/${brandConfig.theme}.css";
import "../assets/styles/skins/${brandConfig.skin}.css";
${isOverridesExist ? `import "../assets/styles/overrides/${app}.css";` : ''}
`;

  const generatedDir = path.resolve(ROOT, 'src/generated');

  if (!fs.existsSync(generatedDir)) fs.mkdirSync(generatedDir, { recursive: true });

  const brandCssFilePath = path.resolve(generatedDir, 'brand.css.ts');
  fs.writeFileSync(brandCssFilePath, brandCssContent, 'utf8');
  console.log('✅ 品牌样式已设置 >>> src/generated/brand.css.ts');
}
