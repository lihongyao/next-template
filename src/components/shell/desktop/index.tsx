'use client';

import { useState } from 'react';

import Header from '../components/Header';
import DesktopAside from './DesktopAside';
import Footer from './Footer';

export default function DesktopShell({ children }: { children: React.ReactNode }) {
  const [asideCollapsed, setAsideCollapsed] = useState(false);

  return (
    <div className="flex min-h-dvh text-white">
      <DesktopAside
        collapsed={asideCollapsed}
        onToggle={() => setAsideCollapsed((collapsed) => !collapsed)}
      />
      <main className="flex min-w-0 flex-1 flex-col">
        <Header />
        <div className="mx-auto w-full max-w-[1200px]">{children}</div>
        <Footer />
      </main>
    </div>
  );
}
