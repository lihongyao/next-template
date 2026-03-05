'use client';

import { type ReactNode, createContext, useCallback, useContext, useReducer } from 'react';

export interface ModalContextValue {
  onClose: () => void;
  setOnClose: (onClose: () => void) => void;
}

type ModalState = {
  onClose: () => void;
};

type ModalAction = { type: 'SET_ON_CLOSE'; payload: () => void };

function modalReducer(state: ModalState, action: ModalAction): ModalState {
  switch (action.type) {
    case 'SET_ON_CLOSE':
      return { onClose: action.payload };
    default:
      return state;
  }
}

const noop = () => {};

const ModalContext = createContext<ModalContextValue | null>(null);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(modalReducer, { onClose: noop });

  const setOnClose = useCallback((onClose: () => void) => {
    dispatch({ type: 'SET_ON_CLOSE', payload: onClose });
  }, []);

  const value: ModalContextValue = {
    onClose: state.onClose,
    setOnClose,
  };

  return <ModalContext.Provider value={value}>{children}</ModalContext.Provider>;
}

export function useModal(): ModalContextValue {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error('必须在 ModalProvider 上下文中使用 useModal');
  return ctx;
}
