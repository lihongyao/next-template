'use client';

import { type ReactNode, createContext, useContext } from 'react';

export type ConfigType = {
  version: string;
  timestamp: number;
};

const ConfigContext = createContext<ConfigType | null>(null);

export function ConfigProvider({ value, children }: { value: ConfigType; children: ReactNode }) {
  return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>;
}

export function useConfig() {
  const ctx = useContext(ConfigContext);
  if (!ctx) throw new Error('必须在 ConfigProvider 上下文中使用 useConfig');
  return ctx;
}
