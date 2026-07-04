import { getImageUrl } from '@/libs/cdn-image';
import { type MenuWidgetConfig, type MenuWidgetType, MenuWidgetTypes } from '@/types/menu-widgets';

import type { BannerProps } from './banner';
import type { MenuListProps } from './menu-list';
import type { NavigationGridProps } from './navigation-grid';

type MenuWidgetOf<TType extends MenuWidgetType, TData = never> = MenuWidgetConfig<TData> & {
  type: TType;
};

export type MenuSection =
  | MenuWidgetOf<typeof MenuWidgetTypes.Banner, BannerProps>
  | MenuWidgetOf<typeof MenuWidgetTypes.MenuList, MenuListProps>
  | MenuWidgetOf<typeof MenuWidgetTypes.NavigationGrid, NavigationGridProps>
  | MenuWidgetOf<typeof MenuWidgetTypes.DateTime>
  | MenuWidgetOf<typeof MenuWidgetTypes.Search>;

const menuImage = (path: string) => getImageUrl(path);

const quickItems: NavigationGridProps['items'] = [
  { label: 'Popular', icon: 'hot' },
  { label: 'Favorites', icon: 'favorites' },
  { label: 'Recent', icon: 'recent' },
];

const primaryListItems: MenuListProps['items'] = [
  { label: 'VIP Club', icon: 'vip' },
  { label: 'Bonus', icon: 'bonus', path: '/i18n' },
  { label: 'Truco', icon: 'truco', path: '/truco' },
  { label: 'Tournament', icon: 'tournament' },
  { label: 'Affiliate', icon: 'affiliate', dot: true },
  { label: 'Promotions', icon: 'promotion' },
];

const supportListItems: MenuListProps['items'] = [
  { label: 'Help Center', icon: 'help' },
  { label: 'Live Support', icon: 'service' },
  { label: 'Language', icon: 'globe' },
];

export const menuSections: MenuSection[] = [
  {
    type: MenuWidgetTypes.Banner,
    data: {
      image_h5: menuImage('configurable/menu/invite-h5.jpg'),
      image_pc: menuImage('configurable/menu/invite-pc.jpg'),
      collapsed_image: menuImage('configurable/menu/invite_collapsed.jpg'),
    },
  },
  { type: MenuWidgetTypes.Search },
  { type: MenuWidgetTypes.NavigationGrid, data: { colSpan: 3, items: quickItems } },
  { type: MenuWidgetTypes.MenuList, data: { items: primaryListItems } },
  {
    type: MenuWidgetTypes.Banner,
    data: {
      image_h5: menuImage('configurable/menu/download_app-h5.jpg'),
      image_pc: menuImage('configurable/menu/download_app-pc.jpg'),
    },
  },
  { type: MenuWidgetTypes.MenuList, data: { items: supportListItems } },
];
