import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import Banner from '@/components/menu-items/banner';
import MenuList, { MenuListItemProps } from '@/components/menu-items/menu-list';
import NavigationGrid from '@/components/menu-items/navigation-grid';
import Search from '@/components/menu-items/search';
import { SvgPathName } from '@/components/ui/Icon/svgPath_all';
import { getImageUrl } from '@/libs/cdn-image';
import { parseDeviceFromUA } from '@/libs/device';
import { getDeviceRouteFallback } from '@/router/matchRoute';
import { Routes } from '@/router/routes';

const Grids1: Array<MenuListItemProps> = [
  { label: 'Popular', icon: 'hot' },
  { label: 'Favorites', icon: 'favorites' },
  { label: 'Recent', icon: 'recent' },
];

const GridsList1: Array<MenuListItemProps> = [
  { label: 'VIP Club', icon: 'vip' },
  { label: 'Bonus', icon: 'bonus' },
  { label: 'Tournament', icon: 'tournament' },
  { label: 'Affiliate', icon: 'affiliate', dot: true },
  { label: 'Promotions', icon: 'promotion' },
];

const GridsList2: Array<{
  label: string;
  icon: SvgPathName;
}> = [
  { label: 'Help Center', icon: 'help' },
  { label: 'Live Support', icon: 'service' },
  { label: 'Language', icon: 'globe' },
];

export default async function MenuPage() {
  const userAgent = (await headers()).get('user-agent') || '';
  const { isMobile } = parseDeviceFromUA(userAgent);
  const fallback = getDeviceRouteFallback(Routes.Menu, isMobile);

  if (fallback) redirect(fallback);

  return (
    <div data-name="menu-page" className="flex flex-col gap-3 p-3">
      <Banner img={getImageUrl('configurable/menu/withdraw.jpg')} />
      <Search />
      <NavigationGrid items={Grids1} colSpan={3} />
      <MenuList items={GridsList1} />
      <Banner img={getImageUrl('configurable/menu/download_app.jpg')} />
      <MenuList items={GridsList2} />
    </div>
  );
}
