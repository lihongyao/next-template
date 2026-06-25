'use client';

import Button from '@/components/ui/Buttons/BaseButton';
import { useRouter } from '@/router';
import { Routes } from '@/router/routes';

export default function ErrorPage() {
  const router = useRouter();
  return (
    <div
      data-name="error-page"
      className="flex h-screen w-screen flex-col items-center justify-center gap-2"
    >
      <h1 className="text-3xl text-orange-400">Something went wrong ～</h1>
      <Button onClick={() => router.replace(Routes.Home)}>Home</Button>
    </div>
  );
}
