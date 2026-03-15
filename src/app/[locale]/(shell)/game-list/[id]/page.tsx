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
      <p>ID: {id}</p>
      <p>标题: {title}</p>
    </div>
  );
}
