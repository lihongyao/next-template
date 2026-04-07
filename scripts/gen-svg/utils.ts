import fs from 'node:fs/promises';
import path from 'node:path';

export function safeFileBase(originalBase: string): string {
  // 文件名要能直接当 ts 文件名和 import 变量的一部分用。
  const normalized = originalBase.replace(/\\/g, '/');
  let safeName = normalized.replace(/[^a-zA-Z0-9_]/g, '_');
  if (/^\d/.test(safeName)) safeName = `_${safeName}`;
  return safeName;
}

export function componentNameFromOriginal(originalBase: string): string {
  // 组件名按 PascalCase 生成，保持和 SVGR 产物命名一致。
  const normalized = originalBase.replace(/\\/g, '/');
  const name = normalized.split('/').pop() ?? normalized;
  const parts = name
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  let composed = parts.map((part) => `${part[0]?.toUpperCase()}${part.slice(1)}`).join('');
  if (!composed) composed = 'Icon';
  if (/^\d/.test(composed)) composed = `_${composed}`;
  return `Svg${composed}`;
}

export async function readSvgNamesFromDir(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true }).catch(() => []);
  return entries
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.svg'))
    .map((entry) => path.basename(entry.name, '.svg'))
    .sort((a, b) => a.localeCompare(b));
}

export async function cleanGeneratedTsxFiles(dir: string): Promise<void> {
  // 只清理脚本生成的 tsx，避免误删其它手写文件。
  const entries = await fs.readdir(dir, { withFileTypes: true }).catch(() => []);
  await Promise.all(
    entries
      .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.tsx'))
      .map((entry) => fs.rm(path.join(dir, entry.name), { force: true })),
  );
}
