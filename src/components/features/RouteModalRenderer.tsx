'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { useSearchParams } from 'next/navigation';

import { AnimatePresence, motion } from 'framer-motion';

import {
  modalBackdropVariantsDesktop,
  modalBackdropVariantsMobile,
  modalContentVariantsDesktop,
  modalContentVariantsMobile,
} from '@/animations/modal-animations';
import { ModalComponents } from '@/app/[locale]/(modals)';
import { ZIndex } from '@/constants';
import { useSwipeBack } from '@/hooks/useSwipeBack';
import {
  MOBILE_MODAL_HISTORY_CHANGE_EVENT,
  isRouteModalHistoryEntry,
} from '@/libs/mobile-modal-history';
import {
  getRouteModalClosePathname,
  getRouteModalRenderPath,
} from '@/libs/modal-page-routes-utils';
import { useDevice } from '@/providers/device.provider';
import { useModal } from '@/providers/modal.provider';
import { usePathname, useRouter } from '@/router';

/**
 * 按当前地址的 route modal 策略渲染弹窗，支持多层叠。
 * 进场右滑、退场等 AnimatePresence exit 播完再卸。isMobile 为 null 时不画。
 */
export default function RouteModalRenderer() {
  const router = useRouter();
  const pathname = usePathname();
  const { isMobile } = useDevice();
  const [viewportIsMobile, setViewportIsMobile] = useState<boolean | null>(null);
  const renderAsMobile = viewportIsMobile ?? isMobile === true;
  const [nativeModalPathname, setNativeModalPathname] = useState<string | null>(() =>
    typeof window === 'undefined' ? null : window.location.pathname,
  );
  const modalPathname = nativeModalPathname ?? pathname;
  const modalRenderPath = useMemo(
    () => getRouteModalRenderPath(modalPathname, renderAsMobile),
    [modalPathname, renderAsMobile],
  );
  const pathSegments = useMemo(
    () => modalRenderPath?.split('/').filter(Boolean) ?? [],
    [modalRenderPath],
  );
  const searchParamsString = useSearchParams().toString();
  const { setCloseModal } = useModal();

  const [isAllow, setIsAllow] = useState(true);
  const [pureHidden, setPureHidden] = useState(false); // 等 exit 播完再隐藏，否则关时会闪

  const modalKeys = useMemo(() => pathSegments.filter((s) => ModalComponents[s]), [pathSegments]);
  const modalComponents = useMemo(
    () =>
      modalKeys.filter(Boolean).map((m) => {
        return ModalComponents[m];
      }),
    [modalKeys],
  );

  useEffect(() => {
    const mobile = window.matchMedia('(max-width: 767px)');
    const updateViewport = () => setViewportIsMobile(mobile.matches);
    updateViewport();
    mobile.addEventListener('change', updateViewport);
    return () => mobile.removeEventListener('change', updateViewport);
  }, []);

  useEffect(() => {
    const syncNativeModalPathname = () => {
      setNativeModalPathname(window.location.pathname);
    };

    syncNativeModalPathname();
    window.addEventListener(MOBILE_MODAL_HISTORY_CHANGE_EVENT, syncNativeModalPathname);
    window.addEventListener('popstate', syncNativeModalPathname);
    return () => {
      window.removeEventListener(MOBILE_MODAL_HISTORY_CHANGE_EVENT, syncNativeModalPathname);
      window.removeEventListener('popstate', syncNativeModalPathname);
    };
  }, []);

  useEffect(() => {
    if (nativeModalPathname === pathname) {
      setNativeModalPathname(null);
    }
  }, [nativeModalPathname, pathname]);

  const closeModal = useCallback(() => {
    if (!modalComponents.length) return;
    if (isRouteModalHistoryEntry()) {
      router.back();
      return;
    }

    const params = new URLSearchParams(searchParamsString);
    const nextQuery = params.toString();
    const nextPath = getRouteModalClosePathname(modalPathname, renderAsMobile) ?? '/';
    const url = nextQuery ? `${nextPath}?${nextQuery}` : nextPath;
    router.replace(url, { scroll: false });
  }, [modalComponents.length, router, searchParamsString, modalPathname, renderAsMobile]);

  useEffect(() => {
    setCloseModal(closeModal);
  }, [closeModal, setCloseModal]);

  const handleSwipeBack = useCallback((value: boolean) => {
    setIsAllow(!value);
  }, []);

  useSwipeBack(handleSwipeBack, { enabled: modalComponents.length > 0 });

  useEffect(() => {
    if (modalComponents.length) {
      setPureHidden(false);
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      setIsAllow(true);
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
  }, [modalComponents.length]);

  if (pureHidden) return null;
  if (isMobile === null) return null;

  const backdropVariants = isAllow
    ? renderAsMobile
      ? modalBackdropVariantsMobile
      : modalBackdropVariantsDesktop
    : undefined;
  const contentVariants = isAllow
    ? renderAsMobile
      ? modalContentVariantsMobile
      : modalContentVariantsDesktop
    : undefined;

  return (
    <AnimatePresence
      onExitComplete={() => {
        if (!modalComponents.length) setPureHidden(true);
      }}
    >
      {modalComponents.map((Modal, idx) => {
        const modalKey = modalKeys[idx];

        return (
          <motion.div
            key={modalKey}
            data-name={`modal-${modalKey}`}
            className="fixed inset-0 z-auto flex items-center justify-center"
            style={{ zIndex: ZIndex.Dialog }}
          >
            <motion.div
              className="absolute size-full bg-black/70"
              variants={backdropVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={closeModal}
            />
            <motion.div
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={{ willChange: 'transform, opacity' }}
            >
              <Modal />
            </motion.div>
          </motion.div>
        );
      })}
    </AnimatePresence>
  );
}
