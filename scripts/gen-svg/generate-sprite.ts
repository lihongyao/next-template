import { createSvgSpriteBuilder } from '@neodx/svg';
import fs from 'node:fs/promises';
import path from 'node:path';

import {
  PUBLIC_DIR,
  PUBLIC_SPRITE_CRITICAL_PREFIX,
  PUBLIC_SPRITE_NORMAL_PREFIX,
  PUBLIC_SPRITE_PREVIEW_OUTPUT_FILE,
  ROOT_DIR,
  SVG_SOURCE_SPRITES_CRITICAL_DIR,
  SVG_SOURCE_SPRITES_NORMAL_DIR,
} from './config.js';
import { readSvgNamesFromDir } from './utils.js';

export type SpriteGroupName = 'critical' | 'normal';

export type SpriteGroupBuildResult = {
  groupName: SpriteGroupName;
  publicSpriteFile: string;
  spriteNames: string[];
};

export type SpritesBuildResult = {
  critical: SpriteGroupBuildResult;
  normal: SpriteGroupBuildResult;
};

// 匹配当前和历史 sprite 文件名，避免目录结构升级后遗留旧产物。
const SPRITE_FILE_PATTERN = /^sprite(?:-(?:critical|normal))?(?:\.(?:[a-f0-9]{8}|empty))?\.svg$/;

function createPreviewSection({
  groupName,
  publicSpriteFile,
  spriteNames,
}: SpriteGroupBuildResult): string {
  const title = groupName === 'critical' ? 'Critical Sprite' : 'Normal Sprite';
  const list =
    spriteNames.length === 0
      ? '<p class="empty">当前没有可预览的 sprite 图标。</p>'
      : `
    <ul>${spriteNames
      .map(
        (name) => `
      <li class="item">
        <div class="icon-wrap">
          <svg viewBox="0 0 24 24" class="icon" aria-hidden="true">
            <use href="${publicSpriteFile}#icon-${name}"></use>
          </svg>
        </div>
        <code>${name}</code>
      </li>`,
      )
      .join('\n')}
    </ul>`;

  return `
    <section class="group">
      <h2>${title}</h2>
      <p class="desc">当前 sprite：<code>${publicSpriteFile}</code></p>
      ${list}
    </section>`;
}

function createPreviewHtml(result: SpritesBuildResult): string {
  return `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Sprite 图标预览</title>
    <style>
      body { margin: 0; padding: 24px; background: #0f1115; color: #e5e7eb; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif; }
      h1 { margin: 0 0 16px; font-size: 20px; }
      h2 { margin: 0 0 8px; font-size: 16px; }
      .group + .group { margin-top: 28px; }
      .desc { margin: 0 0 16px; color: #9ca3af; font-size: 13px; }
      ul { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 12px; }
      .item { border: 1px solid #242833; border-radius: 10px; background: #171a21; padding: 12px; text-align: center; }
      .icon-wrap { width: 48px; height: 48px; margin: 0 auto 8px; border-radius: 8px; background: #0f1115; display: flex; align-items: center; justify-content: center; }
      .icon { width: 24px; height: 24px; color: #ffffff; fill: currentColor; }
      code { font-size: 12px; color: #cbd5e1; word-break: break-all; }
      .empty { color: #9ca3af; }
    </style>
  </head>
  <body>
    <h1>Sprite 图标预览</h1>
    ${createPreviewSection(result.critical)}
    ${createPreviewSection(result.normal)}
  </body>
</html>`;
}

async function removeOldSpriteFiles(): Promise<void> {
  const entries = await fs.readdir(PUBLIC_DIR, { withFileTypes: true }).catch(() => []);
  await Promise.all(
    entries
      .filter((entry) => entry.isFile() && SPRITE_FILE_PATTERN.test(entry.name))
      .map((entry) => fs.rm(path.join(PUBLIC_DIR, entry.name), { force: true })),
  );
}

async function resolveLatestSpriteFile(prefix: string): Promise<string> {
  const filePattern = new RegExp(
    `^${prefix.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')}(?:\\.(?:[a-f0-9]{8}|empty))?\\.svg$`,
  );
  const entries = await fs.readdir(PUBLIC_DIR, { withFileTypes: true });
  const files = entries.filter((entry) => entry.isFile() && filePattern.test(entry.name));
  if (files.length === 0) {
    throw new Error(`未找到 ${prefix} 对应的 sprite 文件`);
  }
  if (files.length === 1) return files[0].name;

  const filesWithMtime = await Promise.all(
    files.map(async (file) => {
      const stat = await fs.stat(path.join(PUBLIC_DIR, file.name));
      return { name: file.name, mtimeMs: stat.mtimeMs };
    }),
  );
  filesWithMtime.sort((a, b) => b.mtimeMs - a.mtimeMs);
  return filesWithMtime[0].name;
}

async function buildSpriteGroup({
  groupName,
  prefix,
  sourceDir,
}: {
  groupName: SpriteGroupName;
  prefix: string;
  sourceDir: string;
}): Promise<SpriteGroupBuildResult> {
  const spriteNames = await readSvgNamesFromDir(sourceDir);

  if (spriteNames.length === 0) {
    const emptySprite = `<svg xmlns="http://www.w3.org/2000/svg"></svg>`;
    const fileName = `${prefix}.empty.svg`;
    const publicSpriteFile = `/${fileName}`;
    const publicSpritePath = path.join(PUBLIC_DIR, fileName);
    await fs.writeFile(publicSpritePath, emptySprite, 'utf8');
    return { groupName, publicSpriteFile, spriteNames: [] };
  }

  const builder = createSvgSpriteBuilder({
    inputRoot: path.relative(ROOT_DIR, sourceDir),
    output: path.relative(ROOT_DIR, PUBLIC_DIR),
    group: false,
    inline: false,
    defaultSpriteName: prefix,
    fileName: '{name}.{hash:8}.svg',
    cleanup: false,
    resetColors: true,
    getSymbolName: (filePath: string) => `icon-${path.basename(filePath, '.svg')}`,
  });

  await builder.load('**/*.svg');
  await builder.build();

  const fileName = await resolveLatestSpriteFile(prefix);
  return {
    groupName,
    publicSpriteFile: `/${fileName}`,
    spriteNames,
  };
}

export async function generateSpriteSvg(): Promise<SpritesBuildResult> {
  await fs.mkdir(PUBLIC_DIR, { recursive: true });
  await removeOldSpriteFiles();

  const critical = await buildSpriteGroup({
    groupName: 'critical',
    prefix: PUBLIC_SPRITE_CRITICAL_PREFIX,
    sourceDir: SVG_SOURCE_SPRITES_CRITICAL_DIR,
  });
  const normal = await buildSpriteGroup({
    groupName: 'normal',
    prefix: PUBLIC_SPRITE_NORMAL_PREFIX,
    sourceDir: SVG_SOURCE_SPRITES_NORMAL_DIR,
  });

  await fs.writeFile(
    PUBLIC_SPRITE_PREVIEW_OUTPUT_FILE,
    createPreviewHtml({ critical, normal }),
    'utf8',
  );

  return { critical, normal };
}
