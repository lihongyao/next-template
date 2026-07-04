import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import Banner from '@/components/menu-widgets/banner';
import DateTime from '@/components/menu-widgets/date-time';
import MenuList from '@/components/menu-widgets/menu-list';
import { type MenuSection, menuSections } from '@/components/menu-widgets/menu-sections';
import NavigationGrid from '@/components/menu-widgets/navigation-grid';
import Search from '@/components/menu-widgets/search';
import { parseDeviceFromUA } from '@/libs/device';
import { getDeviceRouteFallback } from '@/router/matchRoute';
import { Routes } from '@/router/routes';
import { MenuWidgetTypes } from '@/types/menu-widgets';

function renderMenuSection(section: MenuSection, index: number) {
  const key = `${section.type}-${index}`;

  switch (section.type) {
    case MenuWidgetTypes.Banner:
      if (!section.data) return null;
      return <Banner key={key} data={section.data} />;
    case MenuWidgetTypes.DateTime:
      return <DateTime key={key} />;
    case MenuWidgetTypes.MenuList:
      if (!section.data) return null;
      return <MenuList key={key} data={section.data} />;
    case MenuWidgetTypes.NavigationGrid:
      if (!section.data) return null;
      return <NavigationGrid key={key} data={section.data} />;
    case MenuWidgetTypes.Search:
      return <Search key={key} />;
  }
}

export default async function MenuPage() {
  const userAgent = (await headers()).get('user-agent') || '';
  const { isMobile } = parseDeviceFromUA(userAgent);
  const fallback = getDeviceRouteFallback(Routes.Menu, isMobile);

  if (fallback) redirect(fallback);

  return (
    <div data-name="menu-page" className="flex flex-col gap-3 p-3">
      {menuSections.map((section, index) => renderMenuSection(section, index))}
    </div>
  );
}
