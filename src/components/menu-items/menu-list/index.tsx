'use client';
import { memo } from 'react';

import type { SvgPathName } from '@/assets/svg/generated';
import Icon from '@/components/ui/Icon';
import { useRouter } from '@/router';

export interface MenuListItemProps {
  label: string;
  icon: SvgPathName;
  dot?: boolean;
  path?: string;
}
export default memo(function MenuList({ items = [] }: { items: Array<MenuListItemProps> }) {
  const router = useRouter();
  return (
    <div data-name="menu-list " className="flex flex-col rounded-lg bg-[#ffffff0d] px-3 py-2">
      {items.map((item, index) => (
        <div
          key={index}
          className="flex h-[46px] items-center justify-start gap-[6px]"
          onClick={() => {
            if (item.path) {
              router.push(item.path);
            }
          }}
        >
          <Icon name={item.icon} className="size-[20px]" />
          <span className="text-xs font-semibold text-[#B3B8C1]">{item.label}</span>
          {item.dot && <div className="size-2 rounded-full bg-[#31ED87]" />}
        </div>
      ))}
    </div>
  );
});
