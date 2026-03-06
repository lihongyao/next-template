'use client';
import Button from '@/components/ui/Button';
import { useModalRoutes } from '@/hooks/useModalRoutes';
import { useRouter } from '@/i18n/navigation';
import { Routes } from '@/libs/routes';

// src/components/layout/SideNavLayout.tsx
export default function SideNavLayout({ children }: { children: React.ReactNode }) {
  const { mergeRouteIntoCurrentPath } = useModalRoutes();
  const router = useRouter();
  return (
    <div className="min-h-screen">
      <header className="flex h-14 items-center justify-between border-b px-3">
        <h1>Classic Layout</h1>
        <div>
          <Button
            onClick={() => {
              router.push(mergeRouteIntoCurrentPath(Routes.ModalLogin), { scroll: false });
            }}
          >
            登录
          </Button>
        </div>
      </header>
      <main className="m-4">{children}</main>
    </div>
  );
}
