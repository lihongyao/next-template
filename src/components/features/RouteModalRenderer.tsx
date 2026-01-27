// src/components/features/RouteModalRenderer.tsx
'use client';

import { type ComponentType, useCallback, useEffect, useMemo } from 'react';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import ModalProfile from '@/app/(modals)/profile';
import { routing } from '@/i18n/routing';
import { cn } from '@/libs/class-helpers';

export type ModalComponentProps = {
  onCloseAction: () => void;
};

const MODAL_COMPONENTS = {
  'modal-profile': ModalProfile,
} as Record<string, ComponentType<ModalComponentProps>>;

export default function RouteModalRenderer() {
  const router = useRouter();
  const pathname = usePathname();
  const pathSegments = pathname.split('/').filter(Boolean);
  const searchParams = useSearchParams();
  const searchParamsString = searchParams.toString();

  // const scroll = typeof document === "undefined" ? { left: 0, top: 0 } : useScroll(document);

  // 过滤出所有 modal-xxx
  const modalKeys = useMemo(() => pathSegments.filter((s) => MODAL_COMPONENTS[s]), [pathSegments]);
  const ModalComponent = useMemo(
    () => modalKeys.filter(Boolean).map((m) => MODAL_COMPONENTS[m]),
    [modalKeys],
  );

  const onCloseAction = useCallback(() => {
    if (ModalComponent.length <= 0) return;

    // 判断浏览器是否有可回退的历史记录（>2 表示有正常页面历史）
    const canGoBack = window.history.length > 2;
    if (canGoBack) {
      router.back();
      return;
    }

    // 手动从 URL 中移除 modal 参数，并更新路由
    const params = new URLSearchParams(searchParamsString);
    const nextQuery = params.toString();

    // 移除最后一个 modal 段
    const newPathSegments = [...pathSegments];
    newPathSegments.pop();
    const nextPath = `/${newPathSegments.join('/')}`;
    const finalPath = nextPath || `/${routing.defaultLocale}`;
    const nextUrl = nextQuery ? `${finalPath}?${nextQuery}` : finalPath;

    // 使用 replace 替换当前路由（不触发页面刷新，不滚动）
    router.replace(nextUrl, { scroll: false });
  }, [ModalComponent, router, pathSegments, searchParams]);

  useEffect(() => {
    if (ModalComponent.length) {
      // window.scrollTo({ top: scroll?.top || 0, behavior: "auto" });

      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
  }, [ModalComponent]);

  if (ModalComponent.length === 0) return null;
  return (
    <div
      data-name="RouteModalRenderer"
      className={cn(
        'fixed inset-0 z-4000 h-screen w-screen items-center justify-center bg-black/70 backdrop-blur-xs',
        ModalComponent ? 'flex' : 'hidden',
      )}
    >
      {ModalComponent.length &&
        ModalComponent.map((ModalComponent, i) => {
          const modalKey = modalKeys[i];
          return <ModalComponent key={modalKey} onCloseAction={onCloseAction} />;
        })}
    </div>
  );
}
