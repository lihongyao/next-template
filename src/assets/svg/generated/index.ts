// ⚠️ 此文件由脚本自动生成，请勿手动修改
// 生成时间: 2026-04-24T11:47:35.537Z
import type React from 'react';

import type { SvgPathName } from '@/components/ui/Icon/svgPath_all';

import Icon_arrow_long_left from './arrow_long_left';
import Icon_arrow_long_right from './arrow_long_right';
import Icon_bottom_acting from './bottom_acting';
import Icon_bottom_casino from './bottom_casino';
import Icon_bottom_home from './bottom_home';
import Icon_bottom_sports from './bottom_sports';
import Icon_bottom_user from './bottom_user';
import Icon_bottom_vip2 from './bottom_vip2';
import Icon_close from './close';
import Icon_file from './file';
import Icon_globe from './globe';
import Icon_next from './next';
import Icon_time from './time';
import Icon_window from './window';

export const SVG_COMPONENT_MAP = {
  arrow_long_left: Icon_arrow_long_left,
  arrow_long_right: Icon_arrow_long_right,
  bottom_acting: Icon_bottom_acting,
  bottom_casino: Icon_bottom_casino,
  bottom_home: Icon_bottom_home,
  bottom_sports: Icon_bottom_sports,
  bottom_user: Icon_bottom_user,
  bottom_vip2: Icon_bottom_vip2,
  close: Icon_close,
  file: Icon_file,
  globe: Icon_globe,
  next: Icon_next,
  time: Icon_time,
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
  arrow_long_left: 'svgr',
  arrow_long_right: 'svgr',
  bottom_acting: 'svgr',
  bottom_casino: 'svgr',
  bottom_home: 'svgr',
  bottom_sports: 'svgr',
  bottom_user: 'svgr',
  bottom_vip2: 'svgr',
  cart: 'sprite',
  close: 'svgr',
  file: 'svgr',
  globe: 'svgr',
  home: 'sprite',
  next: 'svgr',
  order: 'sprite',
  profile: 'sprite',
  time: 'svgr',
  window: 'svgr',
} as const satisfies Record<SvgPathName, 'sprite' | 'svgr'>;

export const SVG_SPRITE_FILE = '/sprite.4609867e.svg';
