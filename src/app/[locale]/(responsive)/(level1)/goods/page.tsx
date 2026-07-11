import { product } from '@/api/modules';
import { Link } from '@/router';

export default async function GoodsPage() {
  const data = await product.list();
  console.log(data);
  return (
    <div data-name="goods-page">
      <div className="grid grid-cols-2 gap-3 p-3 sm:grid-cols-3 md:grid-cols-6">
        {data.products.map((item: any) => (
          <Link
            key={item.id}
            href={`/goods/${item.id}?ch=123`}
            className="block rounded-lg bg-[#212121] px-3 pb-4 text-black"
          >
            <img className="aspect-square w-full" src={item.thumbnail} />
            <div className="flex items-center gap-1">
              <span className="line-clamp-1 text-sm font-bold text-white">{item.title}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-bold text-red-500">&yen;{item.price}</span>
              <span className="text-[#B3B8C1]">{item.availabilityStatus}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
