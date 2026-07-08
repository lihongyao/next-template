import { use } from 'react';

import { Link } from '@/router';

export default function Content({ json }: { json: any }) {
  const data = use(json);
  console.log(data);
  return (
    <main className="grid grid-cols-2 gap-3 p-3 sm:grid-cols-3 md:grid-cols-5">
      {data.products.map((item: any) => (
        <Link
          key={item.id}
          href={`/news/${item.id}?ch=123`}
          className="block rounded-lg bg-[#212121] px-4 pb-4 text-black"
        >
          <img className="h-auto w-full" src={item.thumbnail} />
          <div className="line-clamp-1 font-bold text-white">{item.title}</div>
          <div className="flex items-center justify-between">
            <div className="text-lg font-bold text-red-500">&yen;{item.price}</div>
            <div className="text-[#B3B8C1]">折扣:{item.discountPercentage}%</div>
          </div>
        </Link>
      ))}
    </main>
  );
}
