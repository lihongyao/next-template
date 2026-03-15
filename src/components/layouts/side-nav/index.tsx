import AppTabBar from '@/components/features/AppTabBar';

import Header from './Header';

export default function SideNavLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <Header />
      <main className="w-full max-w-[1200px] flex-1 sm:mx-auto">{children}</main>
      <AppTabBar />
    </div>
  );
}
