'use client';
import AppHeader from '@/components/ui/AppHeader';
import { Link } from '@/router';
import { Routes } from '@/router/routes';

export default function DetailsPage() {
  return (
    <div data-name="details-page">
      <AppHeader title="详情" />
      <main className="p-3 text-white">
        <p>This is Details Page.</p>
        <div className="flex flex-col gap-3">
          <Link href={Routes.Dialog}>弹框</Link>
          <Link href={Routes.GameList}>游戏列表</Link>
        </div>
      </main>
    </div>
  );
}
