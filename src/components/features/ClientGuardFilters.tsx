'use client';

import { useGlobalStore } from '@/stores/useGlobalStore';
import { type ComponentInfo, LoginType } from '@/types';

export default function ClientGuardFilters({
  component,
  children,
}: {
  component: ComponentInfo;
  children: React.ReactNode;
}) {
  // 判断是否登录
  const isLogin = useGlobalStore((state) => state.isLogin);
  if (
    (component.login_type === LoginType.Logged && !isLogin) ||
    (component.login_type === LoginType.UnLogged && isLogin)
  ) {
    return null;
  }

  return children;
}
