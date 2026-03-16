import AppTabBar from '@/components/features/AppTabBar';

import Header from './Header';

export default function SideNavLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <Header />
      <main className="flex-1 px-3">
        <div className="mx-auto w-full max-w-[1200px]">{children}</div>
      </main>
      <AppTabBar />
    </div>
  );
}
