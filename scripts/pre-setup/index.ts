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
    setupLcpElement();
    setupEnv();
    setupImageManifest();
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

/**
 * 设置 LCP 元素
 */
function setupLcpElement() {
  const logoPath = path.resolve(ROOT, `public/images/brands/${app}/logo.png`);
  const logoOutputPath = path.resolve(ROOT, 'src/generated/lcp-b64.ts');
  const base64 = fs.readFileSync(logoPath, 'base64');
  const fileContent = `export const lcpB64 = "data:image/png;base64,${base64}";\n`;
  fs.writeFileSync(logoOutputPath, fileContent);
  console.log('✅ LCP 元素已解析 >>> src/generated/lcp-b64.ts');
}

/**
 * 设置 APP 版本
 */
function setupEnv() {
  const envOutputFile = path.resolve(ROOT, '.env');

  const timestamp = new Date().getTime();
  const timestampStr = new Date(timestamp).toISOString().slice(0, 19).replace('T', '_');
  const version = `v_${app}_${timestampStr}`;
  const envContent = `# === 自动生成，请勿手动修改 ===
NEXT_PUBLIC_APP_VERSION=${version}
`;

  fs.writeFileSync(envOutputFile, envContent, 'utf8');

  console.log('✅ 环境变量已写入 >>> .env');
}

/**
 * 设置 image-manifest
 */
function setupImageManifest() {
  const IMAGE_ROOT = path.join(ROOT, 'public/images/cdn-imgs');
  const OUTPUT = path.join(ROOT, 'src/generated/image-manifest.ts');

  type SparseManifest = Record<
    string, // theme-skin
    Record<
      string, // brand
      string[] // 品牌覆盖文件
    >
  >;

  const manifest: SparseManifest = {};

  // ===== UTIL =====
  function walkFiles(dir: string, base = dir): string[] {
    if (!fs.existsSync(dir)) return [];

    const result: string[] = [];
    for (const entry of fs.readdirSync(dir).sort()) {
      if (entry.startsWith('.') || entry === 'Thumbs.db') continue;
      const full = path.join(dir, entry);
      const stat = fs.statSync(full);

      if (stat.isDirectory()) {
        result.push(...walkFiles(full, base));
      } else if (stat.isFile()) {
        result.push(path.relative(base, full).replace(/\\/g, '/'));
      }
    }
    return result;
  }

  // ===== BUILD SPARSE MANIFEST =====
  for (const themeSkin of fs.readdirSync(IMAGE_ROOT).sort()) {
    if (themeSkin === 'general') continue;

    const skinPath = path.join(IMAGE_ROOT, themeSkin);
    if (!fs.statSync(skinPath).isDirectory()) continue;

    manifest[themeSkin] = {};

    const brands = fs
      .readdirSync(skinPath)
      .sort()
      .filter((b) => b !== 'common' && !b.startsWith('.'));

    for (const brand of brands) {
      const brandPath = path.join(skinPath, brand);
      const brandFiles = walkFiles(brandPath);

      // 只存品牌实际覆盖的文件，不包含 common
      if (brandFiles.length > 0) {
        manifest[themeSkin][brand] = brandFiles.sort();
      } else {
        manifest[themeSkin][brand] = [];
      }
    }
  }

  // ===== ENSURE OUTPUT DIR =====
  const GENERATED_DIR = path.dirname(OUTPUT);
  if (!fs.existsSync(GENERATED_DIR)) {
    fs.mkdirSync(GENERATED_DIR, { recursive: true });
  }

  // ===== WRITE =====
  const output = `// === 自动生成，请勿手动修改 ===
export const imageManifest = ${JSON.stringify(manifest, null, 2)} as const;
`;

  fs.writeFileSync(OUTPUT, output);

  console.log('✅ 已生成图片 manifest 文件 >>> src/generated/image-manifest.ts');
}
