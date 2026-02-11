'use client';

import { useTranslations } from 'next-intl';

export default function NotFound() {
  const t = useTranslations();
  return (
    <div className="fixed top-0 left-0 z-50 flex h-screen w-screen flex-col items-center justify-center text-3xl text-black">
      <p>404</p>
      <p>{t('title')}</p>
    </div>
  );
}
