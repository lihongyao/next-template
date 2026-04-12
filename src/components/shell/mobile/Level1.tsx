import { usePathname } from 'next/navigation';

import AppTabBar from '@/components/features/AppTabBar';
import { KeepAlive } from '@/components/features/KeepAlive';

import Header from '../components/Header';

export default function Level1({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="text-white">
      <Header />
      <KeepAlive cacheKey={pathname}>{children}</KeepAlive>
      <AppTabBar />
    </div>
  );
}
