import * as fs from 'node:fs';
import * as path from 'node:path';

const app = process.env.app;
const env = process.env.env;
const SCRIPT_NAME = 'scripts/pre-setup/index.ts';

console.log('pre-setup app:', app);
console.log('pre-setup env:', env);
console.log('pre-setup ...');
console.log('process.env.NEXT_PUBLIC_BRAND >> :', process.env.NEXT_PUBLIC_BRAND);

(async function main() {
  try {
    setupBrandConfig();
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();

/**
 * 设置品牌配置
 */
function setupBrandConfig() {
  const BRANDS_INDEX_PATH = path.join(process.cwd(), 'src/configs/brands/index.ts');
  const brandsDir = path.dirname(BRANDS_INDEX_PATH);
  const brandFile = path.join(brandsDir, `${app}.ts`);

  if (!fs.existsSync(brandFile)) {
    throw new Error(`[pre-setup] 品牌配置不存在: src/configs/brands/${app}.ts，请先添加该文件`);
  }
  const fileContent = `// 该文件由 ${SCRIPT_NAME} 脚本生成，请勿手动修改 
  export { default } from './${app}';`;

  fs.writeFileSync(BRANDS_INDEX_PATH, fileContent, 'utf-8');

  console.log('[pre-setup] 已写入 src/configs/brands/index.ts -> export from %s', app);
}
