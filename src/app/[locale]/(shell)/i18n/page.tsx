// src/app/[locale]/(home)/page.tsx
import { Link } from 'next-view-transitions';

import ClientComp from '@/components/features/ClientComp';
import LanguageSwitcher from '@/components/features/LanguageSwitcher';
import ServerComp from '@/components/features/ServerComp';
import AppHeader from '@/components/ui/AppHeader';
// import { Link } from '@/i18n/navigation';
import { Routes } from '@/libs/routes';

export default function i18nPage() {
  return (
    <div data-name="i18n-page">
      <AppHeader title="国际化" />
      <div className="h-[200px] w-full bg-orange-600"></div>
      <main className="flex flex-col items-center gap-4 p-3">
        <LanguageSwitcher />
        <div className="flex flex-col items-start gap-4 sm:flex-row">
          <ClientComp />
          <ServerComp />
        </div>
        <Link href={Routes.Details} scroll={false}>
          详情
        </Link>
        <div className="h-[200px] w-full bg-orange-500"></div>
      </main>
    </div>
  );
}
