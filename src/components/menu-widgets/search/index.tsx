'use client';
import { memo } from 'react';

import Icon from '@/components/ui/Icon';
import { cn } from '@/libs/class-helpers';

export default memo(function Search({
  className,
  collapsed,
}: {
  className?: string;
  collapsed?: boolean;
}) {
  return (
    <div
      data-name="search"
      className={cn(
        'aspect-[351/44] items-center gap-[6px] rounded-lg border border-[#ffffff20] bg-[#ffffff0d] p-3',
        collapsed ? 'hidden' : 'flex',
        className,
      )}
    >
      <Icon name="search" className="size-[14px]" color="#B3B8C1" />
      <span className="text-[#B3B8C1]">Search</span>
    </div>
  );
});
