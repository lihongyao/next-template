export default async function DetailsTitle({ params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id;
  return <span>{id}</span>;
}
