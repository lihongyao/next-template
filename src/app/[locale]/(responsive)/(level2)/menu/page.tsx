import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { parseDeviceFromUA } from '@/libs/device';
import { getDeviceRouteFallback } from '@/router/matchRoute';
import { Routes } from '@/router/routes';

export default async function MenuPage() {
  const userAgent = (await headers()).get('user-agent') || '';
  const { isMobile } = parseDeviceFromUA(userAgent);
  const fallback = getDeviceRouteFallback(Routes.Menu, isMobile);

  if (fallback) redirect(fallback);

  return (
    <main data-name="menu-page" className="p-3 text-white">
      <h1 className="text-lg font-semibold">Menu</h1>
      <p className="mt-2 text-sm text-[#b3b8c1]">这是 H5 二级菜单页面。</p>
    </main>
  );
}
