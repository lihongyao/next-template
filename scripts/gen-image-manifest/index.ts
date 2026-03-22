import fs from 'fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.resolve(__dirname, '../../');
const IMAGE_ROOT = path.join(ROOT, 'public/images/cdn-imgs');
const OUTPUT = path.join(ROOT, 'src/generated/image-manifest.ts');
const BRANDS_ROOT = path.join(ROOT, 'src/configs/brands');

type SparseManifest = Record<
  string, // theme-skin
  Record<
    string, // brand
    string[] // 仅存品牌实际覆盖文件
  >
>;

const manifest: SparseManifest = {};

function getKnownBrands(): string[] {
  if (!fs.existsSync(BRANDS_ROOT)) return [];
  return fs
    .readdirSync(BRANDS_ROOT)
    .sort()
    .filter((name) => name.endsWith('.ts'))
    .map((name) => name.replace(/\.ts$/, ''))
    .filter((name) => name !== 'index' && name !== 'types');
}

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

if (!fs.existsSync(IMAGE_ROOT)) {
  throw new Error(`[gen-image-manifest] IMAGE_ROOT not found: ${IMAGE_ROOT}`);
}

const knownBrands = getKnownBrands();

// ===== BUILD SPARSE MANIFEST =====
for (const themeSkin of fs.readdirSync(IMAGE_ROOT).sort()) {
  if (themeSkin === 'general' || themeSkin.startsWith('.')) continue;

  const skinPath = path.join(IMAGE_ROOT, themeSkin);
  if (!fs.statSync(skinPath).isDirectory()) continue;

  manifest[themeSkin] = {};

  const brandsFromFiles = fs
    .readdirSync(skinPath)
    .sort()
    .filter((b) => b !== 'common' && !b.startsWith('.'));
  const brands = Array.from(new Set([...knownBrands, ...brandsFromFiles])).sort();

  for (const brand of brands) {
    const brandPath = path.join(skinPath, brand);
    const brandFiles = fs.existsSync(brandPath) ? walkFiles(brandPath) : [];

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

console.log('✅ Sparse image manifest generated');
