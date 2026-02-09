// src/app/[locale]/(home)/page.tsx
import ClientComp from '@/components/features/ClientComp';
import LanguageSwitcher from '@/components/features/LanguageSwitcher';
import ServerComp from '@/components/features/ServerComp';

export default function i18nPage() {
  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <LanguageSwitcher />
      <div className="flex items-start gap-4">
        <ClientComp />
        <ServerComp />
      </div>
    </div>
  );
}
