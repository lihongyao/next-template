import { Suspense } from 'react';

import { product } from '@/api/modules';

import Content from './Content';

export default function GoodsPage() {
  const json = product.list();
  return (
    <div data-name="goods-page">
      <Suspense fallback={<div>Loading...</div>}>
        <Content json={json} />
      </Suspense>
    </div>
  );
}
