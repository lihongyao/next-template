'use client';

import AppHeader from '@/components/ui/AppHeader';

import { useConfig } from './config.provider';

export default function DataPassThroughPage() {
  const config = useConfig();
  return (
    <div data-name="data-pass-through-page" className="flex flex-col justify-start bg-amber-950">
      <AppHeader title="数据传递" />
      <main className="p-3 text-white">
        {config.version} - {config.timestamp}
      </main>
    </div>
  );
}
