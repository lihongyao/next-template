// src/stores/globalStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

type GlobalStateProps = {
  isZD: boolean;
  setIsZD: (isZD: boolean) => void;
  isLogin: boolean;
  isSidebarOpen: boolean;
  count: number;
  direction: 'forward' | 'backward';
  setDirection: (direction: 'forward' | 'backward') => void;
  toggleSidebar: () => void;
  toggleLogin: () => void;
  increment: () => void;
  decrement: () => void;
};

export const useGlobalStore = create<GlobalStateProps>()(
  persist(
    immer((set) => ({
      count: 0,
      isZD: true,
      isLogin: true,
      isSidebarOpen: true,
      direction: 'forward',
      setDirection: (direction: 'forward' | 'backward') =>
        set((state) => {
          state.direction = direction;
        }),
      toggleSidebar: () =>
        set((state) => {
          state.isSidebarOpen = !state.isSidebarOpen;
        }),
      toggleLogin: () =>
        set((state) => {
          state.isLogin = !state.isLogin;
        }),
      increment: () =>
        set((state) => {
          state.count += 1;
        }),
      decrement: () =>
        set((state) => {
          state.count -= 1;
        }),
      setIsZD: (isZD) => set({ isZD }),
    })),
    {
      // 存储名称
      name: 'global-store',
      // 筛选持久化值
      partialize: (state) => ({
        isLogin: state.isLogin,
      }),
    },
  ),
);
