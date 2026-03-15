import AppHeader from '@/components/ui/AppHeader';
import { Routes } from '@/libs/routes';
import { Link } from '@/router';

export default function DetailsPage() {
  return (
    <div data-name="details-page">
      <AppHeader title="详情" />
      <main className="p-3 text-white">
        <p>This is Details Page.</p>
        <Link href={Routes.Dialog}>弹框1</Link>
      </main>
    </div>
  );
}
