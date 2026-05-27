'use client';

import { type ReactNode, createContext, useCallback, useContext, useMemo, useRef } from 'react';

export interface ModalContextValue {
  closeModal: () => void;
  setCloseModal: (closeModal: () => void) => void;
}

const noop = () => {};

const ModalContext = createContext<ModalContextValue | null>(null);

export function ModalProvider({ children }: { children: ReactNode }) {
  const closeModalRef = useRef<() => void>(noop);

  const setCloseModal = useCallback((closeModal: () => void) => {
    closeModalRef.current = closeModal;
  }, []);

  const closeModal = useCallback(() => {
    closeModalRef.current();
  }, []);

  const value: ModalContextValue = useMemo(
    () => ({
      closeModal,
      setCloseModal,
    }),
    [closeModal, setCloseModal],
  );

  return <ModalContext.Provider value={value}>{children}</ModalContext.Provider>;
}

export function useModal(): ModalContextValue {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error('必须在 ModalProvider 上下文中使用 useModal');
  return ctx;
}
