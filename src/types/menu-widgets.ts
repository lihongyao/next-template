export const MenuWidgetTypes = {
  Banner: 'banner',
  DateTime: 'date-time',
  MenuList: 'menu-list',
  NavigationGrid: 'navigation-grid',
  Search: 'search',
} as const;

export type MenuWidgetType = (typeof MenuWidgetTypes)[keyof typeof MenuWidgetTypes];

export interface MenuWidgetConfig<T = unknown> {
  type: MenuWidgetType;
  data?: T;
}
