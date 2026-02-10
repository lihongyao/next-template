// src/app/[locale]/(modals)/index.ts
import type { ComponentType } from 'react';

import dynamic from 'next/dynamic';

import type { ModalComponentProps } from '@/components/features/RouteModalRenderer';

const ModalProfile = dynamic(() => import('@/app/[locale]/(modals)/profile'));
const ModalLogin = dynamic(() => import('@/app/[locale]/(modals)/login'));

export const ModalComponents: Record<string, ComponentType<ModalComponentProps>> = {
  'modal-profile': ModalProfile,
  'modal-login': ModalLogin,
};
