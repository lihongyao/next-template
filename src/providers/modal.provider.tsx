'use client';

import { type ReactNode, createContext, useCallback, useContext, useReducer } from 'react';

export interface ModalContextValue {
  closeModal: () => void;
  setCloseModal: (closeModal: () => void) => void;
}

type ModalState = {
  closeModal: () => void;
};

type ModalAction = { type: 'SET_CLOSE_MODAL'; payload: () => void };

function modalReducer(state: ModalState, action: ModalAction): ModalState {
  switch (action.type) {
    case 'SET_CLOSE_MODAL':
      return { closeModal: action.payload };
    default:
      return state;
  }
}

const noop = () => {};

const ModalContext = createContext<ModalContextValue | null>(null);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(modalReducer, { closeModal: noop });

  const setCloseModal = useCallback((closeModal: () => void) => {
    dispatch({ type: 'SET_CLOSE_MODAL', payload: closeModal });
  }, []);

  const value: ModalContextValue = {
    closeModal: state.closeModal,
    setCloseModal,
  };

  return <ModalContext.Provider value={value}>{children}</ModalContext.Provider>;
}

export function useModal(): ModalContextValue {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error('必须在 ModalProvider 上下文中使用 useModal');
  return ctx;
}
