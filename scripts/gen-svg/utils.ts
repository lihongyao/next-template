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
  return (
    entries
      .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.svg'))
      // registry / type 都只认文件名本体，不带目录层级。
      .map((entry) => path.basename(entry.name, '.svg'))
      .sort((a, b) => a.localeCompare(b))
  );
}

/**
 * 删除 source/svgrs 里已不存在的图标对应的 generated/*.tsx，与源目录保持对齐。
 * 仅按「safe 文件名 = safeFileBase(源名).tsx」判断，不处理其它手写在 generated 里的 tsx（视为孤儿并删除）。
 */
export async function removeOrphanedSvgrTsxFiles(
  dir: string,
  currentSourceBaseNames: string[],
): Promise<string[]> {
  const expected = new Set(currentSourceBaseNames.map((n) => safeFileBase(n)));
  const entries = await fs.readdir(dir, { withFileTypes: true }).catch(() => []);
  const removed: string[] = [];
  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.toLowerCase().endsWith('.tsx')) continue;
    const base = path.basename(entry.name, '.tsx');
    if (expected.has(base)) continue;
    await fs.rm(path.join(dir, entry.name), { force: true });
    removed.push(entry.name);
  }
  return removed;
}

export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.stat(filePath);
    return true;
  } catch {
    return false;
  }
}
