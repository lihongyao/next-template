'use client';

import { useEventListener, useMount } from 'ahooks';

import useModalPageAutoCollapse from '@/hooks/useModalPageAutoCollapse';
import { installViewTransitionPatch } from '@/libs/viewTransition';
import { useGlobalStore } from '@/stores/useGlobalStore';

// import { installViewTransitionPatch } from '@/libs/animate';

export default function ClientInitializer() {
  const isZD = useGlobalStore((s) => s.isZD);
  useModalPageAutoCollapse();

  useEventListener(
    'popstate',
    () => {
      console.log(isZD);
      console.log('popstate');
    },
    {},
  );
  useMount(() => {
    console.log('__ClientInitializer__');
    import('vconsole').then(({ default: VConsole }) => new VConsole());
    installViewTransitionPatch();

    // TODO: 这里可以放一些全局只需要执行一次的客户端初始化逻辑，比如说监听全局事件、初始化第三方库等
  });

  return null;
}
