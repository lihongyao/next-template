import type { ComponentPropsWithoutRef } from 'react';

import { cn } from '@/libs/class-helpers';

export type SkeletonProps = Omit<ComponentPropsWithoutRef<'div'>, 'children'>;

export function Skeleton({ 'aria-hidden': ariaHidden = true, className, ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden={ariaHidden}
      className={cn('ui-skeleton ui-skeleton-animated rounded-[8px]', className)}
      {...props}
    />
  );
}
