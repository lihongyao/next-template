import { createSvgSpriteBuilder } from '@neodx/svg';
import fs from 'node:fs/promises';
import path from 'node:path';

import {
  PUBLIC_DIR,
  PUBLIC_SPRITE_PREFIX,
  PUBLIC_SPRITE_PREVIEW_OUTPUT_FILE,
  ROOT_DIR,
  SVG_SOURCE_SPRITES_DIR,
} from './config.js';
import { readSvgNamesFromDir } from './utils.js';

export type SpriteBuildResult = {
  spriteNames: string[];
  publicSpriteFile: string;
};

// 匹配 sprite 文件名，包括 hash 和 empty 两种情况。
const SPRITE_FILE_PATTERN = /^sprite(?:\.(?:[a-f0-9]{8}|empty))?\.svg$/;

function createPreviewHtml(spriteNames: string[], publicSpriteFile: string): string {
  const list =
    spriteNames.length === 0
      ? '<p class="empty">当前没有可预览的 sprite 图标。</p>'
      : spriteNames
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
          .join('\n');

  return `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Sprite 图标预览</title>
    <style>
      body { margin: 0; padding: 24px; background: #0f1115; color: #e5e7eb; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif; }
      h1 { margin: 0 0 8px; font-size: 20px; }
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
    <p class="desc">当前 sprite：<code>${publicSpriteFile}</code></p>
    <ul>${list}</ul>
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

async function resolveLatestSpriteFile(): Promise<string> {
  const entries = await fs.readdir(PUBLIC_DIR, { withFileTypes: true });
  const files = entries.filter((entry) => entry.isFile() && SPRITE_FILE_PATTERN.test(entry.name));
  if (files.length === 0) {
    throw new Error('未找到 neodx 生成的 sprite 文件');
  }
  if (files.length === 1) return files[0].name;

  // 正常情况下只会有一个，兜底按 mtime 取最新，避免并发构建时拿错文件。
  const filesWithMtime = await Promise.all(
    files.map(async (file) => {
      const stat = await fs.stat(path.join(PUBLIC_DIR, file.name));
      return { name: file.name, mtimeMs: stat.mtimeMs };
    }),
  );
  filesWithMtime.sort((a, b) => b.mtimeMs - a.mtimeMs);
  return filesWithMtime[0].name;
}

export async function generateSpriteSvg(): Promise<SpriteBuildResult> {
  const spriteNames = await readSvgNamesFromDir(SVG_SOURCE_SPRITES_DIR);

  await fs.mkdir(PUBLIC_DIR, { recursive: true });

  if (spriteNames.length === 0) {
    const emptySprite = `<svg xmlns="http://www.w3.org/2000/svg"></svg>`;
    const fileName = `${PUBLIC_SPRITE_PREFIX}.empty.svg`;
    const publicSpriteFile = `/${fileName}`;
    const publicSpritePath = path.join(PUBLIC_DIR, fileName);
    await removeOldSpriteFiles();
    await fs.writeFile(publicSpritePath, emptySprite, 'utf8');
    const previewHtml = createPreviewHtml([], publicSpriteFile);
    await fs.writeFile(PUBLIC_SPRITE_PREVIEW_OUTPUT_FILE, previewHtml, 'utf8');
    return { spriteNames: [], publicSpriteFile };
  }

  await removeOldSpriteFiles();

  const builder = createSvgSpriteBuilder({
    // 以 sprites 目录作为输入根目录，只处理这里的图标。
    inputRoot: path.relative(ROOT_DIR, SVG_SOURCE_SPRITES_DIR),
    // 产物写到 public，运行时可直接通过 URL 引用。
    output: path.relative(ROOT_DIR, PUBLIC_DIR),
    // 只产出一个 sprite 文件，不按目录分组。
    group: false,
    // 项目运行时通过 /sprite.hash.svg 外链引用，关闭 neodx inline asset 生成。
    inline: false,
    defaultSpriteName: PUBLIC_SPRITE_PREFIX,
    // 产出文件名带内容 hash，用于缓存失效。
    fileName: '{name}.{hash:8}.svg',
    // 清理由外部 removeOldSpriteFiles 统一处理。
    cleanup: false,
    // 颜色重置为 currentColor，便于在业务侧用 CSS 控制图标颜色。
    resetColors: true,
    // symbol id 统一为 icon-xxx，和 Icon 组件的 use 规则保持一致。
    getSymbolName: (filePath) => `icon-${path.basename(filePath, '.svg')}`,
  });

  await builder.load('*.svg');
  await builder.build();

  const fileName = await resolveLatestSpriteFile();
  const publicSpriteFile = `/${fileName}`;
  // 预览页只读最终产物路径，避免手动查 hash。
  const previewHtml = createPreviewHtml(spriteNames, publicSpriteFile);
  await fs.writeFile(PUBLIC_SPRITE_PREVIEW_OUTPUT_FILE, previewHtml, 'utf8');

  return {
    spriteNames,
    publicSpriteFile,
  };
}
