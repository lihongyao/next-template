import { product } from '@/api/modules';
import AppHeader from '@/components/ui/AppHeader';
import { Link } from '@/router';

export default async function NewsPage() {
  const json = await product.list();
  console.log(json);
  return (
    <div data-name="news-page">
      <AppHeader title="产品列表" />
      <main className="grid grid-cols-2 gap-3 p-3 sm:grid-cols-5 md:grid-cols-7">
        {json.products.map((item: any) => (
          <Link
            key={item.id}
            href={`/news/${item.id}?ch=123`}
            className="block bg-amber-50 text-black"
          >
            <img src={item.thumbnail} />
            {item.brand}
          </Link>
        ))}
      </main>
    </div>
  );
}
