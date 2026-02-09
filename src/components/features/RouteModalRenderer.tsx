// src/components/features/RouteModalRenderer.tsx
'use client';

import { useCallback, useEffect, useMemo, useRef } from 'react';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { ModalComponents } from '@/app/[locale]/(modals)';
import { routing } from '@/i18n/routing';
import { cn } from '@/libs/class-helpers';

export type ModalComponentProps = {
  onCloseAction: () => void;
};

export default function RouteModalRenderer() {
  const router = useRouter();
  const pathname = usePathname();
  const pathSegments = pathname.split('/').filter(Boolean);
  const searchParams = useSearchParams();
  const searchParamsString = searchParams.toString();

  // const scrollResult = useScroll(typeof document !== 'undefined' ? document : null);
  // const scroll = scrollResult || { top: 0 };
  const scrollTopRef = useRef(0);

  useEffect(() => {
    // 监听 body 滚动事件，保持 scroll.top 的更新
    const handleScroll = () => {
      scrollTopRef.current =
        window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
      // console.log('滚动事件触发，更新 scrollTopRef:', scrollTopRef.current);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      console.log('RouteModalRenderer 卸载，移除滚动事件监听');
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // 过滤出所有 modal-xxx
  const modalKeys = useMemo(() => pathSegments.filter((s) => ModalComponents[s]), [pathSegments]);

  const ModalComponent = useMemo(() => {
    return modalKeys.filter(Boolean).map((m) => ModalComponents[m]);
  }, [modalKeys]);

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
      window.scrollTo({ top: scrollTopRef.current || 0, behavior: 'auto' });
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
