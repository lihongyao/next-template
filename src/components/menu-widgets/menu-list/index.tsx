'use client';
import { memo } from 'react';

import type { SvgPathName } from '@/assets/svg/generated';
import Icon from '@/components/ui/Icon';
import { useRouter } from '@/router';

export type MenuListProps = {
  items: Array<{ label: string; icon: SvgPathName; dot?: boolean; path?: string }>;
};
export default memo(function MenuList({
  collapsed,
  data,
}: {
  collapsed?: boolean;
  data: MenuListProps;
}) {
  const router = useRouter();
  return (
    <div
      data-name="menu-list "
      className="flex flex-col rounded-lg bg-[#ffffff0d] px-3 py-2 sm:bg-transparent sm:p-0"
    >
      {data.items.map((item, index) => (
        <div
          key={index}
          className="group flex h-[46px] cursor-pointer items-center justify-start gap-[6px] rounded-md hover:from-[#31ed8733] hover:to-[#31ed8700] sm:bg-linear-90 sm:px-3 sm:py-2"
          onClick={() => {
            if (item.path) {
              router.push(item.path);
            }
          }}
        >
          <Icon name={item.icon} className="size-[20px] text-[#B3B8C1] group-hover:text-white" />
          {!collapsed && (
            <span className="text-sm font-semibold text-[#B3B8C1] group-hover:text-white">
              {item.label}
            </span>
          )}
          {item.dot && <div className="size-2 rounded-full bg-[#31ED87]" />}
        </div>
      ))}
    </div>
  );
});
