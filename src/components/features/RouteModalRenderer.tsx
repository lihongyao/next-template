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
import { routing } from '@/i18n/routing';
import { getH5PathForPcPath } from '@/libs/modal-page-routes-utils';
import { useDevice } from '@/providers/device.provider';
import { useModal } from '@/providers/modal.provider';
import { usePathname, useRouter } from '@/router';

/** h5 下 pathname 为 pc 格式时，按 ModalPageRoutes 转为 modal 路径用于渲染 */
function getEffectivePathForModals(pathname: string, isMobile: boolean): string[] {
  const raw = pathname.split('/').filter(Boolean);
  if (!isMobile) return raw;
  const h5Path = getH5PathForPcPath(pathname);
  return h5Path ? h5Path.split('/').filter(Boolean) : raw;
}

/**
 * 按 URL 里的 modal 段（如 /en/modal-login）渲染弹窗，支持多层叠。
 * 进场右滑、退场等 AnimatePresence exit 播完再卸。isMobile 为 null 时不画。
 * h5 下当 pathname 为 pc 格式（如 /game-list）时，会按 ModalPageRoutes 映射为 modal 路径渲染。
 */
export default function RouteModalRenderer() {
  const router = useRouter();
  const pathname = usePathname();
  const { isMobile } = useDevice();
  const pathSegments = useMemo(
    () => getEffectivePathForModals(pathname, isMobile === true),
    [pathname, isMobile],
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

  const closeModal = useCallback(() => {
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
    setCloseModal(closeModal);
  }, [closeModal, setCloseModal]);

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

        // return <Modal key={modalKey} />;

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
