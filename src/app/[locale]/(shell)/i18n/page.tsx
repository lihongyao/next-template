'use client';
// src/app/[locale]/(home)/page.tsx
// import { Link } from 'next-view-transitions';
import ClientComp from '@/components/features/ClientComp';
import LanguageSwitcher from '@/components/features/LanguageSwitcher';
import AppHeader from '@/components/ui/AppHeader';
import Button from '@/components/ui/Button';
import useAppRouter from '@/hooks/useAppRouter';
import { Routes } from '@/libs/routes';

export default function i18nPage() {
  const router = useAppRouter();
  return (
    // <PageWrapper>
    <div data-name="i18n-page">
      <AppHeader title="国际化" />
      <div className="h-[200px] w-full bg-orange-600"></div>
      <main className="flex flex-col items-center gap-4 p-3">
        <LanguageSwitcher />
        <div className="flex flex-col items-start gap-4 sm:flex-row">
          <ClientComp />
          {/* <ServerComp /> */}
        </div>
        <Button
          className="text-white"
          onClick={() => {
            router.push(Routes.Details);
          }}
        >
          详情
        </Button>
        <div className="h-[200px] w-full bg-orange-500"></div>
      </main>
    </div>
    // {/* </PageWrapper> */}
  );
}
