'use client';

import { useEffect } from 'react';

import { useMount } from 'ahooks';

import { useCheckAppVersion } from '@/hooks/useCheckAppVersion';
import useModalPageAutoCollapse from '@/hooks/useModalPageAutoCollapse';
import { initNavigation } from '@/libs/navigation-direction';
import { SDKName, bootstrapSDK } from '@/libs/sdk-manager/core';

// import { installViewTransitionPatch } from '@/libs/animate';

export default function ClientInitializer() {
  // PC/H5 路由弹窗 & 页面响应式自动切换
  useModalPageAutoCollapse();
  // 版本升级监听
  useCheckAppVersion();

  useEffect(() => {
    // throw new Error('🧨 Sentry test error from client');
  }, []);

  useMount(() => {
    console.log('__ClientInitializer__');
    import('vconsole').then(({ default: VConsole }) => new VConsole());
    // installViewTransitionPatch();
    initNavigation();

    bootstrapSDK({
      // debug: process.env.NODE_ENV === 'development',
      debug: true,
      config: {
        [SDKName.JsBridge]: {
          onLoaded: () => {
            console.log('[JsBridgeSDK] onLoaded >>> ');
          },
        },
      },
    });

    // TODO: 这里可以放一些全局只需要执行一次的客户端初始化逻辑，比如说监听全局事件、初始化第三方库等
  });

  return null;
}
