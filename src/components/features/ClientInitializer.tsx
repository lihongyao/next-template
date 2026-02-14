'use client';

import { useEffect } from 'react';

import { useMount } from 'ahooks';

export default function ClientInitializer() {
  useEffect(() => {
    console.log('___');
  }, []);
  useMount(() => {
    // TODO: 这里可以放一些全局只需要执行一次的客户端初始化逻辑，比如说监听全局事件、初始化第三方库等
    console.log('ClientInitializer');
  });
  return null;
}
