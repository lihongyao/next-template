import { memo } from 'react';

import type { SvgPathName } from '@/assets/svg/generated';
import Icon from '@/components/ui/Icon';

export type NavigationGridProps = {
  items: Array<{ label: string; icon: SvgPathName }>;
  colSpan: number;
};
export default memo(function NavigationGrid({
  collapsed,
  data,
}: {
  collapsed?: boolean;
  data: NavigationGridProps;
}) {
  const { items, colSpan } = data;
  if (!items || items.length === 0) return null;
  return (
    <div
      data-name="navigation-grid "
      className="gap-[6px]"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${collapsed ? 1 : colSpan}, 1fr)`,
      }}
    >
      {items.map((item, index) => (
        <div
          key={index}
          className="group flex cursor-pointer flex-col items-center justify-center gap-[6px] rounded-lg bg-[#ffffff0d] bg-linear-90 py-3 hover:from-[#31ed8733] hover:to-[#31ed8700]"
        >
          <Icon name={item.icon} className="size-[20px] text-[#B3B8C1] group-hover:text-white" />
          {!collapsed && (
            <span className="text-xs text-[#B3B8C1] group-hover:text-white">{item.label}</span>
          )}
        </div>
      ))}
    </div>
  );
});
