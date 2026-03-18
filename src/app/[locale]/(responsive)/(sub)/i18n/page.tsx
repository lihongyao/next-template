'use client';
// src/app/[locale]/(home)/page.tsx
// import { Link } from 'next-view-transitions';
import ClientComp from '@/components/features/ClientComp';
import LanguageSwitcher from '@/components/features/LanguageSwitcher';
import AppHeader from '@/components/ui/AppHeader';
import Button from '@/components/ui/Button';
import { useRouter } from '@/router';
import { Routes } from '@/router/routes';

export default function i18nPage() {
  const router = useRouter();
  return (
    <div data-name="i18n-page">
      <AppHeader title="i18n" />
      <div className="h-[200px] w-full bg-orange-600"></div>
      <main className="flex flex-col items-center gap-4 p-3">
        <LanguageSwitcher />
        <ClientComp />
        <Button
          className="text-white"
          onClick={() => {
            router.push(Routes.Details);
          }}
        >
          详情
        </Button>
        <div className="h-[600px] w-full bg-orange-500">123123</div>
      </main>
    </div>
  );
}
