import { memo } from 'react';

import Icon from '@/components/ui/Icon';
import { SvgPathName } from '@/components/ui/Icon/svgPath_all';

export default memo(function NavigationGrid({
  colSpan = 1,
  items = [],
}: {
  items: Array<{ label: string; icon: SvgPathName }>;
  colSpan: number;
}) {
  return (
    <div
      data-name="navigation-grid "
      className="gap-[6px]"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${colSpan}, 1fr)`,
      }}
    >
      {items.map((item, index) => (
        <div
          key={index}
          className="flex flex-col items-center justify-center gap-[6px] rounded-lg bg-[#ffffff0d] py-3"
        >
          <Icon name={item.icon} className="size-[20px]" />
          <span className="text-xs text-[#B3B8C1]">{item.label}</span>
        </div>
      ))}
    </div>
  );
});
