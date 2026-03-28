'use client';
import AppHeader from '@/components/ui/AppHeader';
import { useModalRoutes } from '@/hooks/useModalRoutes';
import { useRouter } from '@/router';
import { ModalPageRoutes } from '@/router/routes';

export default function NewsPage() {
  const router = useRouter();
  const { resolveRouteForCurrentDevice } = useModalRoutes();
  return (
    <div data-name="news-page">
      <AppHeader title="新闻列表" />
      <main className="grid grid-cols-3 gap-3 p-3 sm:grid-cols-5 md:grid-cols-7">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            className="flex aspect-[100/130] items-center justify-center rounded-md bg-black text-gray-600"
            key={i}
            onClick={() => {
              const jumpUrl = resolveRouteForCurrentDevice(ModalPageRoutes['news-details']);
              router.push(`${jumpUrl}/${i + 1}?ch=CBA`);
            }}
          >
            NEWS {i + 1}
          </div>
        ))}
      </main>
    </div>
  );
}
