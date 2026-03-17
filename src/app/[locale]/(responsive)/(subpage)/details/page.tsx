import { Routes } from '@/libs/routes';
import { Link } from '@/router';

export default function DetailsPage() {
  return (
    <div data-name="details-page">
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
