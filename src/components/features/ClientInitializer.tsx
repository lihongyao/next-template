'use client';

import { useEffect } from 'react';

import { useTranslations } from 'next-intl';

import { useEventListener, useMount } from 'ahooks';

import type { ApiErrorEventDetail } from '@/api';
import { useCheckAppVersion } from '@/hooks/useCheckAppVersion';
import useDeviceRouteAvailability from '@/hooks/useDeviceRouteAvailability';
import useModalPageAutoCollapse from '@/hooks/useModalPageAutoCollapse';
import { API_ERROR_EVENT, handleApiError } from '@/libs/error';
import { initNavigation } from '@/libs/navigation-direction';
import { SDKName, bootstrapSDK } from '@/libs/sdk-manager/core';

import { useDialog } from '../ui/Dialog';
import { notification } from '../ui/Notification';

export default function ClientInitializer() {
  const t = useTranslations();
  const [api] = notification.useNotification();
  // PC/H5 路由弹窗 & 页面响应式自动切换
  useModalPageAutoCollapse();
  // 当前设备不支持的路由自动回退
  useDeviceRouteAvailability();
  // 版本升级监听
  useCheckAppVersion();
  // 错误处理
  useEventListener(
    API_ERROR_EVENT,
    ({ detail: { error } }: CustomEvent<ApiErrorEventDetail>) => {
      handleApiError(error, api, t);
    },
    { target: () => window },
  );

  const dialog = useDialog();

  useEffect(() => {
    // dialog.open('Minors18', { maskClosable: false });
    // dialog.open('FirstVisit', { maskClosable: false });
  }, []);

  useMount(() => {
    console.log('__ClientInitializer__');
    import('vconsole').then(({ default: VConsole }) => new VConsole());
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
