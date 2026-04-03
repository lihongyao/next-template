// ⚠️ 此文件由脚本自动生成，请勿手动修改
// 生成时间: 2026-04-03T19:19:20.824Z
import type React from 'react';

import type { SvgPathName } from '@/components/ui/Icon/svgPath_all';

import Icon_file from './file';
import Icon_globe from './globe';
import Icon_next from './next';
import Icon_window from './window';

export const SVG_COMPONENT_MAP = {
  file: Icon_file,
  globe: Icon_globe,
  next: Icon_next,
  window: Icon_window,
} as const satisfies Partial<
  Record<SvgPathName, React.ComponentType<React.SVGProps<SVGSVGElement>>>
>;

export const SVG_SPRITE_ID_MAP = {
  cart: 'icon-cart',
  home: 'icon-home',
  order: 'icon-order',
  profile: 'icon-profile',
} as const satisfies Partial<Record<SvgPathName, string>>;

export const SVG_ICON_KIND_MAP = {
  cart: 'sprite',
  file: 'svgr',
  globe: 'svgr',
  home: 'sprite',
  next: 'svgr',
  order: 'sprite',
  profile: 'sprite',
  window: 'svgr',
} as const satisfies Record<SvgPathName, 'sprite' | 'svgr'>;

export const SVG_SPRITE_FILE = '/sprite.febb53bd.svg';
