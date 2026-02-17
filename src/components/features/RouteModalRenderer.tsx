// src/components/features/RouteModalRenderer.tsx
'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { AnimatePresence, motion } from 'framer-motion';

import {
  modalBackdropVariantsDesktop,
  modalBackdropVariantsMobile,
  modalContentVariantsDesktop,
  modalContentVariantsMobile,
} from '@/animations/modal-animations';
import { ModalComponents } from '@/app/[locale]/(modals)';
import { useDevice } from '@/hooks/useDevices';
import { useSwipeBack } from '@/hooks/useSwipeBack';
import { routing } from '@/i18n/routing';

export type ModalComponentProps = {
  onClose: () => void;
};

/**
 * 根据 URL 中的 modal 段（如 /en/modal-login）渲染对应弹窗，支持多层级叠加。
 * 进入从右往左滑，关闭时由 AnimatePresence 播完 exit 再卸载。
 */
export default function RouteModalRenderer() {
  const router = useRouter();
  const pathname = usePathname();
  const pathSegments = pathname.split('/').filter(Boolean);
  const searchParams = useSearchParams();
  const searchParamsString = searchParams.toString();

  const [isAllow, setIsAllow] = useState(true);
  // 路由里没 modal 时先不拆 AnimatePresence，等 exit 播完再隐藏，否则关的时候会闪没
  const [pureHidden, setPureHidden] = useState(false);

  const modalKeys = useMemo(() => pathSegments.filter((s) => ModalComponents[s]), [pathSegments]);
  const ModalComponent = useMemo(
    () => modalKeys.filter(Boolean).map((m) => ModalComponents[m]),
    [modalKeys],
  );

  const onClose = useCallback(() => {
    if (ModalComponent.length <= 0) return;

    const canGoBack = window.history.length > 2;
    if (canGoBack) {
      router.back();
      return;
    }

    const params = new URLSearchParams(searchParamsString);
    const nextQuery = params.toString();
    const newPathSegments = [...pathSegments];
    newPathSegments.pop();
    const nextPath = `/${newPathSegments.join('/')}`;
    const finalPath = nextPath || `/${routing.defaultLocale}`;
    const nextUrl = nextQuery ? `${finalPath}?${nextQuery}` : finalPath;
    router.replace(nextUrl, { scroll: false });
  }, [ModalComponent, router, pathSegments, searchParams]);

  const { isMobile } = useDevice();
  useSwipeBack((value) => setIsAllow(!value), { enabled: ModalComponent.length > 0 });

  useEffect(() => {
    if (ModalComponent.length) {
      setPureHidden(false);
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      setIsAllow(true);
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
  }, [ModalComponent.length]);

  if (pureHidden) return null;

  return (
    <AnimatePresence
      onExitComplete={() => {
        if (ModalComponent.length <= 0) setPureHidden(true);
      }}
    >
      {ModalComponent.map((Modal, idx) => {
        const modalKey = modalKeys[idx];
        const modalSegmentIndex = pathSegments.indexOf(modalKey);
        const params = modalSegmentIndex === -1 ? [] : pathSegments.slice(modalSegmentIndex + 1);
        return (
          <motion.div
            key={modalKey}
            data-name={`modal-${modalKey}`}
            className="fixed inset-0 z-auto flex items-center justify-center"
          >
            <motion.div
              className="absolute size-full bg-black/70"
              variants={
                isAllow
                  ? isMobile
                    ? modalBackdropVariantsMobile
                    : modalBackdropVariantsDesktop
                  : undefined
              }
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={() => {
                console.log('onMaskClick');
              }}
            />
            <motion.div
              variants={
                isAllow
                  ? isMobile
                    ? modalContentVariantsMobile
                    : modalContentVariantsDesktop
                  : undefined
              }
              initial="hidden"
              animate="visible"
              exit="exit"
              style={{ willChange: 'transform, opacity' }}
            >
              <Modal onClose={onClose} params={params} />
            </motion.div>
          </motion.div>
        );
      })}
    </AnimatePresence>
  );
}
