// src/app/[locale]/(modals)/index.ts
import type { ComponentType } from 'react';

import dynamic from 'next/dynamic';

const ModalProfile = dynamic(() => import('@/app/[locale]/(modals)/profile'));
const ModalLogin = dynamic(() => import('@/app/[locale]/(modals)/login'));
const ModalGameDetails = dynamic(() => import('@/app/[locale]/(modals)/game-details'));
const ModalRegister = dynamic(() => import('@/app/[locale]/(modals)/register'));

export const ModalComponents: Record<string, ComponentType> = {
  'modal-register': ModalRegister,
  'modal-profile': ModalProfile,
  'modal-login': ModalLogin,
  'modal-game-details': ModalGameDetails,
};
