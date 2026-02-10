import type { ComponentType, ReactNode } from 'react';

import dynamic from 'next/dynamic';

import type { Layout } from '@/configs/brands/types';

export const AppLayouts: Record<Layout, ComponentType<{ children: ReactNode }>> = {
  'top-nav': dynamic(() => import('./top-nav'), { ssr: true }),
  'side-nav': dynamic(() => import('./side-nav'), { ssr: true }),
};
