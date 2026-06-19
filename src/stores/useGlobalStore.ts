// src/stores/globalStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

type GlobalStateProps = {
  isLogin: boolean;
  isSidebarOpen: boolean;
  count: number;
  toggleSidebar: () => void;
  toggleLogin: () => void;
  setLogin: (isLogin: boolean) => void;
  increment: () => void;
  decrement: () => void;
};

export const useGlobalStore = create<GlobalStateProps>()(
  persist(
    immer((set) => ({
      count: 0,
      isLogin: true,
      isSidebarOpen: true,
      toggleSidebar: () =>
        set((state) => {
          state.isSidebarOpen = !state.isSidebarOpen;
        }),
      toggleLogin: () =>
        set((state) => {
          state.isLogin = !state.isLogin;
        }),
      setLogin: (isLogin: boolean) =>
        set((state) => {
          state.isLogin = isLogin;
        }),
      increment: () =>
        set((state) => {
          state.count += 1;
        }),
      decrement: () =>
        set((state) => {
          state.count -= 1;
        }),
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
