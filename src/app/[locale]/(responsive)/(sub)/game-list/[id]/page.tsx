import AppHeader from '@/components/ui/AppHeader';

export default async function GamePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ title: string }>;
}) {
  const id = (await params).id;
  const title = (await searchParams).title;
  return (
    <div data-name="game-details">
      <AppHeader title={title} />
      <main className="p-3">
        <p>ID: {id}</p>
        <p>标题: {title}</p>
      </main>
    </div>
  );
}
