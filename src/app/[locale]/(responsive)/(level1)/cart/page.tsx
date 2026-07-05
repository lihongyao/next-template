import { product } from '@/api/modules';
import { Link } from '@/router';

export default async function GoodsPage() {
  const json = await product.list();
  return (
    <div data-name="goods-page">
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
