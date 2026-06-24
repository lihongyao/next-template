import path from 'node:path';

export const ROOT_DIR = process.cwd();

// 约定目录：设计稿 SVG 放 source，脚本产物主要写 generated。
export const SVG_ROOT_DIR = path.join(ROOT_DIR, 'src/assets/svg');
export const SVG_SOURCE_DIR = path.join(SVG_ROOT_DIR, 'source');
export const SVG_SOURCE_SPRITES_DIR = path.join(SVG_SOURCE_DIR, 'sprites');
export const SVG_SOURCE_SVGRS_DIR = path.join(SVG_SOURCE_DIR, 'svgrs');
export const SVG_GENERATED_DIR = path.join(SVG_ROOT_DIR, 'generated');

// generated/index.ts 是运行时唯一读取的 icon 注册表入口。
export const ICON_REGISTRY_OUTPUT_FILE = path.join(SVG_GENERATED_DIR, 'index.ts');
// 类型也放回 generated，避免自动产物散落到 UI 目录里。
export const SVG_TYPES_OUTPUT_FILE = path.join(SVG_GENERATED_DIR, 'svgPath_all.ts');

export const PUBLIC_DIR = path.join(ROOT_DIR, 'public');
// 对应 public/sprite.<hash>.svg
export const PUBLIC_SPRITE_PREFIX = 'sprite';
export const PUBLIC_SPRITE_PREVIEW_OUTPUT_FILE = path.join(PUBLIC_DIR, 'sprite-preview.html');
