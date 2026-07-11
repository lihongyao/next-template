// src/app/[locale]/(modals)/index.ts
import type { ComponentType } from 'react';

import dynamic from 'next/dynamic';

const loadModal = (name: string) => dynamic(() => import(`@/app/[locale]/(modals)/${name}`));

export const ModalComponents: Record<string, ComponentType> = {
  register: loadModal('register'),
  profile: loadModal('profile'),
  login: loadModal('login'),
  'game-list-swiper': loadModal('game-list-swiper'),
  'game-details': loadModal('game-details'),
  'news-details': loadModal('news-details'),
  'goods-details': loadModal('goods-details'),
};
