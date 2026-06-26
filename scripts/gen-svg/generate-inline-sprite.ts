import fs from 'node:fs/promises';
import path from 'node:path';
import prettier from 'prettier';

import { INLINE_SPRITE_COMPONENT_OUTPUT_FILE, PUBLIC_DIR } from './config.js';
import { safeFileBase } from './utils.js';

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function toInlineDefId(symbolId: string, originalId: string, usedIds: Set<string>): string {
  const symbolPrefix = safeFileBase(symbolId).replace(/^_+/, '') || 'icon';
  const idSuffix = safeFileBase(originalId).replace(/^_+/, '') || 'def';
  let nextId = `${symbolPrefix}__${idSuffix}`;
  let suffix = 2;

  while (usedIds.has(nextId)) {
    nextId = `${symbolPrefix}__${idSuffix}_${suffix}`;
    suffix += 1;
  }

  usedIds.add(nextId);
  return nextId;
}

function rewriteSymbolInternalIds(symbolMarkup: string, usedIds: Set<string>): string {
  const openTagEnd = symbolMarkup.indexOf('>');
  if (openTagEnd === -1) return symbolMarkup;

  const openTag = symbolMarkup.slice(0, openTagEnd + 1);
  const closeTag = '</symbol>';
  const body = symbolMarkup.slice(openTagEnd + 1, -closeTag.length);
  const symbolIdMatch = openTag.match(/\bid=(["'])([^"']+)\1/);
  const symbolId = symbolIdMatch?.[2];

  if (!symbolId) return symbolMarkup;

  const originalIds = Array.from(body.matchAll(/\bid=(["'])([^"']+)\1/g), (match) => match[2]);
  const uniqueIds = [...new Set(originalIds)];
  if (uniqueIds.length === 0) return symbolMarkup;

  const nextIdMap = new Map<string, string>();
  for (const originalId of uniqueIds) {
    nextIdMap.set(originalId, toInlineDefId(symbolId, originalId, usedIds));
  }

  let nextBody = body;
  for (const [originalId, nextId] of nextIdMap) {
    const escapedId = escapeRegExp(originalId);
    nextBody = nextBody.replace(new RegExp(`\\bid=(["'])${escapedId}\\1`, 'g'), `id="${nextId}"`);
    nextBody = nextBody.replace(
      new RegExp(`url\\((["']?)#${escapedId}\\1\\)`, 'g'),
      'url(#' + nextId + ')',
    );
    nextBody = nextBody.replace(
      new RegExp(`((?:href|xlink:href)=["'])#${escapedId}(["'])`, 'g'),
      `$1#${nextId}$2`,
    );
  }

  return `${openTag}${nextBody}${closeTag}`;
}

function extractSpriteContent(svgContent: string): string {
  const rootMatch = svgContent.match(/<svg\b[^>]*>([\s\S]*?)<\/svg>\s*$/i);
  if (!rootMatch) {
    throw new Error('sprite 文件内容异常，未找到根 <svg> 节点');
  }

  return rootMatch[1].trim();
}

function rewriteSpriteContentForInline(spriteContent: string): string {
  const usedIds = new Set<string>();
  return spriteContent.replace(/<symbol\b[\s\S]*?<\/symbol>/g, (symbolMarkup) =>
    rewriteSymbolInternalIds(symbolMarkup, usedIds),
  );
}

function createInlineSpriteComponent(symbolMarkup: string): string {
  if (!symbolMarkup) {
    return `
// ⚠️ 此文件由脚本自动生成，请勿手动修改
export default function SpriteSvgSource() {
  return null;
}
`;
  }

  return `
// ⚠️ 此文件由脚本自动生成，请勿手动修改
const SPRITE_SYMBOLS = ${JSON.stringify(symbolMarkup)} as const;

export default function SpriteSvgSource() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      focusable={false}
      width="0"
      height="0"
      style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden', pointerEvents: 'none' }}
      dangerouslySetInnerHTML={{ __html: SPRITE_SYMBOLS }}
    />
  );
}
`;
}

export async function generateInlineSpriteTsx(publicSpriteFile: string): Promise<void> {
  const prettierConfig = (await prettier.resolveConfig(INLINE_SPRITE_COMPONENT_OUTPUT_FILE)) ?? {};
  const spriteFilePath = path.join(PUBLIC_DIR, publicSpriteFile.replace(/^\//, ''));
  const rawSvg = await fs.readFile(spriteFilePath, 'utf8');
  const spriteContent = extractSpriteContent(rawSvg);
  const inlineSpriteContent = rewriteSpriteContentForInline(spriteContent);
  const componentOutput = createInlineSpriteComponent(inlineSpriteContent);

  await fs.mkdir(path.dirname(INLINE_SPRITE_COMPONENT_OUTPUT_FILE), { recursive: true });
  await fs.writeFile(
    INLINE_SPRITE_COMPONENT_OUTPUT_FILE,
    await prettier.format(componentOutput, { ...prettierConfig, parser: 'typescript' }),
    'utf8',
  );
}
