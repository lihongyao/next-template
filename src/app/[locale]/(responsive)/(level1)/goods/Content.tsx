import { use } from 'react';

import { Link } from '@/router';

export default function Content({ json }: { json: any }) {
  const data = use(json);
  return (
    <main className="grid grid-cols-2 gap-3 p-3 sm:grid-cols-5 md:grid-cols-7">
      {data.products.map((item: any) => (
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
  );
}
