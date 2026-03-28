import AppHeader from '@/components/ui/AppHeader';

export default async function NewsDetailsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ch: string }>;
}) {
  const id = (await params).id;
  const ch = (await searchParams).ch;
  return (
    <div data-name="news-page">
      <AppHeader title="新闻详情" />
      <div className="p-3">
        <div>ID：{id}</div>
        <div>CH：{ch}</div>
      </div>
    </div>
  );
}
