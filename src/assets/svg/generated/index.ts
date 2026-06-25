// ⚠️ 此文件由脚本自动生成，请勿手动修改
import type React from 'react';

import Icon_adult from './adult';
import Icon_arrow_long_left from './arrow_long_left';
import Icon_arrow_long_right from './arrow_long_right';
import Icon_choose_off from './choose_off';
import Icon_choose_on from './choose_on';
import Icon_first_visit_frame from './first_visit_frame';
import Icon_subtract from './subtract';
import type { SvgPathName } from './svgPath_all';

// 业务统一从 generated/index.ts 取类型，不再直接摸 svgPath_all.ts。
export { SVG_PATH_NAMES } from './svgPath_all';
export type { SvgPathName } from './svgPath_all';

export const SVG_COMPONENT_MAP = {
  adult: Icon_adult,
  arrow_long_left: Icon_arrow_long_left,
  arrow_long_right: Icon_arrow_long_right,
  choose_off: Icon_choose_off,
  choose_on: Icon_choose_on,
  first_visit_frame: Icon_first_visit_frame,
  subtract: Icon_subtract,
} as const satisfies Partial<
  Record<SvgPathName, React.ComponentType<React.SVGProps<SVGSVGElement>>>
>;

export const SVG_SPRITE_ID_MAP = {
  affiliate: 'icon-affiliate',
  arrow_down: 'icon-arrow_down',
  arrow_left: 'icon-arrow_left',
  arrow_right: 'icon-arrow_right',
  arrow_up: 'icon-arrow_up',
  bonus: 'icon-bonus',
  bottom_acting: 'icon-bottom_acting',
  bottom_casino: 'icon-bottom_casino',
  bottom_home: 'icon-bottom_home',
  bottom_sports: 'icon-bottom_sports',
  bottom_user: 'icon-bottom_user',
  bottom_vip2: 'icon-bottom_vip2',
  cart: 'icon-cart',
  close: 'icon-close',
  copy: 'icon-copy',
  edit: 'icon-edit',
  favorites: 'icon-favorites',
  globe: 'icon-globe',
  help: 'icon-help',
  home: 'icon-home',
  hot: 'icon-hot',
  menu: 'icon-menu',
  message: 'icon-message',
  order: 'icon-order',
  profile: 'icon-profile',
  promotion: 'icon-promotion',
  recent: 'icon-recent',
  search: 'icon-search',
  service: 'icon-service',
  settings: 'icon-settings',
  sport_baseball: 'icon-sport_baseball',
  sport_basketball: 'icon-sport_basketball',
  sport_soccerball: 'icon-sport_soccerball',
  sport_tennis: 'icon-sport_tennis',
  sport_volleyball: 'icon-sport_volleyball',
  time: 'icon-time',
  tips_correct: 'icon-tips_correct',
  tips_error: 'icon-tips_error',
  tips_system: 'icon-tips_system',
  tips_warning: 'icon-tips_warning',
  tournament: 'icon-tournament',
  truco: 'icon-truco',
  vip: 'icon-vip',
} as const satisfies Partial<Record<SvgPathName, string>>;

export const SVG_ICON_KIND_MAP = {
  adult: 'svgr',
  affiliate: 'sprite',
  arrow_down: 'sprite',
  arrow_left: 'sprite',
  arrow_long_left: 'svgr',
  arrow_long_right: 'svgr',
  arrow_right: 'sprite',
  arrow_up: 'sprite',
  bonus: 'sprite',
  bottom_acting: 'sprite',
  bottom_casino: 'sprite',
  bottom_home: 'sprite',
  bottom_sports: 'sprite',
  bottom_user: 'sprite',
  bottom_vip2: 'sprite',
  cart: 'sprite',
  choose_off: 'svgr',
  choose_on: 'svgr',
  close: 'sprite',
  copy: 'sprite',
  edit: 'sprite',
  favorites: 'sprite',
  first_visit_frame: 'svgr',
  globe: 'sprite',
  help: 'sprite',
  home: 'sprite',
  hot: 'sprite',
  menu: 'sprite',
  message: 'sprite',
  order: 'sprite',
  profile: 'sprite',
  promotion: 'sprite',
  recent: 'sprite',
  search: 'sprite',
  service: 'sprite',
  settings: 'sprite',
  sport_baseball: 'sprite',
  sport_basketball: 'sprite',
  sport_soccerball: 'sprite',
  sport_tennis: 'sprite',
  sport_volleyball: 'sprite',
  subtract: 'svgr',
  time: 'sprite',
  tips_correct: 'sprite',
  tips_error: 'sprite',
  tips_system: 'sprite',
  tips_warning: 'sprite',
  tournament: 'sprite',
  truco: 'sprite',
  vip: 'sprite',
} as const satisfies Record<SvgPathName, 'sprite' | 'svgr'>;

export const SVG_SPRITE_FILE = '/sprite.6d24015b.svg';
