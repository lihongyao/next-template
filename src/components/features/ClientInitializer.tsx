'use client';

import { useMount } from 'ahooks';

import useModalPageAutoCollapse from '@/hooks/useModalPageAutoCollapse';
import { initNavigation } from '@/libs/navigation-direction';

// import { installViewTransitionPatch } from '@/libs/animate';

export default function ClientInitializer() {
  useModalPageAutoCollapse();

  useMount(() => {
    console.log('__ClientInitializer__');
    import('vconsole').then(({ default: VConsole }) => new VConsole());
    // installViewTransitionPatch();
    initNavigation();

    // TODO: 这里可以放一些全局只需要执行一次的客户端初始化逻辑，比如说监听全局事件、初始化第三方库等
  });

  return null;
}
