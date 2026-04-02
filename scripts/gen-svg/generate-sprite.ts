import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import SVGSpriter from 'svg-sprite';

import {
  PUBLIC_DIR,
  PUBLIC_SPRITE_PREFIX,
  SPRITE_OUTPUT_FILE,
  SVG_SOURCE_SPRITES_DIR,
} from './config.js';
import { optimizeSvgContent } from './optimize-svgo.js';
import { readSvgNamesFromDir } from './utils.js';

export type SpriteBuildResult = {
  spriteNames: string[];
  publicSpriteFile: string;
};

const SPRITE_FILE_PATTERN = /^sprite(?:\.(?:[a-f0-9]{8}|empty))?\.svg$/;

async function removeOldSpriteFiles(): Promise<void> {
  const entries = await fs.readdir(PUBLIC_DIR, { withFileTypes: true }).catch(() => []);
  await Promise.all(
    entries
      .filter((entry) => entry.isFile() && SPRITE_FILE_PATTERN.test(entry.name))
      .map((entry) => fs.rm(path.join(PUBLIC_DIR, entry.name), { force: true })),
  );
}

function createSpriteFileName(spriteContent: string): string {
  const hash = createHash('sha256').update(spriteContent).digest('hex').slice(0, 8);
  return `${PUBLIC_SPRITE_PREFIX}.${hash}.svg`;
}

export async function generateSpriteSvg(): Promise<SpriteBuildResult> {
  const spriteNames = await readSvgNamesFromDir(SVG_SOURCE_SPRITES_DIR);

  await fs.mkdir(path.dirname(SPRITE_OUTPUT_FILE), { recursive: true });
  await fs.mkdir(PUBLIC_DIR, { recursive: true });

  if (spriteNames.length === 0) {
    const emptySprite = `<svg xmlns="http://www.w3.org/2000/svg"></svg>`;
    const fileName = `${PUBLIC_SPRITE_PREFIX}.empty.svg`;
    const publicSpritePath = path.join(PUBLIC_DIR, fileName);
    await removeOldSpriteFiles();
    await fs.writeFile(SPRITE_OUTPUT_FILE, emptySprite, 'utf8');
    await fs.writeFile(publicSpritePath, emptySprite, 'utf8');
    return { spriteNames: [], publicSpriteFile: `/${fileName}` };
  }

  const spriter = new SVGSpriter({
    mode: {
      symbol: {
        dest: '.',
        sprite: 'sprite.svg',
        inline: false,
        example: false,
      },
    },
    shape: {
      id: {
        generator: (name: string) => `icon-${path.basename(name, '.svg')}`,
      },
    },
    svg: {
      xmlDeclaration: false,
      doctypeDeclaration: false,
    },
  });

  for (const name of spriteNames) {
    const filePath = path.join(SVG_SOURCE_SPRITES_DIR, `${name}.svg`);
    const content = await fs.readFile(filePath, 'utf8');
    const optimized = optimizeSvgContent(content, filePath);
    spriter.add(filePath, `${name}.svg`, optimized);
  }

  const result = await new Promise<Record<string, { sprite: { contents: Buffer } }>>(
    (resolve, reject) => {
      spriter.compile((err, res) => {
        if (err) reject(err);
        else resolve(res as Record<string, { sprite: { contents: Buffer } }>);
      });
    },
  );

  const spriteContent = result.symbol.sprite.contents.toString('utf8');
  const fileName = createSpriteFileName(spriteContent);
  const publicSpritePath = path.join(PUBLIC_DIR, fileName);

  await removeOldSpriteFiles();
  await fs.writeFile(SPRITE_OUTPUT_FILE, spriteContent, 'utf8');
  await fs.writeFile(publicSpritePath, spriteContent, 'utf8');

  return {
    spriteNames,
    publicSpriteFile: `/${fileName}`,
  };
}
