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
import { useSwipeBack } from '@/hooks/useSwipeBack';
import { routing } from '@/i18n/routing';
import { useDevice } from '@/providers/device.provider';
import { useModal } from '@/providers/modal.provider';

/**
 * 按 URL 里的 modal 段（如 /en/modal-login）渲染弹窗，支持多层叠。
 * 进场右滑、退场等 AnimatePresence exit 播完再卸。isMobile 为 null 时不画。
 */
export default function RouteModalRenderer() {
  const router = useRouter();
  const pathname = usePathname();
  const pathSegments = pathname.split('/').filter(Boolean);
  const searchParamsString = useSearchParams().toString();
  const { isMobile } = useDevice();
  const { setOnClose } = useModal();

  const [isAllow, setIsAllow] = useState(true);
  const [pureHidden, setPureHidden] = useState(false); // 等 exit 播完再隐藏，否则关时会闪

  const modalKeys = useMemo(() => pathSegments.filter((s) => ModalComponents[s]), [pathSegments]);
  const modalComponents = useMemo(
    () => modalKeys.filter(Boolean).map((m) => ModalComponents[m]),
    [modalKeys],
  );

  const onClose = useCallback(() => {
    if (!modalComponents.length) return;
    if (window.history.length > 2) {
      router.back();
      return;
    }
    const params = new URLSearchParams(searchParamsString);
    const nextQuery = params.toString();
    const newPathSegments = [...pathSegments];
    newPathSegments.pop();
    const nextPath = `/${newPathSegments.join('/')}` || `/${routing.defaultLocale}`;
    router.replace(nextQuery ? `${nextPath}?${nextQuery}` : nextPath, { scroll: false });
  }, [modalComponents.length, router, pathSegments, searchParamsString]);

  useEffect(() => {
    setOnClose(onClose);
  }, [onClose, setOnClose]);

  useSwipeBack((value) => setIsAllow(!value), { enabled: modalComponents.length > 0 });

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
    ? isMobile
      ? modalBackdropVariantsMobile
      : modalBackdropVariantsDesktop
    : undefined;
  const contentVariants = isAllow
    ? isMobile
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
          >
            <motion.div
              className="absolute size-full bg-black/70"
              variants={backdropVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={onClose}
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
