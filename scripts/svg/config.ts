import path from 'path';

// 配置路径
const root = process.cwd();
export const SRC_DIR = path.resolve(root, 'public/icons/sprite');
export const OUT_DIR = path.resolve(root, 'public');

// sprite.svg文件的输出位置
export const SPRITE_OUTPUT_FILE = path.join(OUT_DIR, 'sprite.svg');
// svg转换成的所有React组件的map
export const ICON_MAP_OUTPUT_PATH = path.join('src/generated', 'iconMap.ts');
// svg ts 类型定义
export const SVG_TYPES_PATH = path.join(root, 'src/components/ui/Icon/svgPath_all.ts');

export const CONSTANTS_OUTPUT_PATH_FOR_SPRITE = path.resolve(root, 'src/constants/iconSprite.ts');
export const CONSTANTS_OUTPUT_PATH_FOR_COMPONENT = path.join(
  root,
  'src/constants/iconComponent.ts',
);
export const CONSTANTS_OUTPUT_PATH_FOR_LAZY = path.join(root, 'src/constants/iconLazy.ts');

export const COLOR_REPLACEMENTS = {
  '#000': 'currentColor',
  white: 'currentColor',
  '#000000': 'currentColor',
  '#fff': 'currentColor',
  '#ffffff': 'currentColor',
  '#b3b8c1': 'currentColor',
  '#B3B8C1': 'currentColor',
  '#31ED87': 'currentColor',
  '#181C19': 'currentColor',
  '#8C928F': 'currentColor',
  '#FF0000': 'currentColor',
  '#FC0048': 'currentColor',
  '#F3DF00': 'currentColor',
  '#2DEE88': 'currentColor',
  '#FF7300': 'currentColor',
  '#FFC271': 'currentColor',
};
