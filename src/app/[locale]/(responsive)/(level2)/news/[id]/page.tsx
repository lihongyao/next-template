import { product } from '@/api/modules';
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
  const details = await product.details(+id);
  console.log(details);
  return (
    <div data-name="news-page">
      <AppHeader title="新闻详情" />
      <main>
        <div className="bg-amber-50">
          <img src={details.images[0]} />
        </div>
        <div>
          <div>{details.title}</div>
          <div className="text-red-500">{details.price}</div>
          <div>{details.description}</div>
        </div>

        {/* 评论 */}
        <div className="flex flex-col gap-2 p-3 text-black">
          {details.reviews.map((item: any, index: number) => {
            return (
              <div className="bg-amber-50" key={index}>
                <header>
                  <div>{item.reviewerName}</div>
                  <div>{item.reviewerEmail}</div>
                  <div>{item.date}</div>
                </header>
                <div>{item.rating}</div>
                <div>{item.comment}</div>
              </div>
            );
          })}
        </div>
      </main>
      <div className="p-3">
        <div>ID：{id}</div>
        <div>CH：{ch}</div>
      </div>
    </div>
  );
}
