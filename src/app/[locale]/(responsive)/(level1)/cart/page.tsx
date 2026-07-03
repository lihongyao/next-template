'use client';
import { useEffect } from 'react';

import { product } from '@/api/modules';

export default function CartPage() {
  useEffect(() => {
    (async () => {
      const resp = await product.list();
      console.log(resp);
    })();
  }, []);
  return (
    <div data-name="shop-car-page" className="p-3 sm:p-0">
      <div className="flex h-10 items-center justify-center bg-white text-black">购物车</div>
    </div>
  );
}
