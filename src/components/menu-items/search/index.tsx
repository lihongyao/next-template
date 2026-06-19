'use client';
import { memo } from 'react';

import Icon from '@/components/ui/Icon';

export default memo(function Search() {
  return (
    <div
      data-name="search"
      className="flex aspect-[351/44] items-center gap-[6px] rounded-lg border border-[#ffffff20] bg-[#ffffff0d] p-3"
    >
      <Icon name="search" className="size-[14px]" color="#B3B8C1" />
      <span className="text-[#B3B8C1]">Search</span>
    </div>
  );
});
