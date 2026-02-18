export default async function GamePage({ params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id;
  return <div>ID: {id}</div>;
}
