import { Link } from '@/router';
import { Routes } from '@/router/routes';

export default function DashboardPage() {
  return (
    <div data-name="dashboard-page" className="p-4">
      <h1 className="text-white">This is Dashboard Page.</h1>
      <Link href={Routes.Home} scroll={false} className="text-white underline">
        Go to Home
      </Link>
    </div>
  );
}
