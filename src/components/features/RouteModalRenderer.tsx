// src/components/features/RouteModalRenderer.tsx
'use client';

import { useCallback, useEffect, useMemo } from 'react';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { AnimatePresence, motion } from 'framer-motion';

import {
  modalBackdropVariantsRight,
  pageLayoutSlideVariants,
} from '@/animations/motion-animations';
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
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
  }, [ModalComponent]);

  if (ModalComponent.length === 0) return null;

  return (
    <AnimatePresence
      onExitComplete={() => {
        console.log('onExitComplete');
      }}
    >
      {ModalComponent.length &&
        ModalComponent.map((Modal, i) => {
          const modalKey = modalKeys[i];
          return (
            <motion.div
              data-name={`modal-${modalKey}`}
              className="fixed inset-0 z-auto flex items-center justify-center"
              key={modalKey}
            >
              {/* 遮罩层 */}
              <motion.div
                variants={modalBackdropVariantsRight}
                initial="hidden"
                animate="visible"
                exit="exit"
                onClick={() => {
                  console.log('onMaskClick');
                }}
              />
              {/* 弹窗内容 */}
              <motion.div
                variants={pageLayoutSlideVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                style={{ willChange: 'transform, opacity' }}
              >
                <Modal onCloseAction={onCloseAction} />
              </motion.div>
            </motion.div>
          );
        })}
    </AnimatePresence>
  );

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
