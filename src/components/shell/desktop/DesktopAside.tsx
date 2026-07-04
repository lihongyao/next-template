import { type CSSProperties, useEffect, useState } from 'react';

import Banner from '@/components/menu-widgets/banner';
import DateTime from '@/components/menu-widgets/date-time';
import MenuList from '@/components/menu-widgets/menu-list';
import { type MenuSection, menuSections } from '@/components/menu-widgets/menu-sections';
import NavigationGrid from '@/components/menu-widgets/navigation-grid';
import Search from '@/components/menu-widgets/search';
import Icon, { type IconName } from '@/components/ui/Icon';
import { cn } from '@/libs/class-helpers';
import { Link, usePathname } from '@/router';
import { type Route, Routes } from '@/router/routes';
import { MenuWidgetTypes } from '@/types/menu-widgets';

type DesktopAsideProps = {
  collapsed: boolean;
  onToggle: () => void;
};

type DesktopAsideViewProps = {
  collapsed: boolean;
  onToggle: () => void;
  pathname: string;
  visible: boolean;
};

const DESKTOP_ASIDE_WIDTH = {
  collapsed: '72px',
  expanded: '240px',
} as const;
const DESKTOP_ASIDE_DURATION = {
  frame: 380,
  contentExit: 150,
  contentEnter: 210,
} as const;
const DESKTOP_ASIDE_EASE = 'cubic-bezier(0.2, 0, 0, 1)';

const navHeaderItems: Array<{ label: string; icon: IconName; path: Route }> = [
  { label: 'Truco', icon: 'truco', path: Routes.Truco },
  { label: 'Sports', icon: 'promotion', path: Routes.Promotion },
];

function renderDesktopMenuSection(section: MenuSection, index: number, collapsed: boolean) {
  const key = `${section.type}-${index}`;

  switch (section.type) {
    case MenuWidgetTypes.Banner:
      if (!section.data) return null;
      return <Banner key={key} collapsed={collapsed} data={section.data} />;
    case MenuWidgetTypes.DateTime:
      return <DateTime key={key} />;
    case MenuWidgetTypes.MenuList:
      if (!section.data) return null;
      return <MenuList key={key} collapsed={collapsed} data={section.data} />;
    case MenuWidgetTypes.NavigationGrid:
      if (!section.data) return null;
      return <NavigationGrid key={key} collapsed={collapsed} data={section.data} />;
    case MenuWidgetTypes.Search:
      return <Search key={key} collapsed={collapsed} className="aspect-auto h-11 rounded-sm" />;
  }
}

function DesktopAsideView({ collapsed, onToggle, pathname, visible }: DesktopAsideViewProps) {
  const viewStyle = {
    width: collapsed ? DESKTOP_ASIDE_WIDTH.collapsed : DESKTOP_ASIDE_WIDTH.expanded,
    transitionDuration: `${visible ? DESKTOP_ASIDE_DURATION.contentEnter : DESKTOP_ASIDE_DURATION.contentExit}ms`,
    transitionTimingFunction: DESKTOP_ASIDE_EASE,
  } as CSSProperties;

  return (
    <div
      aria-hidden={!visible ? true : undefined}
      inert={!visible ? true : undefined}
      className={cn(
        'flex h-full flex-col transition-opacity',
        visible ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
      )}
      style={viewStyle}
    >
      <header className="flex h-[56px] shrink-0 items-center justify-center gap-[6px] border-b border-white/[0.05] px-4">
        <button
          type="button"
          aria-label={collapsed ? 'Expand desktop menu' : 'Collapse desktop menu'}
          aria-expanded={!collapsed}
          className="animate-pressable flex shrink-0 items-center justify-center rounded-sm text-[#B3B8C1]"
          onClick={onToggle}
        >
          <Icon name={collapsed ? 'menu_close' : 'menu_open'} className="size-5" />
        </button>
        {!collapsed && (
          <div className="flex h-[34px] flex-1 items-center justify-center rounded-md bg-[#212121] p-[2px]">
            {navHeaderItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={cn(
                  'flex h-full flex-1 items-center justify-center gap-1 rounded-md text-[15px] font-medium text-[#B3B8C1]',
                  item.path === pathname &&
                    'bg-linear-90 from-[#31ED87] to-[#95E974] text-[#2A2A2A]',
                )}
              >
                <Icon name={item.icon} className="size-4" />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        )}
      </header>

      <div className="no-scrollbar flex flex-1 flex-col gap-3 overflow-y-auto p-3">
        {menuSections.map((section, index) => renderDesktopMenuSection(section, index, collapsed))}
      </div>
    </div>
  );
}

export default function DesktopAside({ collapsed, onToggle }: DesktopAsideProps) {
  const pathname = usePathname();
  const [contentCollapsed, setContentCollapsed] = useState(collapsed);
  const contentVisible = contentCollapsed === collapsed;
  const asideStyle = {
    '--desktop-aside-width': collapsed
      ? DESKTOP_ASIDE_WIDTH.collapsed
      : DESKTOP_ASIDE_WIDTH.expanded,
    transitionDuration: `${DESKTOP_ASIDE_DURATION.frame}ms`,
    transitionTimingFunction: DESKTOP_ASIDE_EASE,
  } as CSSProperties;

  useEffect(() => {
    if (contentCollapsed === collapsed) {
      return;
    }

    const timer = window.setTimeout(() => {
      setContentCollapsed(collapsed);
    }, DESKTOP_ASIDE_DURATION.contentExit);

    return () => {
      window.clearTimeout(timer);
    };
  }, [collapsed, contentCollapsed]);

  return (
    <aside
      className="animate-desktop-aside-frame sticky top-0 h-dvh overflow-x-hidden border-r border-[#ffffff0d] bg-[#161616] text-white"
      data-state={collapsed ? 'collapsed' : 'expanded'}
      style={asideStyle}
    >
      <div className="animate-desktop-aside-surface h-full overflow-hidden">
        <DesktopAsideView
          collapsed={contentCollapsed}
          onToggle={onToggle}
          pathname={pathname}
          visible={contentVisible}
        />
      </div>
    </aside>
  );
}
